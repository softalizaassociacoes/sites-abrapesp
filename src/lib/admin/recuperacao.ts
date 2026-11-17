import "server-only";
import {
  criarTokenDeRecuperacao,
  lerTokenDeRecuperacao,
} from "@/lib/recuperacao-painel";
import { listarUsuarios, type Usuario } from "@/lib/admin/usuarios";

/**
 * "Esqueci a senha": o link chega por e-mail, pelo mesmo SendGrid do
 * formulário de contato.
 *
 * A resposta na tela é a mesma existindo ou não a conta — dizer "este
 * e-mail não está cadastrado" é entregar a lista de contas a quem tenta
 * adivinhar. O token é assinado, vale uma hora e é de uso único (ver
 * src/lib/recuperacao-painel.ts).
 */

function segredo(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function recuperacaoDisponivel(): boolean {
  return Boolean(process.env.SENDGRID_API_KEY) && segredo().length >= 32;
}

function porEmail(email: string): Usuario | undefined {
  const baixo = email.trim().toLowerCase();
  return listarUsuarios().find((u) => u.email?.toLowerCase() === baixo);
}

/** O e-mail dono do token, se ele for válido, estiver no prazo e não usado. */
export function emailDoToken(token: string | undefined): string | null {
  return lerTokenDeRecuperacao(
    token,
    (email) => porEmail(email)?.hash ?? null,
    segredo(),
  );
}

export function usuarioDoEmail(email: string): Usuario | undefined {
  return porEmail(email);
}

/**
 * Envia o link, se a conta existir. Sempre resolve sem dizer qual foi o
 * caso; só erro de infraestrutura (SendGrid fora) vira exceção.
 */
export async function enviarLinkDeRedefinicao(
  email: string,
  origem: string,
): Promise<void> {
  const conta = porEmail(email);
  if (!conta) return; // em silêncio, de propósito

  const token = criarTokenDeRecuperacao(email, conta.hash, segredo());
  const link = `${origem}/admin/redefinir?token=${encodeURIComponent(token)}`;
  const remetente = process.env.SENDGRID_REMETENTE || "tesouraria@abrapesp.org.br";

  const texto = [
    `Olá, ${conta.nome}.`,
    "",
    "Alguém pediu a redefinição da sua senha no painel da ABRAPESP. Se foi você,",
    "abra o endereço abaixo e escolha a senha nova. Ele vale por uma hora e",
    "funciona uma única vez:",
    "",
    link,
    "",
    "Se não foi você, não precisa fazer nada: sem este link ninguém troca a",
    "sua senha, e ele expira sozinho.",
    "",
    "— Painel da ABRAPESP",
  ].join("\n");

  const envio = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: conta.email }],
          subject: "Redefinição de senha — painel da ABRAPESP",
        },
      ],
      from: { email: remetente, name: "Painel da ABRAPESP" },
      content: [{ type: "text/plain", value: texto }],
    }),
  });

  if (!envio.ok) {
    const detalhe = await envio.text().catch(() => "");
    console.error(
      "SendGrid recusou a redefinição:",
      envio.status,
      detalhe.slice(0, 300),
    );
    throw new Error("O envio do e-mail falhou. Tente de novo em instantes.");
  }
}
