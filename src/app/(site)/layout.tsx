import type { Metadata, Viewport } from "next";
import Cabecalho from "@/components/Cabecalho";
import Interacoes from "@/components/Interacoes";
import Rodape from "@/components/Rodape";
import { instituicao, siteIndexavel, siteUrl } from "@/data/site";
import "../globals.css";

/**
 * A moldura do site público.
 *
 * O painel (/admin) fica fora deste grupo de rotas de propósito: ele tem
 * folha de estilo própria e não deve herdar nem o cabeçalho, nem o
 * rodapé, nem as fontes do site.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${instituicao.sigla} — ${instituicao.nome}`,
    template: `%s | ${instituicao.sigla}`,
  },
  description: instituicao.descricao,
  icons: { icon: "/assets/img/favicon-abrapesp.png" },
  robots: siteIndexavel
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false },
      },
};

export const viewport: Viewport = { themeColor: "#1a3ca8" };

export default function LayoutDoSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <Cabecalho />
        <main>{children}</main>
        <Rodape />
        <Interacoes />
      </body>
    </html>
  );
}
