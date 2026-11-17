"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { ErroDeGravacao, podeGravar } from "@/lib/admin/repositorio";
import {
  ErroDeRota,
  definirPublicado,
  marcarForaDoAr,
  migradaPorRota,
  remover,
  removerDoSite,
  restaurar,
  salvar,
} from "@/lib/admin/publicacoes";
import type { Rascunho } from "@/lib/publicacoes-painel";
import {
  ErroDeImagem,
  enviarImagem,
  type ImagemEnviada,
} from "@/lib/admin/imagens";
import type { TipoPublicacao } from "@/lib/conteudo";

export type Resultado = {
  erro?: string;
  aviso?: string;
};

export type ResultadoDaImagem = {
  erro?: string;
  aviso?: string;
  imagem?: ImagemEnviada;
};

/** Toda ação do painel começa confirmando quem é — nunca confie no formulário. */
async function exigirSessao(): Promise<string> {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/admin/login");
  return usuario;
}

const SEM_GRAVACAO =
  "A gravação ainda não foi configurada neste servidor, então nada seria guardado. Falta cadastrar GITHUB_TOKEN e GITHUB_REPO.";

function lerRascunho(dados: FormData): Rascunho | null {
  const titulo = String(dados.get("titulo") ?? "").trim();
  const html = String(dados.get("html") ?? "").trim();
  if (!titulo || !html) return null;

  const capaSrc = String(dados.get("capaSrc") ?? "").trim();
  const largura = Number(dados.get("capaLargura"));
  const altura = Number(dados.get("capaAltura"));

  return {
    rota: String(dados.get("rota") ?? "") || undefined,
    tipo: (dados.get("tipo") as TipoPublicacao) ?? "noticia",
    titulo,
    resumo: String(dados.get("resumo") ?? "").trim(),
    html,
    data: String(dados.get("data") ?? "") || new Date().toISOString(),
    capa: capaSrc
      ? {
          src: capaSrc,
          alt: String(dados.get("capaAlt") ?? "").trim() || titulo,
          ...(largura > 0 ? { largura } : {}),
          ...(altura > 0 ? { altura } : {}),
        }
      : null,
    publicado: dados.get("destino") === "publicar",
  };
}

export async function salvarPublicacao(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const rascunho = lerRascunho(dados);
  if (!rascunho) {
    return { erro: "Escreva ao menos o título e o texto antes de gravar." };
  }

  try {
    await salvar(rascunho, usuario);
  } catch (e) {
    if (e instanceof ErroDeGravacao || e instanceof ErroDeRota) {
      return { erro: e.message };
    }
    throw e;
  }

  revalidatePath("/admin/publicacoes");
  redirect("/admin/publicacoes");
}

export async function removerPublicacao(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const rota = String(dados.get("rota") ?? "");
  if (!rota) return { erro: "Não achei qual publicação remover." };

  try {
    await remover(rota, usuario);
  } catch (e) {
    if (e instanceof ErroDeGravacao) return { erro: e.message };
    throw e;
  }
  revalidatePath("/admin/publicacoes");
  redirect("/admin/publicacoes");
}

/** Tira do site o que mora numa rota — do painel, migrado, ou os dois. */
export async function tirarDoAr(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const rota = String(dados.get("rota") ?? "");
  const titulo = String(dados.get("titulo") ?? rota);
  if (!rota) return { erro: "Rota vazia." };

  try {
    await removerDoSite(rota, titulo, usuario);
  } catch (e) {
    if (e instanceof ErroDeGravacao) return { erro: e.message };
    throw e;
  }
  revalidatePath("/admin/publicacoes");
  return {
    aviso: `"${titulo}" sai do site no próximo deploy, uns três minutos.`,
  };
}

/**
 * O interruptor da listagem: liga e desliga o que mora numa rota.
 *
 * Item do painel: muda o `publicado`. Item migrado: põe ou tira a lápide.
 * Correção por cima de migrado: os dois juntos, senão desligar a correção
 * só faria o texto antigo voltar — desligado tem de significar fora do ar.
 */
export async function alternarNoAr(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const rota = String(dados.get("rota") ?? "");
  const titulo = String(dados.get("titulo") ?? rota);
  const ligar = dados.get("ligar") === "sim";
  if (!rota) return { erro: "Rota vazia." };

  try {
    const haviaDoPainel = await definirPublicado(rota, ligar, usuario);

    if (migradaPorRota(rota)) {
      /* Sem conferir antes se a lápide "já existe": a leitura pode vir
         velha logo depois de uma gravação, e as duas funções já são
         idempotentes por conta própria. */
      if (ligar) {
        const resultado = await restaurar(rota, usuario);
        /* Religar sem achar a lápide não é sucesso: ou a leitura veio
           velha além do que a insistência cobre, ou algo está errado — e
           fingir que deu certo esconderia qualquer um dos dois. */
        if (!resultado.desfez && !haviaDoPainel) {
          return {
            erro: "Não achei o registro de remoção para desfazer. Recarregue a página e tente de novo.",
          };
        }
      } else {
        await marcarForaDoAr(rota, titulo, usuario);
      }
    }
  } catch (e) {
    if (e instanceof ErroDeGravacao) return { erro: e.message };
    throw e;
  }

  revalidatePath("/admin/publicacoes");
  return {
    aviso: ligar
      ? `"${titulo}" entra no ar no próximo deploy, uns três minutos.`
      : `"${titulo}" sai do ar no próximo deploy, uns três minutos.`,
  };
}

export async function devolverAoAr(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const rota = String(dados.get("rota") ?? "");
  if (!rota) return { erro: "Rota vazia." };
  try {
    await restaurar(rota, usuario);
  } catch (e) {
    if (e instanceof ErroDeGravacao) return { erro: e.message };
    throw e;
  }
  revalidatePath("/admin/publicacoes/removidos");
  revalidatePath("/admin/publicacoes");
  return { aviso: "Volta ao site no próximo deploy, uns três minutos." };
}

/**
 * Envio da imagem de destaque.
 *
 * Fica numa ação separada de propósito: a imagem sobe na hora, antes de
 * gravar o texto, para que a pessoa veja a capa escolhida e o aviso de
 * proporção enquanto ainda pode trocá-la.
 */
export async function enviarCapa(
  _estado: ResultadoDaImagem | undefined,
  dados: FormData,
): Promise<ResultadoDaImagem> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const arquivo = dados.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha um arquivo de imagem." };
  }

  try {
    const imagem = await enviarImagem(arquivo, usuario);
    return {
      imagem,
      aviso:
        imagem.aviso ??
        `Imagem enviada, ${imagem.largura}x${imagem.altura}. Escreva a descrição para quem não vê a imagem.`,
    };
  } catch (e) {
    if (e instanceof ErroDeImagem || e instanceof ErroDeGravacao) {
      return { erro: e.message };
    }
    throw e;
  }
}
