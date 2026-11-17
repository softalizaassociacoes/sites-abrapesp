/**
 * Converte o site estático antigo (pasta legado/) no conteúdo do Next.
 *
 * Os HTMLs de notícia são muito regulares: vieram todos da mesma
 * conversão do WordPress/Wix. O índice assets/js/noticias-data.js já traz
 * os metadados (slug, título, data, categoria, resumo, capa); daqui sai o
 * corpo, de dentro de <article class="prose">.
 *
 * Gera src/conteudo/publicacoes.json, sobrescrevendo-o inteiro. O que o
 * painel publica fica noutro arquivo e nunca é tocado por este script —
 * ver src/conteudo-editavel/LEIA-ME.md.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import { decodificarTexto } from "./lib-texto.mjs";

const raiz = path.resolve(import.meta.dirname, "..");
const legado = path.join(raiz, "legado");

/** Lê o índice de notícias sem precisar de um navegador. */
function lerIndice() {
  const js = fs.readFileSync(
    path.join(raiz, "public/assets/js/noticias-data.js"),
    "utf8",
  );
  const abre = js.indexOf("[");
  const fecha = js.lastIndexOf("]");
  return JSON.parse(js.slice(abre, fecha + 1));
}

/** O tipo de publicação, a partir da categoria do índice. */
function tipoDe(catSlug) {
  return catSlug === "coluna" ? "coluna" : "noticia";
}

const PREFIXO = { noticia: "/noticias", coluna: "/coluna-de-associados" };

/** "11/02/2025" + iso do índice → data ISO confiável. */
function dataDe(item) {
  if (item.iso) return item.iso;
  const [d, m, a] = (item.date ?? "").split("/");
  return d && m && a ? `${a}-${m}-${d}T00:00:00` : null;
}

/** Caminhos de mídia do HTML antigo são relativos; no Next são absolutos. */
function absolutizar(html) {
  return html
    .replace(/(src|href)="assets\//g, '$1="/assets/')
    .replace(/(src|href)="\.\/assets\//g, '$1="/assets/');
}

/**
 * Links de uma notícia para outra apontavam para "outra-coisa.html".
 * Sem esta troca eles morreriam: no Next a mesma notícia mora em
 * /noticias/outra-coisa. Endereço de fora termina em .html também (notícia
 * de jornal, por exemplo), por isso a troca só vale para o que o mapa
 * conhece.
 */
function religar(html, rotas) {
  return html.replace(
    /href="(?:\.\/)?([a-z0-9-]+)\.html"/g,
    (original, slug) => (rotas.has(slug) ? `href="${rotas.get(slug)}"` : original),
  );
}

function corpoDe(arquivo, rotas) {
  const html = fs.readFileSync(arquivo, "utf8");
  const doc = parse(html);
  const artigo = doc.querySelector("article.prose");
  if (!artigo) return null;

  /* A capa já é mostrada pelo template da publicação; deixá-la no corpo
     faria a mesma imagem aparecer duas vezes. */
  artigo.querySelector("figure.article-feat")?.remove();

  return religar(absolutizar(artigo.innerHTML.trim()), rotas);
}

function capaDe(item) {
  if (!item.img) return null;
  return {
    src: `/${item.img.replace(/^\/+/, "")}`,
    alt: decodificarTexto(item.title),
  };
}

function extrair() {
  const indice = lerIndice();
  const publicacoes = [];
  const faltando = [];

  /* O mapa inteiro primeiro: uma notícia linka outra que vem depois dela
     na lista, então religar durante a varredura deixaria links para trás. */
  const rotas = new Map(
    indice.map((i) => [i.slug, `${PREFIXO[tipoDe(i.catSlug)]}/${i.slug}`]),
  );

  indice.forEach((item, posicao) => {
    const arquivo = path.join(legado, `${item.slug}.html`);
    if (!fs.existsSync(arquivo)) {
      faltando.push(item.slug);
      return;
    }
    const html = corpoDe(arquivo, rotas);
    if (html === null) {
      faltando.push(`${item.slug} (sem <article class="prose">)`);
      return;
    }
    const tipo = tipoDe(item.catSlug);
    publicacoes.push({
      id: posicao + 1,
      origem: "post",
      tipo,
      slug: item.slug,
      rota: `${PREFIXO[tipo]}/${item.slug}`,
      rotaAntiga: `/${item.slug}.html`,
      titulo: decodificarTexto(item.title),
      resumo: decodificarTexto(item.excerpt ?? ""),
      data: dataDe(item),
      atualizado: null,
      capa: capaDe(item),
      html,
    });
  });

  return { publicacoes, faltando };
}

const { publicacoes, faltando } = extrair();

fs.writeFileSync(
  path.join(raiz, "src/conteudo/publicacoes.json"),
  `${JSON.stringify(publicacoes, null, 2)}\n`,
);

const porTipo = publicacoes.reduce((c, p) => {
  c[p.tipo] = (c[p.tipo] ?? 0) + 1;
  return c;
}, {});

console.log(`publicações: ${publicacoes.length}`, porTipo);
console.log(`sem corpo aproveitável: ${faltando.length}`);
faltando.forEach((f) => console.log(`  - ${f}`));
