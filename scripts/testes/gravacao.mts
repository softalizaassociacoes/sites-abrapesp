/**
 * Exercita a gravação real contra um GitHub falso, montado em cima do
 * fetch: é o único jeito de ver o caminho do arquivo, o base64, o sha e o
 * 409 sem criar commit de verdade no repositório.
 */
import { createRequire } from "node:module";

/* `server-only` existe para barrar estes módulos no navegador, e fora do
   Next ele lança em qualquer importação. Neutralizado só aqui, no cache do
   require: o que se quer testar é a gravação, não a barreira. */
const req = createRequire(import.meta.url);
const alvo = req.resolve("server-only");
(req.cache as Record<string, unknown>)[alvo] = {
  id: alvo,
  filename: alvo,
  loaded: true,
  exports: {},
  children: [],
  paths: [],
};

process.env.GITHUB_TOKEN = "token-de-teste";
process.env.GITHUB_REPO = "softalizaassociacoes/sites-abrapesp";

let falhas = 0;
const confere = (rotulo: string, obtido: unknown, esperado: unknown) => {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) falhas++;
  console.log(
    `${ok ? "  ok  " : " FALHA"} ${rotulo}`,
    ok
      ? ""
      : `\n        obtido=${JSON.stringify(obtido)}\n        esperado=${JSON.stringify(esperado)}`,
  );
};

type Gravacao = { caminho: string; corpo: Record<string, unknown> };
const gravacoes: Gravacao[] = [];
const arquivos = new Map<string, { texto: string; sha: string }>();
let proximoConflito = false;

globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  const u = String(url);
  const caminho = decodeURI(u.split("/contents/")[1]?.split("?")[0] ?? "");

  if (!init?.method || init.method === "GET") {
    const a = arquivos.get(caminho);
    if (!a) return new Response("{}", { status: 404 });
    return new Response(
      JSON.stringify({
        content: Buffer.from(a.texto).toString("base64"),
        sha: a.sha,
      }),
      { status: 200 },
    );
  }

  const corpo = JSON.parse(String(init.body)) as Record<string, unknown>;
  if (proximoConflito) {
    proximoConflito = false;
    return new Response("{}", { status: 409 });
  }
  gravacoes.push({ caminho, corpo });
  arquivos.set(caminho, {
    texto: Buffer.from(String(corpo.content), "base64").toString("utf8"),
    sha: `sha-${gravacoes.length}`,
  });
  return new Response("{}", { status: 200 });
}) as typeof fetch;

const {
  carregar,
  definirPublicado,
  marcarForaDoAr,
  remover,
  removerDoSite,
  removidos,
  restaurar,
  salvar,
} = await import("@/lib/admin/publicacoes");
const { enviarImagem } = await import("@/lib/admin/imagens");

const ARQUIVO = "src/conteudo-editavel/publicacoes.json";
const LAPIDES = "src/conteudo-editavel/removidos.json";

const erroDe = async (f: () => Promise<unknown>) => {
  try {
    await f();
    return null;
  } catch (e) {
    return (e as Error).message;
  }
};

const lerPublicacoes = () =>
  JSON.parse(arquivos.get(ARQUIVO)?.texto ?? "[]") as {
    rota: string;
    titulo: string;
    publicado: boolean;
    criadoPor: string;
  }[];

/* ------------------------------------------------------------------ */
console.log("\n--- publicar ---");

await salvar(
  {
    tipo: "noticia",
    titulo: "ABRAPESP lança nova campanha",
    resumo: "",
    html: "Primeiro parágrafo.\n\nSegundo parágrafo.",
    data: "2026-11-17",
    capa: null,
    publicado: true,
  },
  "ana",
);

confere("gravou no arquivo do painel", gravacoes[0].caminho, ARQUIVO);
confere(
  "a mensagem do commit diz o que foi feito",
  String(gravacoes[0].corpo.message).split("\n")[0],
  'Publica noticia "ABRAPESP lança nova campanha"',
);
confere(
  "o commit registra quem publicou",
  String(gravacoes[0].corpo.message).includes("Publicado por ana"),
  true,
);
confere(
  "a publicação foi para a rota da seção",
  lerPublicacoes()[0].rota,
  "/noticias/abrapesp-lanca-nova-campanha",
);
confere("entrou publicada", lerPublicacoes()[0].publicado, true);

/* ------------------------------------------------------------------ */
console.log("\n--- editar ---");

await salvar(
  {
    rota: "/noticias/abrapesp-lanca-nova-campanha",
    tipo: "noticia",
    titulo: "ABRAPESP lança nova campanha (atualizado)",
    resumo: "Resumo escrito à mão.",
    html: "Texto novo.",
    data: "2026-11-17",
    capa: null,
    publicado: true,
  },
  "marina",
);

const depoisDaEdicao = lerPublicacoes();
confere("continua sendo uma só", depoisDaEdicao.length, 1);
confere(
  "o endereço não muda quando o título muda",
  depoisDaEdicao[0].rota,
  "/noticias/abrapesp-lanca-nova-campanha",
);
confere(
  "quem criou continua sendo quem criou",
  depoisDaEdicao[0].criadoPor,
  "ana",
);
confere(
  "a mensagem do commit diz que é atualização",
  String(gravacoes[1].corpo.message).split("\n")[0],
  'Atualiza noticia "ABRAPESP lança nova campanha (atualizado)"',
);

