import { cookies } from "next/headers";
import { criarToken, lerToken } from "@/lib/sessao-painel";

/**
 * Sessão do painel administrativo.
 *
 * O mesmo desenho do painel de outro site nosso: cookie assinado com HMAC-SHA256,
 * sem estado no servidor. O cookie carrega quem é e até quando vale; a
 * assinatura impede forjar sessão sem o segredo. Serve bem a um site que
 * roda sem servidor próprio, onde guardar sessão em memória não funciona
 * porque cada requisição pode cair numa instância diferente.
 *
 * Diferença daqui: o cookie carrega o nome de quem entrou, porque a ABRAPESP
 * vai ter mais de uma pessoa publicando e o registro de quem alterou o quê
 * fica no commit (ver repositorio.ts).
 *
 * O formato do token e a assinatura ficam em src/lib/sessao-painel.ts, que
 * não depende do Next e por isso pode ser testado sozinho.
 */

const COOKIE = "abrapesp_admin";
const DURACAO_S = 60 * 60 * 12; // 12 horas

function segredo(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

/** O painel só existe quando o segredo de sessão está configurado. */
export function painelConfigurado(): boolean {
  return segredo().length >= 32;
}

/** Quem está logado nesta requisição, ou nulo. */
export async function usuarioDaSessao(): Promise<string | null> {
  if (!painelConfigurado()) return null;
  const cookie = await cookies();
  return lerToken(cookie.get(COOKIE)?.value, segredo());
}

export async function abrirSessao(usuario: string): Promise<void> {
  const cookie = await cookies();
  cookie.set(COOKIE, criarToken(usuario, segredo(), DURACAO_S * 1000), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_S,
  });
}

export async function fecharSessao(): Promise<void> {
  const cookie = await cookies();
  cookie.delete(COOKIE);
}
