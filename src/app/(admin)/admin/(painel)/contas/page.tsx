import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { ehAdministrador, origemDasContas } from "@/lib/admin/usuarios";
import { podeGravar } from "@/lib/admin/repositorio";
import { contas } from "@/lib/admin/contas";
import Contas from "./Contas";

export const dynamic = "force-dynamic";

export default async function PaginaDeContas() {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/admin/login");

  const lista = await contas().catch(() => []);
  const origem = origemDasContas();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="border-b border-ardosia-300 pb-5">
        <h1 className="mt-3 font-display text-2xl font-semibold text-ardosia-950">
          Contas
        </h1>
        <p className="mt-1.5 text-sm text-ardosia-600">
          Quem pode entrar no painel e publicar no site.
        </p>
      </header>

      {!podeGravar() && (
        <div className="mt-8 rounded-2xl border border-ouro-200 bg-ouro-50 p-5 text-sm leading-relaxed text-ouro-900">
          <p className="font-semibold">A gravação não está configurada</p>
          <p className="mt-2">
            Falta cadastrar <code>GITHUB_TOKEN</code> e <code>GITHUB_REPO</code>{" "}
            neste servidor. Até lá a lista aparece, mas nenhuma alteração seria
            guardada.
          </p>
        </div>
      )}

      {origem === "variavel" && (
        <div className="mt-8 rounded-2xl border border-ouro-200 bg-ouro-50 p-5 text-sm leading-relaxed text-ouro-900">
          <p className="font-semibold">Primeiro acesso</p>
          <p className="mt-2">
            As contas de agora vêm da variável <code>ADMIN_USUARIOS</code>, que
            serve só para abrir o painel na primeira vez. A primeira conta que
            você criar aqui passa a lista para o repositório, e a variável deixa
            de ser usada — pode ser apagada do Vercel depois disso.
          </p>
        </div>
      )}

      <Contas
        contas={lista}
        eu={usuario}
        souAdministrador={ehAdministrador(usuario)}
      />

      <div className="mt-8 rounded-2xl border border-ardosia-200 bg-white p-6 text-sm leading-relaxed text-ardosia-700">
        <h2 className="font-display text-base font-semibold text-ardosia-950">
          Duas coisas que valem saber
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Criar, remover ou trocar senha vira um commit e um deploy, então a
            alteração vale uns três minutos depois — não na hora.
          </li>
          <li>
            Para cortar um acesso imediatamente, troque{" "}
            <code>ADMIN_SESSION_SECRET</code> no Vercel: isso encerra todas as
            sessões abertas de uma vez.
          </li>
        </ul>
      </div>
    </div>
  );
}
