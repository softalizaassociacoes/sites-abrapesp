import crypto from "node:crypto";

/**
 * O cookie de sessão do painel: criar e conferir — só cálculo.
 *
 * Separado de src/lib/admin/sessao.ts, que fala com os cookies do Next,
 * para poder ser testado sozinho. A separação nasceu de um defeito real: o
 * nome ia cru no cookie, separado por ponto, e a leitura exigia três
 * partes. Quem se chamasse "ana.silva" entrava — a senha conferia, o cookie
 * era criado —, e caía de volta na tela de entrada sem erro nenhum, porque
 * o ponto do nome virava uma quarta parte. Agora o nome vai em base64url,
 * que não tem ponto, e o formato não depende do que a pessoa se chama.
 */

const DURACAO_PADRAO_MS = 60 * 60 * 12 * 1000; // 12 horas

function assinar(dados: string, segredo: string): string {
  return crypto.createHmac("sha256", segredo).update(dados).digest("hex");
}

function conferir(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function criarToken(
  usuario: string,
  segredo: string,
  duracaoMs: number = DURACAO_PADRAO_MS,
  agora: number = Date.now(),
): string {
  const nome = Buffer.from(usuario, "utf8").toString("base64url");
  const corpo = `${nome}.${agora + duracaoMs}`;
  return `${corpo}.${assinar(corpo, segredo)}`;
}

/** O usuário do token, ou nulo se a assinatura ou o prazo não batem. */
export function lerToken(
  token: string | undefined,
  segredo: string,
  agora: number = Date.now(),
): string | null {
  if (!token || !segredo) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [nome, expira, assinatura] = partes;
  if (!conferir(assinatura, assinar(`${nome}.${expira}`, segredo))) return null;
  if (!(Number(expira) > agora)) return null;
  const usuario = Buffer.from(nome, "base64url").toString("utf8");
  return usuario.length > 0 ? usuario : null;
}
