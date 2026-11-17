import Link from "next/link";
import { carregar, removidos } from "@/lib/admin/publicacoes";
import {
  formatarDataCurta,
  publicacoesMigradas,
  SECOES,
  type Item,
  type TipoPublicacao,
} from "@/lib/conteudo";
import type { ItemDoPainel } from "@/lib/publicacoes-painel";
import { InterruptorNoAr } from "./Acoes";

export const dynamic = "force-dynamic";

/**
 * Tudo o que o site publica, num lugar só: o que a equipe escreveu pelo
 * painel e as 137 publicações que vieram do site antigo. As duas se
 * corrigem e se removem daqui — é o que faltava para a Associação não
 * depender de ninguém nem para consertar uma vírgula de 2019.
 */

const TIPOS = Object.keys(SECOES) as TipoPublicacao[];

type Linha = {
  titulo: string;
  rota: string;
  data: string | null;
  tipo: TipoPublicacao;
  doPainel?: ItemDoPainel;
  corrigeMigrada: boolean;
  foraDoAr: boolean;
};

function montarLinhas(
  doPainel: ItemDoPainel[],
  secao: TipoPublicacao | null,
  busca: string,
  rotasRemovidas: Set<string>,
): Linha[] {
  const rotasDoPainel = new Set(doPainel.map((i) => i.rota));

  /* As migradas com lápide continuam na lista, com o interruptor
     desligado: religar é um clique, sem procurar noutra tela. */
  const migradas = publicacoesMigradas.filter(
    (i) => !rotasDoPainel.has(i.rota),
  );

  const linhas: Linha[] = [
    ...doPainel.map((i) => ({
      titulo: i.titulo,
      rota: i.rota,
      data: i.data,
      tipo: i.tipo,
      doPainel: i,
      corrigeMigrada: publicacoesMigradas.some((m) => m.rota === i.rota),
      foraDoAr: rotasRemovidas.has(i.rota) || !i.publicado,
    })),
    ...migradas.map((i: Item) => ({
      titulo: i.titulo,
      rota: i.rota,
      data: i.data,
      tipo: i.tipo,
      corrigeMigrada: false,
      foraDoAr: rotasRemovidas.has(i.rota),
    })),
  ];

  const baixa = busca.trim().toLowerCase();
  return linhas
    .filter((l) => !secao || l.tipo === secao)
    .filter((l) => !baixa || l.titulo.toLowerCase().includes(baixa))
    .sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""));
}

