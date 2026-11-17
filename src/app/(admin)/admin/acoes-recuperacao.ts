"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { abrirSessao, painelConfigurado } from "@/lib/admin/sessao";
import { ErroDeGravacao, podeGravar } from "@/lib/admin/repositorio";
import { trocarSenhaPorToken } from "@/lib/admin/contas";
import {
  emailDoToken,
  enviarLinkDeRedefinicao,
  recuperacaoDisponivel,
  usuarioDoEmail,
} from "@/lib/admin/recuperacao";
import { ErroDeConta } from "@/lib/admin/contas";

export type Resultado = { erro?: string; feito?: string };

/**
 * "Esqueci a senha", em duas pontas.
 *
 * O pedido responde a mesma coisa exista ou não a conta: dizer "e-mail não
 * cadastrado" entregaria a lista de contas a quem tenta adivinhar. Já a
 * redefinição valida o token no servidor a cada chamada — o endereço do
 * link é a única credencial, e vale uma hora, uma vez.
 */
export async function pedirRedefinicao(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  if (!painelConfigurado() || !recuperacaoDisponivel()) {
    return {
      erro: "O envio de e-mail não está configurado neste servidor. Peça a um administrador para redefinir a sua senha em Contas.",
    };
  }

  const email = String(dados.get("email") ?? "").trim();
  if (!email) return { erro: "Informe o e-mail da sua conta." };

  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "sbcs.softaliza.com.br";
  const protocolo = h.get("x-forwarded-proto") ?? "https";

  try {
    await enviarLinkDeRedefinicao(email, `${protocolo}://${host}`);
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "O envio falhou." };
  }

  return {
    feito:
      "Se este e-mail tiver uma conta no painel, o link de redefinição chega em instantes. Vale por uma hora.",
  };
}

export async function redefinirComToken(
  _estado: Resultado | undefined,
  dados: FormData,
): Promise<Resultado> {
  const token = String(dados.get("token") ?? "");
  const nova = String(dados.get("nova") ?? "");
  const repetida = String(dados.get("repetida") ?? "");

  const email = emailDoToken(token);
  if (!email) {
    return {
      erro: "Este link não vale mais: ou passou de uma hora, ou já foi usado. Peça um novo na tela de entrada.",
    };
  }
  if (!nova) return { erro: "Escolha a senha nova." };
  if (nova !== repetida) return { erro: "As duas senhas não são iguais." };
  if (!podeGravar()) {
    return {
      erro: "A gravação não está configurada neste servidor, então a senha nova não seria guardada.",
    };
  }

  const conta = usuarioDoEmail(email);
  if (!conta) return { erro: "Conta não encontrada." };

  try {
    await trocarSenhaPorToken(conta.nome, nova);
  } catch (e) {
    if (e instanceof ErroDeConta || e instanceof ErroDeGravacao) {
      return { erro: e.message };
    }
    throw e;
  }

  /* Já abre a sessão: a pessoa provou ser dona do e-mail, e a senha nova
     só passa a autenticar quando o deploy terminar — sem isso ela sairia
     da redefinição para uma tela de entrada que ainda não a aceita. */
  await abrirSessao(conta.nome);
  redirect("/admin");
}
