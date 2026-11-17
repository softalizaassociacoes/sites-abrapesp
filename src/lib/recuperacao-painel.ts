import crypto from "node:crypto";

/**
 * O token de redefinição de senha — só cálculo, testável sozinho.
 *
 * O painel não tem banco, então o token carrega tudo o que a redefinição
 * precisa, assinado com o mesmo segredo da sessão: o e-mail, o prazo e um
 * pedaço do hash atual da senha. O pedaço do hash é o que torna o token de
 * uso único sem guardar estado: redefinida a senha, o hash muda, e o mesmo
 * link não vale uma segunda vez. Também invalida o link antigo quando a
 * pessoa troca a senha por conta própria no meio do caminho.
 */

const DURACAO_MS = 60 * 60 * 1000; // 1 hora

type Carga = { e: string; x: number; h: string };

function assinar(dados: string, segredo: string): string {
  return crypto.createHmac("sha256", segredo).update(dados).digest("base64url");
}

export function criarTokenDeRecuperacao(
  email: string,
  hashAtual: string,
  segredo: string,
  agora: number = Date.now(),
): string {
  const carga: Carga = {
    e: email.trim().toLowerCase(),
    x: agora + DURACAO_MS,
    h: hashAtual.slice(0, 16),
  };
  const corpo = Buffer.from(JSON.stringify(carga), "utf8").toString(
    "base64url",
  );
  return `${corpo}.${assinar(corpo, segredo)}`;
}

/**
 * O e-mail do token, ou nulo.
 *
 * `hashAtual` é o hash de agora da conta: se a senha mudou depois de o
 * link ser enviado, o token não vale mais.
 */
export function lerTokenDeRecuperacao(
  token: string | undefined,
  hashAtualPorEmail: (email: string) => string | null,
  segredo: string,
  agora: number = Date.now(),
): string | null {
  if (!token || !segredo) return null;
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [corpo, assinatura] = partes;

  const esperada = assinar(corpo, segredo);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let carga: Carga;
  try {
    carga = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof carga.e !== "string" || !(carga.x > agora)) return null;

  const hashAtual = hashAtualPorEmail(carga.e);
  if (!hashAtual || hashAtual.slice(0, 16) !== carga.h) return null;

  return carga.e;
}
