/**
 * Converte as páginas institucionais do site antigo (pasta legado/).
 *
 * São oito páginas de conteúdo fixo, escritas à mão em HTML. Reescrevê-las
 * em componentes significaria redigitar algumas centenas de linhas de
 * markup e aceitar que o visual mudasse em algum detalhe — justamente o
 * que esta migração não pode fazer. Então o markup vem como está, e o que
 * ele tem de dinâmico (listas que o JavaScript preenchia) vira um buraco
 * nomeado, preenchido por um componente React na hora de renderizar.
 *
 * Gera src/conteudo/paginas.json, sobrescrevendo-o inteiro.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import { decodificarTexto } from "./lib-texto.mjs";

const raiz = path.resolve(import.meta.dirname, "..");
const legado = path.join(raiz, "legado");

/** As páginas e onde cada uma passa a morar. */
const PAGINAS = [
  { arquivo: "index", rota: "/", titulo: "Início" },
  { arquivo: "quem-somos", rota: "/quem-somos", titulo: "Quem somos" },
  { arquivo: "diretoria", rota: "/diretoria", titulo: "Diretoria" },
  { arquivo: "parceiros-cre", rota: "/parceiros-cre", titulo: "Parceiros · CRE" },
  { arquivo: "estatuto", rota: "/estatuto", titulo: "Estatuto" },
  { arquivo: "eventos", rota: "/eventos", titulo: "Eventos & Congressos" },
  { arquivo: "associe-se", rota: "/associe-se", titulo: "Associe-se" },
  { arquivo: "fale-conosco", rota: "/fale-conosco", titulo: "Fale conosco" },
];

/** O endereço novo de cada página do site antigo. */
const ROTAS = {
  "index.html": "/",
  "noticias.html": "/noticias",
  "coluna-de-associados.html": "/coluna-de-associados",
  ...Object.fromEntries(
    PAGINAS.map((p) => [`${p.arquivo}.html`, p.rota]),
  ),
};

/** Os buracos: o atributo que os marcava e o componente que os preenche. */
const SLOTS = [
  { atributo: "data-news-featured", nome: "noticias-destaque" },
  { atributo: "data-coluna-grid", nome: "colunas" },
  { atributo: "data-parceiros", nome: "parceiros" },
  { atributo: "data-diretoria", nome: "diretoria" },
  { atributo: "data-eventos", nome: "eventos" },
];

/* O nó precisa guardar as classes do elemento que ele substitui: é nelas
   que mora a grade (.grid.cols-3, .partners, .people), e o bloco React
   recria o mesmo contêiner, senão os cartões saem soltos na página. */
const porAtributo = new Map(SLOTS.map((s) => [s.atributo, s.nome]));

/** Qual bloco este elemento é, se for algum. */
function blocoDe(no) {
  for (const [atributo, nome] of porAtributo) {
    if (no.getAttribute(atributo) !== undefined) {
      const limite = no.getAttribute("data-limit");
      const classe = no.getAttribute("class");
      return {
        t: "bloco",
        nome,
        ...(limite ? { limite: Number(limite) } : {}),
        ...(classe ? { classe } : {}),
      };
    }
  }
  return null;
}

/** Vazias em HTML: não têm filhos nem tag de fechamento. */
const SEM_FILHOS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * O elemento vira um nó da árvore, com os filhos dentro.
 *
 * Texto em branco entre tags é descartado quando não há nada em volta:
 * o HTML antigo é indentado, e guardar essa indentação dobraria o
 * arquivo sem mudar uma vírgula do que aparece na tela.
 */
function comoNo(no) {
  if (no.nodeType === 3) {
    const texto = no.rawText;
    return texto.trim() ? { t: "texto", v: decodificar(texto) } : null;
  }
  if (no.nodeType !== 1) return null;

  const bloco = blocoDe(no);
  if (bloco) return bloco;

  const nome = no.rawTagName.toLowerCase();
  const attrs = {};
  for (const [chave, valor] of Object.entries(no.attributes)) {
    attrs[chave] = valor;
  }

  return {
    t: "tag",
    nome,
    attrs,
    filhos: SEM_FILHOS.has(nome)
      ? []
      : no.childNodes.map(comoNo).filter(Boolean),
  };
}

/* O parser entrega o texto como está no arquivo, com as entidades por
   resolver; o React escaparia o & de novo e "&amp;" apareceria na tela. */
const decodificar = decodificarTexto;

function reescreverLinks(html) {
  let saida = html
    .replace(/(src|href)="assets\//g, '$1="/assets/')
    .replace(/(src|href)="\.\/assets\//g, '$1="/assets/');

  for (const [antiga, nova] of Object.entries(ROTAS)) {
    saida = saida.replaceAll(`href="${antiga}"`, `href="${nova}"`);
    saida = saida.replaceAll(`href="./${antiga}"`, `href="${nova}"`);
  }

  /* Links para notícias, que agora moram sob /noticias/<slug>. */
  const publicacoes = JSON.parse(
    fs.readFileSync(path.join(raiz, "src/conteudo/publicacoes.json"), "utf8"),
  );
  for (const p of publicacoes) {
    saida = saida.replaceAll(`href="${p.slug}.html"`, `href="${p.rota}"`);
  }
  return saida;
}

function extrairPagina({ arquivo, rota, titulo }) {
  const html = fs.readFileSync(path.join(legado, `${arquivo}.html`), "utf8");
  const doc = parse(html);

  const descricao = decodificarTexto(
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ??
      "",
  );
  const tituloDaAba = decodificarTexto(doc.querySelector("title")?.text ?? titulo)
    .replace(/\s*—\s*ABRAPESP\s*$/, "")
    .trim();

  /* O cabeçalho e o rodapé eram injetados por JavaScript, então o <body>
     do arquivo já é só o conteúdo da página — menos os <script>. */
  const corpo = doc.querySelector("body");
  corpo.querySelectorAll("script").forEach((s) => s.remove());

  /* Os endereços são reescritos no HTML, antes de virar árvore: é uma
     troca de texto, e fazê-la aqui evita percorrer a árvore atrás de
     cada href. */
  const limpo = parse(reescreverLinks(corpo.innerHTML.trim()));
  const nos = limpo.childNodes.map(comoNo).filter(Boolean);

  return {
    rota,
    rotaAntiga: `/${arquivo}.html`,
    slug: arquivo,
    titulo: tituloDaAba,
    descricao,
    /** Só a home tem hero escuro sob o cabeçalho. */
    comHero: corpo.querySelector(".hero") !== null,
    nos,
  };
}

const paginas = PAGINAS.map(extrairPagina);

fs.writeFileSync(
  path.join(raiz, "src/conteudo/paginas.json"),
  `${JSON.stringify(paginas, null, 2)}\n`,
);

/** Conta os nós da árvore inteira, para o relatório. */
function contar(nos) {
  return nos.reduce(
    (total, n) => total + 1 + (n.t === "tag" ? contar(n.filhos) : 0),
    0,
  );
}

function blocosDe(nos) {
  return nos.flatMap((n) =>
    n.t === "bloco" ? [n.nome] : n.t === "tag" ? blocosDe(n.filhos) : [],
  );
}

for (const p of paginas) {
  const blocos = blocosDe(p.nos);
  console.log(
    `${p.rota.padEnd(22)} ${String(contar(p.nos)).padStart(4)} nós` +
      (blocos.length ? `  · ${blocos.join(", ")}` : ""),
  );
}
