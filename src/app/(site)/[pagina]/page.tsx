import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaginaDeConteudo from "@/components/PaginaDeConteudo";
import { paginaPorRota, rotasDeConteudo } from "@/lib/paginas";

/**
 * As páginas institucionais: /quem-somos, /diretoria, /estatuto e as
 * demais. Só existem as que vieram do site antigo.
 *
 * /noticias e /coluna-de-associados têm arquivo próprio e, por serem mais
 * específicas, ganham do curinga.
 */
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return rotasDeConteudo().map((rota) => ({ pagina: rota.slice(1) }));
}

export async function generateMetadata(
  props: PageProps<"/[pagina]">,
): Promise<Metadata> {
  const { pagina } = await props.params;
  const item = paginaPorRota(`/${pagina}`);
  if (!item) return {};
  return { title: item.titulo, description: item.descricao };
}

export default async function PaginaInstitucional(
  props: PageProps<"/[pagina]">,
) {
  const { pagina } = await props.params;
  const item = paginaPorRota(`/${pagina}`);
  if (!item) notFound();
  return <PaginaDeConteudo pagina={item} />;
}
