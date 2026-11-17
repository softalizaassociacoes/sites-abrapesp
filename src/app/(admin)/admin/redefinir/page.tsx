import Link from "next/link";
import { emailDoToken } from "@/lib/admin/recuperacao";
import Formulario from "./Formulario";

export const dynamic = "force-dynamic";

/**
 * A chegada do link do e-mail. O token é conferido já na abertura: link
 * vencido ou usado nem mostra o formulário, mostra o caminho de pedir
 * outro.
 */
export default async function PaginaDeRedefinicao({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = emailDoToken(token);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-ardosia-200 bg-white p-8 shadow-cartao">
        <div aria-hidden className="faixa-marca h-1 w-12 rounded-full" />
        <h1 className="mt-5 font-display text-2xl font-semibold text-ardosia-950">
          Definir a senha nova
        </h1>

        {email ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-ardosia-600">
              Para a conta de <strong>{email}</strong>. A senha nova passa a
              valer quando o site terminar de publicar, uns três minutos depois
              de gravada — você já sai daqui conectado.
            </p>
            <Formulario token={token!} />
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-ardosia-600">
              Este link não vale mais: ou passou de uma hora, ou a senha já foi
              trocada com ele.
            </p>
            <p className="mt-6">
              <Link
                href="/admin/recuperar"
                className="font-semibold text-azul-700 hover:text-azul-500"
              >
                Pedir um link novo →
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
