/**
 * A mesclagem das publicações: migradas + painel − removidas.
 *
 * Em módulo próprio, e não dentro de src/lib/conteudo.ts, porque é aqui
 * que mora cada regra de precedência do site e isto precisa poder ser
 * testado sozinho:
 *
 * 1. Rascunho não vai ao ar (publicado === false sai).
 * 2. Mesma rota nos dois lados: vale a do painel — uma correção feita pela
 *    ABRAPESP não pode ser desfeita pela próxima geração do conteúdo.
 * 3. Rota na lista de removidos sai do site, venha de onde vier. É assim
 *    que o painel "apaga" conteúdo migrado sem tocar nos arquivos gerados.
 * 4. A ordem final é por data, da mais recente para a mais antiga.
 */

type ComRota = {
  rota: string;
  data: string | null;
  publicado?: boolean;
};

export type Removido = {
  rota: string;
  titulo: string;
  por: string;
  em: string;
};

export function mesclarPublicacoes<T extends ComRota>(
  migradas: T[],
  doPainel: (T & { publicado?: boolean })[],
  removidas: { rota: string }[],
): T[] {
  const foraDoAr = new Set(removidas.map((r) => r.rota));
  const painel = doPainel.filter(
    (p) => p.publicado !== false && !foraDoAr.has(p.rota),
  );
  const rotasDoPainel = new Set(painel.map((p) => p.rota));
  const restantes = migradas.filter(
    (p) => !rotasDoPainel.has(p.rota) && !foraDoAr.has(p.rota),
  );
  return [...painel.map((p) => p as T), ...restantes].sort((a, b) =>
    (b.data ?? "").localeCompare(a.data ?? ""),
  );
}
