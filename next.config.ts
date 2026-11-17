import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import redirecionamentos from "./src/conteudo/redirecionamentos.json";

const raiz = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Evita que o Next suba a raiz do workspace por causa de lockfiles fora do projeto.
  turbopack: { root: raiz },
  outputFileTracingRoot: raiz,

  experimental: {
    /**
     * O envio da imagem de destaque chega por server action, e o padrão do
     * Next recusa corpo acima de 1 MB — foto de celular estoura isso. O
     * navegador encolhe a imagem antes de enviar (ver o editor do painel);
     * este limite é a folga para o caso de o encolhimento não rodar. Acima
     * de 4 MB quem corta é a Vercel, em 4,5 MB, fora do nosso alcance.
     */
    serverActions: { bodySizeLimit: "4mb" },
  },

  images: {
    /**
     * Sem otimização em tempo de execução.
     *
     * As imagens do site vieram todas convertidas da migração e já estão
     * em tamanho de web; /_next/image é cobrado por requisição e não traz
     * ganho que pague a conta aqui.
     */
    unoptimized: true,
  },

  poweredByHeader: false,

  /**
   * Todo endereço do site estático antigo tem destino aqui: são as 147
   * páginas .html que ficavam na raiz. Ver
   * scripts/gerar-redirecionamentos.mjs.
   */
  async redirects() {
    return redirecionamentos.map(({ origem, destino }) => ({
      source: origem,
      destination: destino,
      permanent: true,
    }));
  },

  async headers() {
    // Enquanto em homologação, o cabeçalho HTTP reforça o noindex e cobre
    // também o que não é HTML (imagens, PDFs, sitemap).
    const indexavel = process.env.NEXT_PUBLIC_SITE_INDEXAVEL === "true";

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          ...(indexavel
            ? []
            : [
                {
                  key: "X-Robots-Tag",
                  value: "noindex, nofollow, noarchive, nosnippet",
                },
              ]),
        ],
      },
      {
        // Os arquivos migrados não mudam de endereço; cache longo é seguro.
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
