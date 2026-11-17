/**
 * Medida e nomeação das imagens enviadas pelo painel — só cálculo.
 *
 * Separado de src/lib/admin/imagens.ts, que é `server-only` porque grava no
 * repositório. A leitura do cabeçalho de JPEG, PNG e WebP é o tipo de
 * código que erra devolvendo número errado, sem lançar nada: fica aqui para
 * ser testado sozinho, com arquivos de medida conhecida.
 */

export const TIPOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * 4 MB: casa com o limite do corpo da server action (next.config.ts) e com
 * o teto de 4,5 MB da Vercel. Na prática quase nada chega perto: o
 * navegador encolhe a imagem antes de enviar.
 */
export const TAMANHO_MAXIMO = 4 * 1024 * 1024;

/**
 * Largura e altura lidas do cabeçalho do arquivo.
 *
 * Feito à mão para os três formatos que aceitamos, em vez de trazer uma
 * biblioteca de processamento de imagem para dentro da função: ler o
 * cabeçalho custa alguns bytes, e nada aqui precisa redimensionar.
 */
export function medir(b: Buffer): { largura: number; altura: number } | null {
  // PNG: assinatura de 8 bytes, depois o bloco IHDR com largura e altura.
  if (b.length > 24 && b.toString("hex", 0, 8) === "89504e470d0a1a0a") {
    return { largura: b.readUInt32BE(16), altura: b.readUInt32BE(20) };
  }

  // JPEG: percorre os marcadores até um SOF, que carrega as dimensões.
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marcador = b[i + 1];
      // SOF0..SOF15, menos DHT (c4), JPG (c8) e DAC (cc), que não são SOF.
      if (
        marcador >= 0xc0 &&
        marcador <= 0xcf &&
        marcador !== 0xc4 &&
        marcador !== 0xc8 &&
        marcador !== 0xcc
      ) {
        /* No SOF a altura vem antes da largura; aqui saem na mesma ordem
           dos outros formatos, para o retorno ser sempre o mesmo objeto. */
        return {
          largura: b.readUInt16BE(i + 7),
          altura: b.readUInt16BE(i + 5),
        };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
    return null;
  }

  // WebP: contêiner RIFF; cada variante guarda o tamanho num lugar.
  if (
    b.length > 30 &&
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  ) {
    const variante = b.toString("ascii", 12, 16);
    if (variante === "VP8X") {
      return {
        largura: 1 + b.readUIntLE(24, 3),
        altura: 1 + b.readUIntLE(27, 3),
      };
    }
    if (variante === "VP8L") {
      const n = b.readUInt32LE(21);
      return { largura: 1 + (n & 0x3fff), altura: 1 + ((n >> 14) & 0x3fff) };
    }
    if (variante === "VP8 ") {
      return {
        largura: b.readUInt16LE(26) & 0x3fff,
        altura: b.readUInt16LE(28) & 0x3fff,
      };
    }
  }

  return null;
}

/**
 * A proporção está longe de 16:10 o bastante para o cartão recortar algo
 * que importa?
 *
 * 16:10 é a proporção do quadro das listagens (`.news-card__media` na
 * folha de estilo). O cartão recorta o que sobra, então uma imagem muito
 * mais alta perde o topo e o pé — onde costuma estar o texto da arte.
 */
export function avisoDeProporcao(
  largura: number,
  altura: number,
): string | null {
  const proporcao = largura / altura;
  const alvo = 16 / 10;
  const distancia = Math.max(proporcao / alvo, alvo / proporcao);
  if (distancia <= 1.15) {
    return largura < 1200
      ? `A imagem tem ${largura}px de largura. O ideal é 1600x1000, senão ela aparece borrada em tela grande.`
      : null;
  }
  return `A imagem é ${largura}x${altura}. Fora da proporção 16:10 o cartão da listagem recorta as bordas; se houver texto perto delas, ele some. Para o quadro inteiro, use 1600x1000.`;
}

export function nomeSeguro(nome: string, extensao: string): string {
  const base = nome
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const sufixo = Date.now().toString(36);
  return `${base || "imagem"}-${sufixo}.${extensao}`;
}
