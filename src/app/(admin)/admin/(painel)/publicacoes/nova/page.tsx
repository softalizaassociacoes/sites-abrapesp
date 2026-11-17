import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import Editor from "../Editor";

export const dynamic = "force-dynamic";

export default async function PublicacaoNova() {
  if (!(await usuarioDaSessao())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/publicacoes"
        className="text-sm font-semibold text-azul-700 hover:text-azul-500"
      >
        ← Publicações
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ardosia-950">
        Escrever
      </h1>
      <p className="mt-1.5 text-sm text-ardosia-600">
        Publicar grava a notícia e dispara o deploy; o texto entra no site em
        poucos minutos. Salvar rascunho guarda sem mostrar a ninguém.
      </p>

      <div className="mt-8">
        <Editor tipoInicial="noticia" />
      </div>
    </div>
  );
}
