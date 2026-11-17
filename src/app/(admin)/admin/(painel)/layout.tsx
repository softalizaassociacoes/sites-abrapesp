import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { ehAdministrador } from "@/lib/admin/usuarios";
import { sair } from "@/app/(admin)/admin/acoes";
import Navegacao, { type ItemDeNavegacao } from "./Navegacao";

/**
 * O shell de todas as telas logadas: a navegação mora aqui, uma vez, em
 * vez de cada página inventar os seus botões. No desktop é a coluna à
 * esquerda; no celular, a barra no topo. A entrada e a redefinição de
 * senha ficam fora deste grupo porque não têm sessão.
 */
export default async function LayoutDasTelas({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/admin/login");
  const administrador = ehAdministrador(usuario);

  const itens: ItemDeNavegacao[] = [
    { href: "/admin", rotulo: "Início" },
    { href: "/admin/publicacoes", rotulo: "Publicações", prefixo: true },
    { href: "/admin/contas", rotulo: "Contas" },
    { href: "/admin/senha", rotulo: "Minha senha" },
  ];

  const Quem = (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-full bg-azul-100 font-display text-sm font-semibold text-azul-800"
      >
        {usuario.slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ardosia-900">
          {usuario}
        </span>
        <span className="block text-xs text-ardosia-500">
          {administrador ? "Administrador" : "Editor"}
        </span>
      </span>
    </div>
  );

  const Sair = (
    <form action={sair}>
      <button
        type="submit"
        className="rounded-full border border-ardosia-300 px-4 py-2 text-sm font-semibold text-ardosia-700 transition-colors hover:border-azul-400 hover:text-azul-700"
      >
        Sair
      </button>
    </form>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Coluna do desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-ardosia-200 bg-white lg:flex lg:flex-col">
        <div className="sticky top-0 flex h-screen flex-col p-6">
          <div>
            <div aria-hidden className="faixa-marca h-1 w-12 rounded-full" />
            <p className="mt-4 font-display text-lg font-semibold text-ardosia-950">
              Painel da ABRAPESP
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="mt-1 block text-xs font-semibold text-azul-700 hover:text-azul-500"
            >
              Ver o site →
            </a>
          </div>
          <div className="mt-8 flex-1">
            <Navegacao itens={itens} aoLado />
          </div>
          <div className="space-y-4 border-t border-ardosia-200 pt-5">
            {Quem}
            {Sair}
          </div>
        </div>
      </aside>

      {/* Barra do celular */}
      <div className="min-w-0 flex-1">
        <header className="border-b border-ardosia-200 bg-white px-4 pt-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div aria-hidden className="faixa-marca h-1 w-10 rounded-full" />
              <p className="mt-2 font-display text-base font-semibold text-ardosia-950">
                Painel da ABRAPESP
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="text-xs font-semibold text-azul-700"
              >
                Ver o site →
              </a>
              {Sair}
            </div>
          </div>
          <div className="mt-3 -mx-4 px-4">
            <Navegacao itens={itens} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
