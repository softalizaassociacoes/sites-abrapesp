import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/admin/sessao";
import { carregar, migradaPorRota } from "@/lib/admin/publicacoes";
import Editor, { type Versao } from "../../Editor";

export const dynamic = "force-dynamic";

/**
 * Editar o que mora numa rota — venha do painel ou do site antigo.
 *
 * É uma tela só para os dois casos porque, para quem escreve, são a mesma
 * coisa: abrir o texto que está no ar e corrigi-lo. A diferença fica no
 * que acontece ao gravar, e está explicada na própria tela.
 *
 * Gravar a correção de um item migrado cria a versão do painel na MESMA
 * rota, e a mesclagem do site passa a mostrá-la no lugar do original (ver
 * src/lib/mesclar-publicacoes.ts). O original não é tocado: some a
 * correção, ele volta.
 */
export default async function EditarPublicacao({
  params,
}: {
  params: Promise<{ rota: string[] }>;
}) {
  if (!(await usuarioDaSessao())) redirect("/admin/login");

  const { rota: segmentos } = await params;
  const rota = `/${segmentos.join("/")}`;

  const doPainel = (await carregar()).find((i) => i.rota === rota);
  const migrada = migradaPorRota(rota);
  const item = doPainel ?? migrada;
  if (!item) notFound();

  const versao: Versao = {
    titulo: item.titulo,
    resumo: item.resumo,
    html: item.html,
    data: item.data ?? new Date().toISOString(),
    capa: item.capa,
    rota: item.rota,
    publicado: doPainel ? doPainel.publicado : true,
  };

  const correcao = !doPainel && Boolean(migrada);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/publicacoes"
        className="text-sm font-semibold text-azul-700 hover:text-azul-500"
      >
        ← Publicações
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold leading-snug text-ardosia-950">
        {item.titulo}
      </h1>
      {correcao && (
        <p className="mt-2 rounded-xl bg-ardosia-100 px-4 py-3 text-sm leading-relaxed text-ardosia-700">
          Este texto veio do site antigo. Publicar põe a sua correção no
          mesmo endereço, por cima do original — que continua guardado: tire
          a correção do ar e o texto antigo volta.
        </p>
      )}

      <div className="mt-8">
        <Editor
          tipoInicial={item.tipo}
          inicial={versao}
          correcao={correcao}
        />
      </div>
    </div>
  );
}
