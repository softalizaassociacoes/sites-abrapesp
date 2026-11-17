/**
 * O markup das páginas institucionais como árvore, não como texto.
 *
 * A primeira tentativa foi mais simples: guardar o HTML inteiro e quebrá-lo
 * nos pontos onde entram os blocos dinâmicos. Não funciona — esses pontos
 * ficam no meio de uma `<section>`, então cada pedaço saía com tags
 * abertas e sem fechar. O navegador completa o que falta ao montar o
 * primeiro pedaço e descarta o fechamento do seguinte: a estrutura muda,
 * o React vê um DOM diferente do que renderizou e a hidratação quebra.
 *
 * Com a árvore, o bloco dinâmico é um nó como outro qualquer, no lugar
 * exato onde estava, e nada fica desbalanceado.
 */

export type No =
  | { t: "texto"; v: string }
  | { t: "bloco"; nome: string; limite?: number; classe?: string }
  | { t: "tag"; nome: string; attrs: Record<string, string>; filhos: No[] };

/** Atributos cujo nome em JSX difere do nome em HTML. */
const RENOMEADOS: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  charset: "charSet",
  viewbox: "viewBox",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "stroke-miterlimit": "strokeMiterlimit",
  tabindex: "tabIndex",
  maxlength: "maxLength",
  readonly: "readOnly",
  autocomplete: "autoComplete",
  colspan: "colSpan",
  rowspan: "rowSpan",
  srcset: "srcSet",
  "xlink:href": "xlinkHref",
};

/** `style="a:b;c:d"` vira o objeto que o React espera. */
export function estiloComoObjeto(valor: string): Record<string, string> {
  const estilo: Record<string, string> = {};
  for (const regra of valor.split(";")) {
    const corte = regra.indexOf(":");
    if (corte < 0) continue;
    const prop = regra.slice(0, corte).trim();
    const v = regra.slice(corte + 1).trim();
    if (!prop || !v) continue;
    /* Propriedade com hífen vira camelCase, menos as variáveis CSS
       (--cor-x), que o React repassa como estão. */
    const nome = prop.startsWith("--")
      ? prop
      : prop.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase());
    estilo[nome] = v;
  }
  return estilo;
}

export function nomeDoAtributo(nome: string): string {
  return RENOMEADOS[nome] ?? RENOMEADOS[nome.toLowerCase()] ?? nome;
}
