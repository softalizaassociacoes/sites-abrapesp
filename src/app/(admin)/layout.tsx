import type { Metadata } from "next";
import "./painel.css";

/**
 * O painel tem layout próprio, sem o cabeçalho e o rodapé do site: quem
 * está publicando não precisa do menu do visitante, e misturar os dois
 * confunde o que é a página e o que é a ferramenta.
 *
 * As fontes são as mesmas do site, servidas do próprio domínio.
 */
export const metadata: Metadata = {
  title: "Painel da ABRAPESP",
  icons: { icon: "/assets/img/favicon-abrapesp.png" },
  robots: { index: false, follow: false, nocache: true },
};

export default function LayoutDoPainel({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="stylesheet" href="/assets/css/fonts.css" />
      </head>
      <body className="min-h-full bg-ardosia-100 font-sans">{children}</body>
    </html>
  );
}
