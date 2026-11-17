"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { ErroDeGravacao, podeGravar } from "@/lib/admin/repositorio";
import {
  ErroDeConta,
  adicionar,
  mudarEmail,
  mudarPapel,
  redefinirSenha,
  remover,
  trocarSenha,
} from "@/lib/admin/contas";
import { ehAdministrador, type Papel } from "@/lib/admin/usuarios";

/**
 * Ações sobre as contas do painel.
 *
 * Quem é administrador é decidido aqui, no servidor, a cada chamada. A tela
 * esconde o que o editor não pode fazer, mas esconder não é proteger: um
 * formulário montado à mão chegaria igual a estas funções.
 */

export type Resultado = { erro?: string; feito?: string };

const SEM_GRAVACAO =
  "A gravação ainda não foi configurada neste servidor, então a alteração não seria guardada. Falta cadastrar GITHUB_TOKEN e GITHUB_REPO.";

async function exigirSessao(): Promise<string> {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/admin/login");
  return usuario;
}

async function exigirAdministrador(): Promise<string> {
  const usuario = await exigirSessao();
  if (!ehAdministrador(usuario)) {
    throw new Error("Esta ação é restrita a administradores.");
  }
  return usuario;
}

function comoErro(e: unknown): Resultado {
  if (e instanceof ErroDeConta || e instanceof ErroDeGravacao) {
    return { erro: e.message };
  }
  throw e;
}

/**
 * O aviso da defasagem acompanha toda alteração de conta.
 *
 * A lista vem do pacote gerado no build, então a conta nova só entra
 * quando o deploy termina. Dizer isso na hora evita a pessoa tentar entrar
 * com a conta recém-criada e concluir que o painel está quebrado.
 */
const DEFASAGEM =
  "Vale assim que o site terminar de publicar, uns três minutos.";

export async function criarConta(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const autor = await exigirAdministrador();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const nome = String(dados.get("nome") ?? "");
  const email = String(dados.get("email") ?? "");
  const papel = (dados.get("papel") as Papel) || "editor";
  const senha = String(dados.get("senha") ?? "");
  if (papel !== "editor" && papel !== "administrador") {
    return { erro: "Papel inválido." };
  }

  try {
    await adicionar(nome, email, papel, senha, autor);
  } catch (e) {
    return comoErro(e);
  }

  revalidatePath("/admin/contas");
  return { feito: `Conta de ${nome.trim()} criada. ${DEFASAGEM}` };
}

export async function removerConta(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const autor = await exigirAdministrador();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const nome = String(dados.get("nome") ?? "");
  try {
    await remover(nome, autor);
  } catch (e) {
    return comoErro(e);
  }

  revalidatePath("/admin/contas");
  return { feito: `Conta de ${nome} removida. ${DEFASAGEM}` };
}

export async function alterarPapel(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const autor = await exigirAdministrador();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const nome = String(dados.get("nome") ?? "");
  const papel = dados.get("papel") as Papel;
  if (papel !== "editor" && papel !== "administrador") {
    return { erro: "Papel inválido." };
  }

  try {
    await mudarPapel(nome, papel, autor);
  } catch (e) {
    return comoErro(e);
  }

  revalidatePath("/admin/contas");
  return { feito: `${nome} agora é ${papel}. ${DEFASAGEM}` };
}

export async function alterarEmail(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const autor = await exigirAdministrador();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const nome = String(dados.get("nome") ?? "");
  const email = String(dados.get("email") ?? "");
  try {
    await mudarEmail(nome, email, autor);
  } catch (e) {
    return comoErro(e);
  }

  revalidatePath("/admin/contas");
  return { feito: `E-mail de ${nome} definido. ${DEFASAGEM}` };
}

export async function redefinirSenhaDe(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const autor = await exigirAdministrador();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const nome = String(dados.get("nome") ?? "");
  const senha = String(dados.get("senha") ?? "");
  try {
    await redefinirSenha(nome, senha, autor);
  } catch (e) {
    return comoErro(e);
  }

  revalidatePath("/admin/contas");
  return {
    feito: `Senha de ${nome} redefinida. Passe a senha nova para a pessoa e peça que ela troque. ${DEFASAGEM}`,
  };
}

/** Qualquer pessoa logada troca a própria senha, conferindo a atual. */
export async function trocarMinhaSenha(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const usuario = await exigirSessao();
  if (!podeGravar()) return { erro: SEM_GRAVACAO };

  const atual = String(dados.get("atual") ?? "");
  const nova = String(dados.get("nova") ?? "");
  const repetida = String(dados.get("repetida") ?? "");
  if (!atual || !nova) return { erro: "Preencha a senha atual e a nova." };
  if (nova !== repetida)
    return { erro: "As duas senhas novas não são iguais." };

  try {
    await trocarSenha(usuario, atual, nova);
  } catch (e) {
    return comoErro(e);
  }

  return {
    feito: `Senha trocada. ${DEFASAGEM} Até lá, a senha antiga continua valendo.`,
  };
}