/* ------------------------------------------------------------------ */
console.log("\n--- título repetido ---");

confere(
  "duas publicações não dividem endereço",
  await erroDe(() =>
    salvar(
      {
        tipo: "noticia",
        titulo: "ABRAPESP lança nova campanha",
        resumo: "",
        html: "Outro texto.",
        data: "2026-11-18",
        capa: null,
        publicado: true,
      },
      "ana",
    ),
  ),
  "Já existe outra publicação do painel neste endereço (/noticias/abrapesp-lanca-nova-campanha). Mude o título.",
);

/* ------------------------------------------------------------------ */
console.log("\n--- interruptor no ar / fora do ar ---");

await definirPublicado("/noticias/abrapesp-lanca-nova-campanha", false, "ana");
confere("desligou", lerPublicacoes()[0].publicado, false);
confere(
  "a mensagem do commit diz que saiu do ar",
  String(gravacoes.at(-1)!.corpo.message).split("\n")[0],
  'Tira do ar noticia "ABRAPESP lança nova campanha (atualizado)"',
);

const gravacoesAntes = gravacoes.length;
await definirPublicado("/noticias/abrapesp-lanca-nova-campanha", false, "ana");
confere(
  "desligar o que já está desligado não gera commit",
  gravacoes.length,
  gravacoesAntes,
);

await definirPublicado("/noticias/abrapesp-lanca-nova-campanha", true, "ana");
confere("religou", lerPublicacoes()[0].publicado, true);

confere(
  "rota que o painel não conhece não é ligada por aqui",
  await definirPublicado("/noticias/nao-existe", true, "ana"),
  false,
);

/* ------------------------------------------------------------------ */
console.log("\n--- conteúdo migrado: lápide e volta ---");

/* Uma rota qualquer das 137 que vieram do site antigo. */
const { publicacoesMigradas } = await import("@/lib/conteudo");
const migrada = publicacoesMigradas[0];

await marcarForaDoAr(migrada.rota, migrada.titulo, "ana");
confere("gravou a lápide no arquivo certo", gravacoes.at(-1)!.caminho, LAPIDES);
confere(
  "a lápide guarda a rota",
  (await removidos()).map((r) => r.rota),
  [migrada.rota],
);

const antesDaRepetida = gravacoes.length;
await marcarForaDoAr(migrada.rota, migrada.titulo, "ana");
confere(
  "a mesma lápide não é gravada duas vezes",
  gravacoes.length,
  antesDaRepetida,
);

const volta = await restaurar(migrada.rota, "ana");
confere("desfez a remoção", volta.desfez, true);
confere("a lista de lápides ficou vazia", (await removidos()).length, 0);

/* ------------------------------------------------------------------ */
console.log("\n--- remover do site ---");

await removerDoSite(migrada.rota, migrada.titulo, "ana");
confere(
  "item migrado sai por lápide, não por exclusão",
  (await removidos()).map((r) => r.rota),
  [migrada.rota],
);

await remover("/noticias/abrapesp-lanca-nova-campanha", "ana");
confere("item do painel sai da lista", (await carregar()).length, 0);

/* ------------------------------------------------------------------ */
console.log("\n--- imagem de destaque ---");

const png = Buffer.alloc(26);
Buffer.from("89504e470d0a1a0a", "hex").copy(png, 0);
png.writeUInt32BE(1600, 16);
png.writeUInt32BE(1000, 20);

const enviada = await enviarImagem(
  new File([png], "Foto do Congresso.png", { type: "image/png" }),
  "ana",
);
confere(
  "a imagem vai para a pasta do painel, sob assets",
  /^\/assets\/img\/painel\/\d{4}\/\d{2}\/foto-do-congresso-[a-z0-9]+\.png$/.test(
    enviada.src,
  ),
  true,
);
confere("mediu a imagem", [enviada.largura, enviada.altura], [1600, 1000]);
confere("na proporção certa, sem aviso", enviada.aviso, null);

confere(
  "formato não aceito é recusado",
  await erroDe(() =>
    enviarImagem(new File([png], "a.gif", { type: "image/gif" }), "ana"),
  ),
  "Formato não aceito. Envie JPG, PNG ou WebP.",
);

/* ------------------------------------------------------------------ */
console.log("\n--- gravação simultânea ---");

proximoConflito = true;
confere(
  "quem gravou por último não sobrescreve em silêncio",
  await erroDe(() =>
    salvar(
      {
        tipo: "noticia",
        titulo: "Texto de duas pessoas ao mesmo tempo",
        resumo: "",
        html: "Texto.",
        data: "2026-11-17",
        capa: null,
        publicado: true,
      },
      "ana",
    ),
  ),
  "alguém gravou enquanto você editava. Abra de novo e refaça a alteração.",
);

console.log(falhas === 0 ? "\nTudo certo.\n" : `\n${falhas} falha(s).\n`);
process.exit(falhas === 0 ? 0 : 1);
