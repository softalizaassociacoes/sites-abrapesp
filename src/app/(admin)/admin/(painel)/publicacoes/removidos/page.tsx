import Link from "next/link";
import { removidos } from "@/lib/admin/publicacoes";
import { BotaoDevolverAoAr } from "../Acoes";

export const dynamic = "force-dynamic";

/**
 * O que foi tirado do ar. Conteúdo migrado não é apagado de verdade — é o
 * gerador que o recriaria —, então fica uma lápide, e daqui ela se desfaz.
 */
export default async function Removidos() {
  const lista = await removidos().catch(() => []);

  return (
    <div>
      <header>
        <Link
          href="/admin/publicacoes"
          className="text-sm font-semibold text-azul-700 hover:text-azul-500"
        >
          ← Publicações
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ardosia-950">
          Fora do ar
        </h1>
        <p className="mt-1.5 text-sm text-ardosia-600">
          O que foi removido do site antigo continua guardado: devolver é um
          clique. O que foi escrito pelo painel e removido fica só no histórico
          do repositório.
        </p>
      </header>

      {lista.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-ardosia-200 bg-white p-5 text-sm text-ardosia-600">
          Nada fora do ar.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-ardosia-100 overflow-hidden rounded-2xl border border-ardosia-200 bg-white shadow-cartao">
          {lista.map((r) => (
            <li
              key={r.rota}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ardosia-900">
                  {r.titulo}
                </p>
                <p className="mt-0.5 text-xs text-ardosia-500">
                  {r.rota} · removido por {r.por}
                </p>
              </div>
              <BotaoDevolverAoAr rota={r.rota} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