function Etiqueta({
  children,
  tom,
}: {
  children: React.ReactNode;
  tom: string;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tom}`}
    >
      {children}
    </span>
  );
}

/** O no ar/fora do ar quem diz é o interruptor; aqui, só o resto. */
function Estado({ linha }: { linha: Linha }) {
  const i = linha.doPainel;
  return (
    <>
      {i && !i.publicado && (
        <Etiqueta tom="bg-ardosia-200 text-ardosia-700">rascunho</Etiqueta>
      )}
      {linha.corrigeMigrada && (
        <Etiqueta tom="bg-ouro-100 text-ouro-900">correção</Etiqueta>
      )}
    </>
  );
}

export default async function Publicacoes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const secao = (TIPOS as string[]).includes(String(params.secao))
    ? (String(params.secao) as TipoPublicacao)
    : null;
  const busca = typeof params.q === "string" ? params.q : "";
  const limite = Math.min(Number(params.limite) || 30, 500);

  const [doPainel, lapides] = await Promise.all([
    carregar().catch(() => []),
    removidos().catch(() => []),
  ]);
  const linhas = montarLinhas(
    doPainel,
    secao,
    busca,
    new Set(lapides.map((r) => r.rota)),
  );
  const visiveis = linhas.slice(0, limite);

  const comFiltros = (mudanca: Record<string, string | null>) => {
    const q = new URLSearchParams();
    if (secao) q.set("secao", secao);
    if (busca) q.set("q", busca);
    for (const [chave, valor] of Object.entries(mudanca)) {
      if (valor === null) q.delete(chave);
      else q.set(chave, valor);
    }
    const texto = q.toString();
    return texto ? `/admin/publicacoes?${texto}` : "/admin/publicacoes";
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ardosia-950">
            Publicações
          </h1>
          <p className="mt-1.5 text-sm text-ardosia-600">
            Tudo o que o site mostra — escrito pelo painel ou vindo do site
            antigo. Corrija ou tire do ar.
          </p>
        </div>
        <Link
          href="/admin/publicacoes/nova"
          className="rounded-full bg-azul-700 px-6 py-3 text-sm font-semibold text-white shadow-cartao transition-colors hover:bg-azul-600"
        >
          Escrever
        </Link>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={comFiltros({ secao: null, limite: null })}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            !secao
              ? "bg-azul-700 text-white"
              : "border border-ardosia-300 bg-white text-ardosia-700 hover:border-azul-400"
          }`}
        >
          Todas
        </Link>
        {TIPOS.map((tipo) => (
          <Link
            key={tipo}
            href={comFiltros({ secao: tipo, limite: null })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              secao === tipo
                ? "bg-azul-700 text-white"
                : "border border-ardosia-300 bg-white text-ardosia-700 hover:border-azul-400"
            }`}
          >
            {SECOES[tipo].nome}
          </Link>
        ))}
      </div>

      <form
        method="get"
        action="/admin/publicacoes"
        className="mt-4 flex gap-2"
      >
        {secao && <input type="hidden" name="secao" value={secao} />}
        <input
          type="search"
          name="q"
          defaultValue={busca}
          placeholder="Buscar pelo título…"
          className="w-full max-w-md rounded-full border border-ardosia-300 bg-white px-5 py-2.5 text-sm text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200"
        />
        <button
          type="submit"
          className="rounded-full border border-ardosia-300 bg-white px-5 py-2.5 text-sm font-semibold text-ardosia-800 transition-colors hover:border-azul-400"
        >
          Buscar
        </button>
      </form>

      <p className="mt-4 text-sm text-ardosia-500">
        {linhas.length} {linhas.length === 1 ? "publicação" : "publicações"}
        {busca && ` para "${busca}"`}
        {lapides.length > 0 && (
          <>
            {" "}
            ·{" "}
            <Link
              href="/admin/publicacoes/removidos"
              className="font-semibold text-azul-700 hover:text-azul-500"
            >
              {lapides.length} fora do ar
            </Link>
          </>
        )}
      </p>

      <ul className="mt-3 divide-y divide-ardosia-100 overflow-hidden rounded-2xl border border-ardosia-200 bg-white shadow-cartao">
        {visiveis.length === 0 && (
          <li className="px-5 py-8 text-sm text-ardosia-600">
            Nada aqui com estes filtros.
          </li>
        )}
        {visiveis.map((l) => {
          const noAr = !l.foraDoAr;
          const editar = `/admin/publicacoes/editar${l.rota}`;
          return (
            <li
              key={l.rota}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
            >
              <div className="min-w-0 flex-1 basis-64">
                <Link
                  href={editar}
                  className="block truncate font-medium text-ardosia-900 hover:text-azul-800"
                >
                  {l.titulo}
                </Link>
                <p className="mt-0.5 text-xs text-ardosia-500">
                  {l.data ? formatarDataCurta(l.data) : "sem data"} ·{" "}
                  {SECOES[l.tipo].nome}
                  {l.doPainel
                    ? ` · por ${l.doPainel.criadoPor}`
                    : " · do site antigo"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Estado linha={l} />
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {noAr && (
                  <a
                    href={l.rota}
                    target="_blank"
                    rel="noopener"
                    className="text-sm font-semibold text-ardosia-500 transition-colors hover:text-azul-700"
                  >
                    Ver
                  </a>
                )}
                <Link
                  href={editar}
                  className="text-sm font-semibold text-azul-700 hover:text-azul-500"
                >
                  Editar
                </Link>
                <InterruptorNoAr
                  rota={l.rota}
                  titulo={l.titulo}
                  ligado={noAr}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {linhas.length > visiveis.length && (
        <div className="mt-4 text-center">
          <Link
            href={comFiltros({ limite: String(limite + 60) })}
            className="inline-block rounded-full border border-ardosia-300 bg-white px-6 py-2.5 text-sm font-semibold text-ardosia-800 transition-colors hover:border-azul-400"
          >
            Mostrar mais ({linhas.length - visiveis.length} restantes)
          </Link>
        </div>
      )}
    </div>
  );
}
