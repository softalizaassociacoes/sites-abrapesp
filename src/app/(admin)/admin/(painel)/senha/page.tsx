import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { podeGravar } from "@/lib/admin/repositorio";
import Formulario from "./Formulario";

export const dynamic = "force-dynamic";

export default async function PaginaDeSenha() {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-xl lg:mx-0">
      <header className="border-b border-ardosia-300 pb-5">
        <h1 className="mt-3 font-display text-2xl font-semibold text-ardosia-950">
          Trocar a minha senha
        </h1>
        <p className="mt-1.5 text-sm text-ardosia-600">Conta de {usuario}.</p>
      </header>

      {podeGravar() ? (
        <Formulario />
      ) : (
        <div className="mt-8 rounded-2xl border border-ouro-200 bg-ouro-50 p-5 text-sm leading-relaxed text-ouro-900">
          <p className="font-semibold">A gravação não está configurada</p>
          <p className="mt-2">
            Falta cadastrar <code>GITHUB_TOKEN</code> e <code>GITHUB_REPO</code>{" "}
            neste servidor, então a senha nova não seria guardada.
          </p>
        </div>
      )}

      <p className="mt-6 text-sm leading-relaxed text-ardosia-600">
        A senha nova passa a valer quando o site terminar de publicar, uns três
        minutos depois. Até lá, a antiga continua funcionando.
      </p>
    </div>
  );
}
