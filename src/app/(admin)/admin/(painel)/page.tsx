import Link from "next/link";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { podeGravar } from "@/lib/admin/repositorio";
import { recuperacaoDisponivel } from "@/lib/admin/recuperacao";
import { carregar } from "@/lib/admin/publicacoes";
import {
  formatarDataCurta,
  listar,
  SECOES,
  type TipoPublicacao,
} from "@/lib/conteudo";

export const dynamic = "force-dynamic";

const TIPOS = Object.keys(SECOES) as TipoPublicacao[];

export default async function Inicio() {
  const usuario = (await usuarioDaSessao())!;
  const doPainel = await carregar().catch(() => []);
  const recentes = [...doPainel]
    .sort((a, b) => (b.atualizado ?? "").localeCompare(a.atualizado ?? ""))
    .slice(0, 5);

  const faltando = [
    !podeGravar() && "GITHUB_TOKEN e GITHUB_REPO, para gravar",
    !recuperacaoDisponivel() &&
      "SENDGRID_API_KEY, para o e-mail de redefinição de senha",
  ].filter(Boolean) as string[];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ardosia-950">
            Olá, {usuario}
          </h1>
          <p className="mt-1.5 text-sm text-ardosia-600">
            O que a Associação publica aparece no site minutos depois de
            gravado.
          </p>
        </div>
        <Link
          href="/admin/publicacoes/nova"
          className="rounded-full bg-azul-700 px-6 py-3 text-sm font-semibold text-white shadow-cartao transition-colors hover:bg-azul-600"
        >
          Escrever publicação
        </Link>
      </header>

      {faltando.length > 0 && (
        <div className="mt-6 rounded-2xl border border-ouro-200 bg-ouro-50 p-5 text-sm leading-relaxed text-ouro-900">
          <p className="font-semibold">Falta configurar neste servidor</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {faltando.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-ardosia-500 uppercase">
          Seções do site
        </h2>
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TIPOS.map((tipo) => {
            const pelaEquipe = doPainel.filter((i) => i.tipo === tipo).length;
            return (
              <li key={tipo}>
                <Link
                  href={`/admin/publicacoes?secao=${tipo}`}
                  className="group block rounded-2xl border border-ardosia-200 bg-white p-5 shadow-cartao transition-colors hover:border-azul-300"
                >
                  <h3 className="font-display text-lg font-semibold text-ardosia-950 group-hover:text-azul-800">
                    {SECOES[tipo].nome}
                  </h3>
                  <p className="mt-1.5 text-sm text-ardosia-600">
                    {listar(tipo).length} no site
                  </p>
                  <p className="mt-2 text-xs text-ardosia-500">
                    {pelaEquipe > 0
                      ? `${pelaEquipe} pelo painel`
                      : "tudo do site antigo, por enquanto"}
                  </p>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/admin/publicacoes/nova"
              className="flex h-full min-h-28 items-center justify-center rounded-2xl border-2 border-dashed border-ardosia-300 p-5 text-sm font-semibold text-ardosia-600 transition-colors hover:border-azul-400 hover:text-azul-700"
            >
              + Escrever publicação
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold tracking-wide text-ardosia-500 uppercase">
            Últimas do painel
          </h2>
          <Link
            href="/admin/publicacoes"
            className="text-sm font-semibold text-azul-700 hover:text-azul-500"
          >
            Todas as publicações →
          </Link>
        </div>
        {recentes.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-ardosia-200 bg-white p-5 text-sm text-ardosia-600">
            Nada publicado pelo painel ainda. O conteúdo que veio do site
            antigo está em{" "}
            <Link
              href="/admin/publicacoes"
              className="font-semibold text-azul-700"
            >
              Publicações
            </Link>
            , pronto para ser corrigido ou removido.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ardosia-100 overflow-hidden rounded-2xl border border-ardosia-200 bg-white shadow-cartao">
            {recentes.map((item) => (
              <li key={item.rota}>
                <Link
                  href={`/admin/publicacoes/editar${item.rota}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-ardosia-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ardosia-900">
                      {item.titulo}
                    </span>
                    <span className="mt-0.5 block text-xs text-ardosia-500">
                      {item.data ? formatarDataCurta(item.data) : ""} · por{" "}
                      {item.criadoPor}
                      {item.publicado ? "" : " · rascunho"}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-azul-700">
                    Editar →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
