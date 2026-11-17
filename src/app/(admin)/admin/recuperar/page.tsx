import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import Formulario from "./Formulario";

export const dynamic = "force-dynamic";

export default async function PaginaDeRecuperacao() {
  if (await usuarioDaSessao()) redirect("/admin/senha");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-ardosia-200 bg-white p-8 shadow-cartao">
        <div aria-hidden className="faixa-marca h-1 w-12 rounded-full" />
        <h1 className="mt-5 font-display text-2xl font-semibold text-ardosia-950">
          Esqueci a senha
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ardosia-600">
          Diga o e-mail da sua conta e o link de redefinição chega na caixa de
          entrada. Ele vale por uma hora e funciona uma vez.
        </p>
        <Formulario />
        <p className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-sm font-semibold text-azul-700 hover:text-azul-500"
          >
            ← Voltar para a entrada
          </Link>
        </p>
      </div>
    </main>
  );
}
