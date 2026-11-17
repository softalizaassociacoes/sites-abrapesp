import "server-only";

/**
 * Gravação do conteúdo, via GitHub Contents API.
 *
 * O mesmo caminho que o painel de outro site nosso usa, e pelo mesmo motivo: o site
 * roda sem servidor próprio e sem banco. Cada alteração feita no painel
 * vira um commit no repositório, com o nome de quem fez — o histórico do
 * git passa a ser o histórico editorial, de graça, e o deploy que o Vercel
 * dispara a cada commit publica a mudança em poucos minutos.
 *
 * Sem GITHUB_TOKEN o painel abre em leitura: mostra o que existe e avisa
 * que não pode gravar, em vez de aceitar o texto e perdê-lo.
 */

const API = "https://api.github.com";

type Config = { token: string; repo: string; branch: string };

function config(): Config | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

export function podeGravar(): boolean {
  return config() !== null;
}

function cabecalhos(c: Config) {
  return {
    Authorization: `Bearer ${c.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "painel-abrapesp",
  };
}

export class ErroDeGravacao extends Error {}

/** Conteúdo atual de um arquivo e o seu sha, necessário para regravar. */
async function lerArquivo(
  c: Config,
  caminho: string,
): Promise<{ texto: string; sha: string } | null> {
  const url = `${API}/repos/${c.repo}/contents/${encodeURI(caminho)}?ref=${encodeURIComponent(c.branch)}`;
  const r = await fetch(url, { headers: cabecalhos(c), cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) {
    throw new ErroDeGravacao(`não consegui ler ${caminho} (HTTP ${r.status})`);
  }
  const corpo = (await r.json()) as { content?: string; sha: string };
  const texto = corpo.content
    ? Buffer.from(corpo.content, "base64").toString("utf8")
    : "";
  return { texto, sha: corpo.sha };
}

export async function lerJson<T>(caminho: string, reserva: T): Promise<T> {
  const c = config();
  if (!c) return reserva;
  const arquivo = await lerArquivo(c, caminho);
  if (!arquivo) return reserva;
  try {
    return JSON.parse(arquivo.texto) as T;
  } catch {
    throw new ErroDeGravacao(`${caminho} não é um JSON válido`);
  }
}

/**
 * Grava um arquivo como commit.
 *
 * O `sha` do arquivo atual vai junto: se alguém tiver gravado entre a
 * leitura e esta chamada, o GitHub recusa com 409 em vez de sobrescrever em
 * silêncio. Duas pessoas publicando ao mesmo tempo é raro, mas perder o
 * texto de alguém por isso não pode acontecer.
 */
export async function gravarArquivo(
  caminho: string,
  conteudo: string | Buffer,
  mensagem: string,
  autor: string,
): Promise<void> {
  const c = config();
  if (!c) throw new ErroDeGravacao("gravação não configurada neste servidor");

  const atual = await lerArquivo(c, caminho);
  const corpo = {
    message: `${mensagem}\n\nPublicado por ${autor} pelo painel da ABRAPESP.`,
    content: Buffer.from(conteudo).toString("base64"),
    branch: c.branch,
    ...(atual ? { sha: atual.sha } : {}),
  };

  const r = await fetch(
    `${API}/repos/${c.repo}/contents/${encodeURI(caminho)}`,
    {
      method: "PUT",
      headers: { ...cabecalhos(c), "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    },
  );

  if (r.status === 409) {
    throw new ErroDeGravacao(
      "alguém gravou enquanto você editava. Abra de novo e refaça a alteração.",
    );
  }
  if (!r.ok) {
    const detalhe = await r.text().catch(() => "");
    throw new ErroDeGravacao(
      `não consegui gravar (HTTP ${r.status}) ${detalhe.slice(0, 160)}`,
    );
  }
}

/** Grava o JSON das publicações do painel, já formatado para o diff ficar legível. */
export async function gravarPublicacoes(
  itens: unknown[],
  mensagem: string,
  autor: string,
): Promise<void> {
  await gravarArquivo(
    "src/conteudo-editavel/publicacoes.json",
    `${JSON.stringify(itens, null, 2)}\n`,
    mensagem,
    autor,
  );
}
