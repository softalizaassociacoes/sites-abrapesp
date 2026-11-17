import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Publicacao from "@/components/Publicacao";
import { itemPorRota, listar } from "@/lib/conteudo";

/** Só existem as rotas das colunas que o site tem. */
export const dynamicParams = false;

/**
 * Uma regeneração por dia.
 *
 * O painel grava um commit e o deploy publica a mudança, então não é a
 * revalidação que traz o conteúdo novo. Ela cobre o que depende da
 * passagem do tempo — o ano no rodapé, por exemplo.
 */
export const revalidate = 86400;

export function generateStaticParams() {
  return listar("coluna").map((i) => ({ slug: i.slug }));
}

export async function generateMetadata(
  props: PageProps<"/coluna-de-associados/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = itemPorRota(`/coluna-de-associados/${slug}`);
  if (!item) return {};
  return {
    title: item.titulo,
    description: item.resumo,
    openGraph: {
      title: item.titulo,
      description: item.resumo,
      type: "article",
      ...(item.capa ? { images: [item.capa.src] } : {}),
    },
  };
}

export default async function PaginaDeColuna(
  props: PageProps<"/coluna-de-associados/[slug]">,
) {
  const { slug } = await props.params;
  const item = itemPorRota(`/coluna-de-associados/${slug}`);
  if (!item) notFound();
  return <Publicacao item={item} />;
}
