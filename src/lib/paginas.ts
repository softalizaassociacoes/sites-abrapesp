import paginasJson from "@/conteudo/paginas.json";
import type { No } from "@/lib/markup";

/**
 * As páginas institucionais, extraídas do site antigo.
 *
 * Ver scripts/extrair-paginas.mjs: o markup vem como estava e os trechos
 * que o JavaScript preenchia viram blocos nomeados.
 */

export type Pagina = {
  rota: string;
  rotaAntiga: string | null;
  slug: string;
  titulo: string;
  descricao: string;
  comHero: boolean;
  /** O markup da página, já como árvore. Ver src/lib/markup.ts. */
  nos: No[];
};

export const paginas = paginasJson as unknown as Pagina[];

const porRota = new Map(paginas.map((p) => [p.rota, p]));

export function paginaPorRota(rota: string): Pagina | undefined {
  return porRota.get(rota);
}

/** Todas menos a home, que tem arquivo próprio. */
export function rotasDeConteudo(): string[] {
  return paginas.map((p) => p.rota).filter((r) => r !== "/");
}
