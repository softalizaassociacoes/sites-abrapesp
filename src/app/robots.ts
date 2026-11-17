import type { MetadataRoute } from "next";
import { siteIndexavel, siteUrl } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  // Em homologação o site inteiro fica fora dos buscadores. A liberação
  // acontece definindo NEXT_PUBLIC_SITE_INDEXAVEL=true na Vercel.
  if (!siteIndexavel) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    // O painel nunca entra em buscador: além do noindex das suas páginas,
    // fica barrado aqui, para o robô não gastar visita no formulário de
    // entrada nem expor que ele existe no índice.
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
