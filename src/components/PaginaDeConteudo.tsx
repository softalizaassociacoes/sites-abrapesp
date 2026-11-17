import { createElement, Fragment, type ReactNode } from "react";
import Bloco from "@/components/blocos";
import {
  estiloComoObjeto,
  nomeDoAtributo,
  type No,
} from "@/lib/markup";
import type { Pagina } from "@/lib/paginas";

/**
 * Uma página institucional: o markup do site antigo, renderizado a partir
 * da árvore extraída, com os blocos dinâmicos no lugar exato onde
 * estavam.
 *
 * Ver src/lib/markup.ts para o porquê de ser uma árvore e não HTML cru.
 */

/** Elementos SVG e HTML que não têm filhos nem tag de fechamento. */
const SEM_FILHOS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "use",
  "stop",
]);

function props(attrs: Record<string, string>, chave: number) {
  const saida: Record<string, unknown> = { key: chave };
  for (const [nome, valor] of Object.entries(attrs)) {
    if (nome === "style") {
      saida.style = estiloComoObjeto(valor);
      continue;
    }
    saida[nomeDoAtributo(nome)] = valor;
  }
  return saida;
}

function renderizar(no: No, chave: number): ReactNode {
  if (no.t === "texto") return no.v;
  if (no.t === "bloco") {
    return (
      <Bloco
        key={chave}
        nome={no.nome}
        limite={no.limite}
        classe={no.classe}
      />
    );
  }

  const atributos = props(no.attrs, chave);
  if (SEM_FILHOS.has(no.nome)) return createElement(no.nome, atributos);
  return createElement(
    no.nome,
    atributos,
    no.filhos.map((f, i) => renderizar(f, i)),
  );
}

export default function PaginaDeConteudo({ pagina }: { pagina: Pagina }) {
  return (
    <Fragment>{pagina.nos.map((no, i) => renderizar(no, i))}</Fragment>
  );
}
