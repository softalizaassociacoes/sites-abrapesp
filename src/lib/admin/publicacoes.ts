import "server-only";
import { publicacoesMigradas, type Item } from "@/lib/conteudo";
import {
  gravarArquivo,
  gravarPublicacoes,
  lerJson,
} from "@/lib/admin/repositorio";
import type { Removido } from "@/lib/mesclar-publicacoes";
import {
  montar,
  porData,
  proximoId,
  type ItemDoPainel,
  type Rascunho,
} from "@/lib/publicacoes-painel";

/**
 * Criação e edição das publicações feitas pelo painel — o lado que grava.
 *
 * A forma dos dados e as funções de cálculo ficam em
 * src/lib/publicacoes-painel.ts, que o navegador também pode carregar.
 */

const ARQUIVO = "src/conteudo-editavel/publicacoes.json";
const ARQUIVO_REMOVIDOS = "src/conteudo-editavel/removidos.json";

export async function carregar(): Promise<ItemDoPainel[]> {
  return lerJson<ItemDoPainel[]>(ARQUIVO, []);
}

/**
 * Duas publicações no mesmo endereço.
 *
 * Tem de ser um tipo próprio: lançado como Error comum, sobe pela ação e
 * vira 500 — tela de falha, sem dizer nada. Quem repetisse um título
 * bateria nisso sem entender por quê.
 */
export class ErroDeRota extends Error {}

/** Grava uma publicação nova ou substitui a existente, pela rota. */
export async function salvar(
  rascunho: Rascunho,
  autor: string,
): Promise<ItemDoPainel> {
  const todas = await carregar();
  const agora = new Date().toISOString();
  const anterior = rascunho.rota
    ? todas.find((i) => i.rota === rascunho.rota)
    : undefined;

  /* O endereço de um item que já foi ao ar não muda porque o título
     mudou: quebraria link compartilhado. Rascunho que nunca foi publicado
     ainda pode ganhar a rota do título novo. */
  const rota =
    rascunho.rota ?? (anterior?.publicado ? anterior.rota : undefined);

  const item = montar(
    { ...rascunho, rota },
    anterior?.id ?? proximoId(todas),
    anterior?.criadoPor ?? autor,
    anterior?.criadoEm ?? agora,
  );

  const conflito = todas.find(
    (i) => i.rota === item.rota && i.rota !== anterior?.rota,
  );
  if (conflito) {
    throw new ErroDeRota(
      `Já existe outra publicação do painel neste endereço (${item.rota}). Mude o título.`,
    );
  }

  const restantes = todas.filter((i) => i.rota !== anterior?.rota);
  const verbo = anterior
    ? "Atualiza"
    : item.publicado
      ? "Publica"
      : "Guarda rascunho de";

  await gravarPublicacoes(
    porData([...restantes, item]),
    `${verbo} ${item.tipo} "${item.titulo}"`,
    autor,
  );
  return item;
}

export async function remover(rota: string, autor: string): Promise<void> {
  const todas = await carregar();
  const alvo = todas.find((i) => i.rota === rota);
  if (!alvo) return;
  await gravarPublicacoes(
    todas.filter((i) => i.rota !== rota),
    `Remove ${alvo.tipo} "${alvo.titulo}"`,
    autor,
  );
}

/**
 * Liga ou desliga a publicação do painel que mora nesta rota, sem mexer
 * em mais nada — é o interruptor da listagem.
 *
 * Devolve falso quando não há item do painel nesta rota (item só migrado:
 * quem liga e desliga é a lápide, em removerDoSite/restaurar).
 */
export async function definirPublicado(
  rota: string,
  ligar: boolean,
  autor: string,
): Promise<boolean> {
  const todas = await carregar();
  const alvo = todas.find((i) => i.rota === rota);
  if (!alvo) return false;
  if (alvo.publicado === ligar) return true;

  await gravarPublicacoes(
    todas.map((i) => (i.rota === rota ? { ...i, publicado: ligar } : i)),
    `${ligar ? "Publica" : "Tira do ar"} ${alvo.tipo} "${alvo.titulo}"`,
    autor,
  );
  return true;
}

/* ------------------------------------------------------------------ */
/* Conteúdo migrado: corrigir e tirar do ar                            */
/* ------------------------------------------------------------------ */

export async function removidos(): Promise<Removido[]> {
  return lerJson<Removido[]>(ARQUIVO_REMOVIDOS, []);
}

async function gravarRemovidos(
  lista: Removido[],
  mensagem: string,
  autor: string,
): Promise<void> {
  await gravarArquivo(
    ARQUIVO_REMOVIDOS,
    `${JSON.stringify(lista, null, 2)}\n`,
    mensagem,
    autor,
  );
}

/** O item migrado com esta rota, se houver. */
export function migradaPorRota(rota: string): Item | undefined {
  return publicacoesMigradas.find((i) => i.rota === rota);
}

/**
 * Tira do site o que mora nesta rota, venha do painel ou da migração.
 *
 * Para item do painel, a entrada some da lista. Para item migrado, que é
 * gerado e seria recriado na próxima geração, fica uma lápide em
 * removidos.json — e a mesclagem do site pula a rota. Quando os dois
 * existem (uma correção por cima de um migrado), os dois caminhos rodam,
 * senão remover a correção só faria o original voltar.
 */
export async function removerDoSite(
  rota: string,
  titulo: string,
  autor: string,
): Promise<void> {
  await remover(rota, autor);
  if (migradaPorRota(rota)) {
    await marcarForaDoAr(rota, titulo, autor);
  }
}

/**
 * Só a lápide, sem tocar no que o painel escreveu nesta rota.
 *
 * A escrita filtra a rota antes de acrescentar, em vez de confiar num "já
 * existe?": a leitura do GitHub logo depois de uma gravação pode vir
 * velha, e a conferência mentirosa duplicaria a lápide.
 */
export async function marcarForaDoAr(
  rota: string,
  titulo: string,
  autor: string,
): Promise<void> {
  const lista = await removidos();
  if (lista.some((r) => r.rota === rota)) return;
  await gravarRemovidos(
    [
      ...lista.filter((r) => r.rota !== rota),
      { rota, titulo, por: autor, em: new Date().toISOString() },
    ],
    `Tira do ar "${titulo}"`,
    autor,
  );
}

/**
 * Desfaz a remoção de um item migrado: a lápide sai e ele volta ao site.
 *
 * A lápide recém-posta pode ainda não aparecer na leitura — o GitHub leva
 * alguns segundos para servir o que acabou de gravar, e é assim que um
 * desliga-e-liga rápido "religa" sem gravar nada. Por isso a releitura
 * insiste um pouco antes de concluir que não há o que desfazer.
 */
export async function restaurar(
  rota: string,
  autor: string,
): Promise<{ desfez: boolean; lidas: number }> {
  let lidas = 0;
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const lista = await removidos();
    lidas = lista.length;
    const alvo = lista.find((r) => r.rota === rota);
    if (alvo) {
      await gravarRemovidos(
        lista.filter((r) => r.rota !== rota),
        `Devolve ao ar "${alvo.titulo}"`,
        autor,
      );
      return { desfez: true, lidas };
    }
    if (tentativa < 3) await new Promise((r) => setTimeout(r, 1200));
  }
  return { desfez: false, lidas };
}
