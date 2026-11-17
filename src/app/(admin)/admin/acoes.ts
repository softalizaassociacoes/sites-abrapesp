"use server";

import { redirect } from "next/navigation";
import {
  abrirSessao,
  fecharSessao,
  painelConfigurado,
} from "@/lib/admin/sessao";
import { autenticar } from "@/lib/admin/usuarios";

/**
 * Entrada e saída do painel.
 *
 * A mensagem de erro é sempre a mesma, para nome errado e senha errada: a
 * diferença entre as duas diria a quem tenta adivinhar quais nomes existem.
 */
export async function entrar(
  _estado: { erro?: string } | undefined,
  dados: FormData,
): Promise<{ erro?: string }> {
  if (!painelConfigurado()) {
    return { erro: "O painel ainda não foi configurado neste servidor." };
  }

  const nome = String(dados.get("usuario") ?? "");
  const senha = String(dados.get("senha") ?? "");
  if (!nome || !senha) return { erro: "Preencha e-mail (ou usuário) e senha." };

  const usuario = autenticar(nome, senha);
  if (!usuario) return { erro: "E-mail ou senha incorretos." };

  await abrirSessao(usuario.nome);
  redirect("/admin");
}

export async function sair(): Promise<void> {
  await fecharSessao();
  redirect("/admin/login");
}
