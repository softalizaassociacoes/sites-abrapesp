import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";
import { publicacoes } from "@/lib/conteudo";
import { paginas } from "@/lib/paginas";

/** As listagens não saem do conteúdo; entram aqui à mão. */
const LISTAGENS = ["/noticias", "/coluna-de-associados"];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (rota: string) => `${siteUrl}${rota === "/" ? "" : rota}`;

  return [
    ...paginas.map((p) => ({
      url: url(p.rota),
      changeFrequency: "monthly" as const,
      priority: p.rota === "/" ? 1 : 0.8,
    })),
    ...LISTAGENS.map((rota) => ({
      url: url(rota),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...publicacoes.map((p) => ({
      url: url(p.rota),
      lastModified: p.atualizado ?? p.data ?? undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
