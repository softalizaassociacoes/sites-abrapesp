/**
 * Acesso ao conteúdo do site, de duas procedências.
 *
 * src/conteudo/publicacoes.json é gerado por scripts/extrair-legado.mjs a
 * partir do site estático antigo (pasta legado/) e fica versionado: o
 * build não depende de nada externo. É sobrescrito inteiro a cada geração.
 *
 * src/conteudo-editavel/ é escrito pelo painel (/admin) e nunca gerado. A
 * separação é o que impede a próxima geração de apagar o que a ABRAPESP
 * publicou — ver src/conteudo-editavel/LEIA-ME.md.
 */
import publicacoesJson from "@/conteudo/publicacoes.json";
import publicacoesDoPainel from "@/conteudo-editavel/publicacoes.json";
import removidosJson from "@/conteudo-editavel/removidos.json";
import { mesclarPublicacoes, type Removido } from "@/lib/mesclar-publicacoes";

/**
 * As duas seções editoriais do site.
 *
 * "notícia" é o noticiário da associação; "coluna" é a Coluna de
 * Associados, texto assinado por quem é sócio. Vieram separadas assim do
 * site antigo e as duas têm listagem própria.
 */
export type TipoPublicacao = "noticia" | "coluna";

export type Capa = {
  src: string;
  alt: string;
  largura?: number;
  altura?: number;
};

export type Item = {
  id: number;
  origem: "post";
  tipo: TipoPublicacao;
  slug: string;
  rota: string;
  /** O endereço no site estático antigo, para o redirecionamento. */
  rotaAntiga: string | null;
  titulo: string;
  resumo: string;
  data: string | null;
  atualizado: string | null;
  capa: Capa | null;
  html: string;
};

/** Como cada seção se chama nas telas, e onde ela mora. Um lugar só. */
export const SECOES: Record<
  TipoPublicacao,
  { nome: string; singular: string; prefixo: string; listagem: string }
> = {
  noticia: {
    nome: "Notícias",
    singular: "Notícia",
    prefixo: "/noticias",
    listagem: "/noticias",
  },
  coluna: {
    nome: "Coluna de Associados",
    singular: "Coluna",
    prefixo: "/coluna-de-associados",
    listagem: "/coluna-de-associados",
  },
};

/**
 * Publicações do site, as do painel na frente.
 *
 * Mesma rota nas duas procedências significa que alguém corrigiu pelo
 * painel algo que veio da migração: vale a do painel, senão uma nova
 * geração do conteúdo antigo desfaria a correção. A ordem final é por
 * data, da mais recente para a mais antiga, que é como todas as listagens
 * do site esperam receber.
 */
export const publicacoes = mesclarPublicacoes(
  publicacoesJson as Item[],
  publicacoesDoPainel as (Item & { publicado?: boolean })[],
  removidosJson as Removido[],
);

/** O conteúdo migrado cru, para o painel listar e corrigir. */
export const publicacoesMigradas = publicacoesJson as Item[];

const porRota = new Map(publicacoes.map((i) => [i.rota, i]));

export function itemPorRota(rota: string): Item | undefined {
  return porRota.get(rota);
}

export function todasAsRotas(): string[] {
  return [...porRota.keys()];
}

export function listar(
  tipo: TipoPublicacao | TipoPublicacao[],
  limite?: number,
): Item[] {
  const tipos = Array.isArray(tipo) ? tipo : [tipo];
  const lista = publicacoes.filter((p) => tipos.includes(p.tipo));
  return limite ? lista.slice(0, limite) : lista;
}

/** Publicações da mesma seção, menos a atual. Vai no pé do texto. */
export function relacionados(item: Item, quantidade = 3): Item[] {
  return publicacoes
    .filter((p) => p.tipo === item.tipo && p.id !== item.id)
    .slice(0, quantidade);
}

/* ------------------------------------------------------------------ */
/* Datas                                                               */
/* ------------------------------------------------------------------ */

/**
 * As datas do conteúdo migrado não têm fuso ("2025-02-11T09:53:31").
 * Lidas como horário local, uma publicação da madrugada aparece no dia
 * anterior para quem lê em outro fuso — e o servidor da Vercel roda em
 * UTC. Fixar o fuso na formatação resolve, desde que a data entre como
 * UTC: é o que o Z acrescentado aqui garante.
 */
function comoUTC(iso: string): Date {
  return new Date(/[Z+]|-\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
}

export function formatarData(iso: string | null): string {
  if (!iso) return "";
  const data = comoUTC(iso);
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}

export function formatarDataCurta(iso: string | null): string {
  if (!iso) return "";
  const data = comoUTC(iso);
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}
