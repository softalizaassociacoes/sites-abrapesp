import "server-only";
import { gravarArquivo } from "@/lib/admin/repositorio";
import {
  TAMANHO_MAXIMO,
  TIPOS,
  avisoDeProporcao,
  medir,
  nomeSeguro,
} from "@/lib/imagens-painel";

/**
 * Envio das imagens de destaque.
 *
 * A imagem vai para public/assets/img/painel/AAAA/MM/, no mesmo
 * repositório, e passa a ser servida como arquivo estático do site — igual
 * às que vieram da migração. Sem serviço de armazenamento à parte, sem
 * conta nova, e versionada junto do texto que a acompanha.
 *
 * A medida certa está em docs/imagens.md: 1600x1000, proporção 16:10, que
 * é a dos cartões das listagens. Fora dessa proporção a imagem não é
 * recusada nem recortada no envio — o cartão a recorta ao exibir —, mas
 * quem envia recebe o aviso, para saber o que vai acontecer.
 */

export class ErroDeImagem extends Error {}

export type ImagemEnviada = {
  src: string;
  largura: number;
  altura: number;
  aviso: string | null;
};

export async function enviarImagem(
  arquivo: File,
  autor: string,
): Promise<ImagemEnviada> {
  const extensao = TIPOS[arquivo.type];
  if (!extensao) {
    throw new ErroDeImagem("Formato não aceito. Envie JPG, PNG ou WebP.");
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new ErroDeImagem(
      `A imagem tem ${(arquivo.size / 1024 / 1024).toFixed(1)} MB. O limite é 4 MB; reduza a imagem e tente de novo.`,
    );
  }

  const bytes = Buffer.from(await arquivo.arrayBuffer());
  const medida = medir(bytes);
  if (!medida) {
    throw new ErroDeImagem(
      "Não consegui ler as dimensões deste arquivo. Ele pode estar corrompido.",
    );
  }

  const agora = new Date();
  const mes = String(agora.getUTCMonth() + 1).padStart(2, "0");
  const caminho = `public/assets/img/painel/${agora.getUTCFullYear()}/${mes}/${nomeSeguro(arquivo.name, extensao)}`;

  await gravarArquivo(caminho, bytes, `Envia imagem ${arquivo.name}`, autor);

  return {
    src: caminho.replace(/^public/, ""),
    largura: medida.largura,
    altura: medida.altura,
    aviso: avisoDeProporcao(medida.largura, medida.altura),
  };
}
