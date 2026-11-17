/**
 * Entidades HTML em texto que o React vai escrever como texto.
 *
 * O site antigo jogava título e resumo no innerHTML, então "&#8211;"
 * virava travessão na tela. Com React é diferente: texto é texto, e a
 * entidade apareceria crua para o leitor. Por isso ela é resolvida aqui,
 * na extração, e não na hora de renderizar.
 *
 * Vale só para os campos de texto puro (título, resumo, alt). O corpo da
 * publicação é HTML de verdade e continua como está.
 */

const NOMEADAS = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  deg: "°",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  atilde: "ã",
  otilde: "õ",
  ccedil: "ç",
  acirc: "â",
  ecirc: "ê",
  ocirc: "ô",
  agrave: "à",
};

export function decodificarTexto(texto) {
  if (!texto) return texto;
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    /* O &amp; fica por último para que "&amp;#8211;" não vire travessão:
       quem escreveu quis o texto "&#8211;" literal. */
    .replace(/&([a-z]+);/gi, (inteiro, nome) => {
      const achado = NOMEADAS[nome.toLowerCase()];
      return achado ?? inteiro;
    });
}
