import { SECOES, type Item, type TipoPublicacao } from "@/lib/conteudo";

/**
 * Forma das publicações do painel e as funções que só dependem dos dados.
 *
 * Separado de src/lib/admin/publicacoes.ts porque aquele módulo é
 * `server-only`: grava no repositório e nunca pode ir para o navegador.
 * Isto aqui é só cálculo, serve aos dois lados e pode ser testado sozinho.
 */

/** O que o painel guarda além do que o site já conhece. */
export type ItemDoPainel = Item & {
  /** Falso enquanto é rascunho; só o publicado aparece no site. */
  publicado: boolean;
  criadoPor: string;
  criadoEm: string;
};

export type Rascunho = {
  /** Mantém esta rota em vez de calcular do título (correções e itens já no ar). */
  rota?: string;
  tipo: TipoPublicacao;
  titulo: string;
  resumo: string;
  html: string;
  data: string;
  capa: Item["capa"];
  publicado: boolean;
};

export function comoSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/**
 * Identificadores que não colidem com os do conteúdo migrado.
 *
 * O migrado foi numerado de 1 a 137, na ordem do índice antigo. O painel
 * começa bem acima disso, então as duas numerações nunca se cruzam, nem
 * se a migração for refeita com mais itens.
 */
export function proximoId(existentes: ItemDoPainel[]): number {
  return existentes.reduce((m, i) => Math.max(m, i.id), 1_000_000) + 1;
}

/**
 * Texto escrito à mão vira parágrafos de verdade.
 *
 * O campo guarda HTML, mas ninguém que escreve uma notícia quer digitar
 * <p>, e não deveria mesmo: sem isto o texto vai ao ar como um bloco
 * único, porque as quebras de linha que a pessoa digitou são apenas
 * espaço em branco para o navegador.
 *
 * Quem já escreve HTML não é atrapalhado: havendo qualquer marcação de
 * bloco, o texto passa intacto.
 */
const BLOCOS =
  /<(p|div|h[1-6]|ul|ol|li|blockquote|table|figure|section|article|pre)\b/i;

export function comoParagrafos(texto: string): string {
  const limpo = texto.replace(/\r\n?/g, "\n").trim();
  if (!limpo || BLOCOS.test(limpo)) return texto.trim();
  return limpo
    .split(/\n{2,}|\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => `<p>${linha}</p>`)
    .join("\n");
}

/** O resumo que vai no cartão, quando quem escreveu não digitou um. */
export function resumoAutomatico(html: string, limite = 180): string {
  const texto = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  const espaco = corte.lastIndexOf(" ");
  return `${(espaco > 60 ? corte.slice(0, espaco) : corte).trim()}…`;
}

export function montar(
  rascunho: Rascunho,
  id: number,
  autor: string,
  criadoEm: string,
): ItemDoPainel {
  const slug = comoSlug(rascunho.titulo) || `publicacao-${id}`;
  /* Uma rota recebida fica como está: é o caso da correção de conteúdo já
     no ar, em que a rota é o vínculo com o item que ela substitui, e o de
     um item publicado, cujo endereço não pode mudar porque o título
     mudou — quebraria link compartilhado. */
  const rota = rascunho.rota ?? `${SECOES[rascunho.tipo].prefixo}/${slug}`;
  const html = comoParagrafos(rascunho.html);

  return {
    id,
    origem: "post",
    tipo: rascunho.tipo,
    slug: rascunho.rota ? (rascunho.rota.split("/").pop() ?? slug) : slug,
    rota,
    rotaAntiga: null,
    titulo: rascunho.titulo.trim(),
    resumo: rascunho.resumo.trim() || resumoAutomatico(html),
    data: rascunho.data,
    atualizado: new Date().toISOString(),
    capa: rascunho.capa,
    html,
    publicado: rascunho.publicado,
    criadoPor: autor,
    criadoEm,
  };
}

/** Ordena como as listagens do site esperam: da mais recente para a mais antiga. */
export function porData<T extends { data: string | null }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""));
}
