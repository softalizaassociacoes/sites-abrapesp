import { redirect } from "next/navigation";
import { painelConfigurado, usuarioDaSessao } from "@/lib/admin/sessao";
import Formulario from "./Formulario";

export const dynamic = "force-dynamic";

export default async function PaginaDeLogin() {
  if (await usuarioDaSessao()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-ardosia-200 bg-white p-8 shadow-cartao">
        <div aria-hidden className="faixa-marca h-1 w-12 rounded-full" />
        <h1 className="mt-5 font-display text-2xl font-semibold text-ardosia-950">
          Painel da ABRAPESP
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ardosia-600">
          Entre para publicar notícias e textos do blog.
        </p>

        {painelConfigurado() ? (
          <Formulario />
        ) : (
          <p className="mt-6 rounded-xl border border-ouro-200 bg-ouro-50 p-4 text-sm leading-relaxed text-ouro-900">
            O painel ainda não foi configurado neste servidor. Falta cadastrar
            as variáveis <code>ADMIN_SESSION_SECRET</code> e{" "}
            <code>ADMIN_USUARIOS</code>.
          </p>
        )}
      </div>
    </main>
  );
}
