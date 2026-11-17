import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaginaDeConteudo from "@/components/PaginaDeConteudo";
import { paginaPorRota } from "@/lib/paginas";

export const revalidate = 86400;

const home = paginaPorRota("/");

export const metadata: Metadata = {
  description: home?.descricao,
};

export default function Home() {
  if (!home) notFound();
  return <PaginaDeConteudo pagina={home} />;
}
