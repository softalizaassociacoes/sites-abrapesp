"use client";

/**
 * A rede de proteção das telas logadas.
 *
 * Sem ela, qualquer falha de servidor vira a tela genérica da Vercel, em
 * inglês, sem caminho de volta — foi o que aconteceu no painel de outro
 * site nosso quando um envio de imagem estourou o limite de corpo da
 * requisição. O texto que a
 * pessoa estava escrevendo continua no navegador: o "Tentar de novo"
 * re-renderiza sem recarregar, então voltar não joga nada fora.
 */
export default function ErroDoPainel({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div aria-hidden className="faixa-marca h-1 w-12 rounded-full" />
      <h1 className="mt-5 font-display text-2xl font-semibold text-ardosia-950">
        Algo falhou deste lado
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ardosia-700">
        A ação não foi concluída e nada foi gravado. O que você estava
        escrevendo continua no formulário.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ardosia-700">
        Se foi ao enviar uma imagem, pode ser o tamanho do arquivo: o limite é 4
        MB. Imagens escolhidas pelo formulário são reduzidas automaticamente
        antes do envio.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-azul-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-azul-600"
      >
        Tentar de novo
      </button>
    </div>
  );
}
