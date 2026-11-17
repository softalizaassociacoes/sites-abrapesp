"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  enviarCapa,
  removerPublicacao,
  salvarPublicacao,
  type Resultado,
} from "@/app/(admin)/admin/acoes-conteudo";
import { SECOES, type Capa, type TipoPublicacao } from "@/lib/conteudo";

/**
 * O formulário de uma publicação: notícia ou coluna.
 *
 * Campo a campo, é o que o cartão da listagem e a página da publicação
 * precisam — nada além. O texto é escrito em linguagem comum: quem
 * escreve não digita HTML, e uma linha em branco vira parágrafo na hora
 * de gravar (ver comoParagrafos, em src/lib/publicacoes-painel.ts).
 */

export type Versao = {
  titulo: string;
  resumo: string;
  html: string;
  data: string;
  capa: Capa | null;
  /** Endereço fixo no site; vazio em publicação nova, calculado do título. */
  rota?: string;
  publicado: boolean;
};

const VAZIA: Versao = {
  titulo: "",
  resumo: "",
  html: "",
  data: new Date().toISOString().slice(0, 10),
  capa: null,
  publicado: false,
};

const campo =
  "mt-1.5 block w-full rounded-xl border border-ardosia-300 bg-white px-4 py-2.5 text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200";
const rotulo = "block text-sm font-medium text-ardosia-800";
const erroCaixa =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800";

export default function Editor({
  tipoInicial,
  inicial,
  /** Correção de item que veio da migração: o endereço não muda. */
  correcao = false,
}: {
  tipoInicial: TipoPublicacao;
  inicial?: Versao;
  correcao?: boolean;
}) {
  const [tipo, setTipo] = useState<TipoPublicacao>(tipoInicial);
  const [versao, setVersao] = useState<Versao>(inicial ?? VAZIA);

  const [estadoSalvar, acaoSalvar, salvando] = useActionState<
    Resultado,
    FormData
  >(salvarPublicacao, {});
  const [estadoRemover, acaoRemover, removendo] = useActionState<
    Resultado,
    FormData
  >(removerPublicacao, {});

  const mudar = (chave: keyof Versao, valor: string | boolean) =>
    setVersao((v) => ({ ...v, [chave]: valor }));

  const completa = Boolean(versao.titulo.trim() && versao.html.trim());

  return (
    <div>
      <form action={acaoSalvar} className="mt-6 space-y-5">
        <input type="hidden" name="rota" value={versao.rota ?? ""} />
        <input type="hidden" name="capaSrc" value={versao.capa?.src ?? ""} />
        <input type="hidden" name="capaAlt" value={versao.capa?.alt ?? ""} />
        <input
          type="hidden"
          name="capaLargura"
          value={versao.capa?.largura ?? ""}
        />
        <input
          type="hidden"
          name="capaAltura"
          value={versao.capa?.altura ?? ""}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tipo-sel" className={rotulo}>
              Seção
            </label>
            <select
              id="tipo-sel"
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoPublicacao)}
              disabled={correcao}
              className={`${campo} disabled:bg-ardosia-100`}
            >
              <option value="noticia">Notícias</option>
              <option value="coluna">Coluna de Associados</option>
            </select>
          </div>
          <div>
            <label htmlFor="data" className={rotulo}>
              Data
            </label>
            <input
              id="data"
              name="data"
              type="date"
              value={versao.data.slice(0, 10)}
              onChange={(e) => mudar("data", e.target.value)}
              className={campo}
            />
          </div>
        </div>

        <div>
          <label htmlFor="titulo" className={rotulo}>
            Título
          </label>
          <input
            id="titulo"
            name="titulo"
            value={versao.titulo}
            onChange={(e) => mudar("titulo", e.target.value)}
            required
            className={campo}
          />
          {versao.rota ? (
            <p className="mt-1.5 text-xs text-ardosia-500">
              Endereço no site: <code>{versao.rota}</code>. Ele não muda
              quando o título muda, para não quebrar links já compartilhados.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="resumo" className={rotulo}>
            Resumo{" "}
            <span className="font-normal text-ardosia-500">
              — aparece no cartão da listagem; em branco, sai do começo do
              texto
            </span>
          </label>
          <textarea
            id="resumo"
            name="resumo"
            rows={3}
            value={versao.resumo}
            onChange={(e) => mudar("resumo", e.target.value)}
            className={campo}
          />
        </div>

        <Destaque
          capa={versao.capa}
          aoMudarArte={(capa) => setVersao((v) => ({ ...v, capa }))}
          aoMudarAlt={(alt) =>
            setVersao((v) => ({
              ...v,
              capa: v.capa ? { ...v.capa, alt } : v.capa,
            }))
          }
        />

        <div>
          <label htmlFor="html" className={rotulo}>
            Texto{" "}
            <span className="font-normal text-ardosia-500">
              — escreva normalmente; uma linha em branco separa parágrafos
            </span>
          </label>
          <textarea
            id="html"
            name="html"
            rows={16}
            value={versao.html}
            onChange={(e) => mudar("html", e.target.value)}
            required
            className={`${campo} font-mono text-sm`}
          />
        </div>

        {estadoSalvar?.erro && (
          <p role="alert" className={erroCaixa}>
            {estadoSalvar.erro}
          </p>
        )}

        <p className="text-sm text-ardosia-600">
          {!completa
            ? "Escreva o título e o texto para poder gravar."
            : correcao
              ? `Publica em ${SECOES[tipo].nome}, no mesmo endereço do texto original.`
              : `Vai para ${SECOES[tipo].nome}.`}
        </p>

        <div className="flex flex-wrap items-center gap-3 border-t border-ardosia-300 pt-5">
          <button
            type="submit"
            name="destino"
            value="publicar"
            disabled={salvando || !completa}
            className="rounded-full bg-azul-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-azul-600 disabled:opacity-40"
          >
            {salvando
              ? "Gravando…"
              : versao.publicado
                ? "Gravar e manter no ar"
                : "Publicar"}
          </button>
          <button
            type="submit"
            name="destino"
            value="rascunho"
            disabled={salvando || !completa}
            className="rounded-full border border-ardosia-300 px-5 py-2.5 text-sm font-semibold text-ardosia-800 transition-colors hover:border-azul-400 hover:text-azul-700 disabled:opacity-60"
          >
            {versao.publicado
              ? "Tirar do ar (vira rascunho)"
              : "Salvar rascunho"}
          </button>
          <Link
            href="/admin/publicacoes"
            className="rounded-full border border-ardosia-300 px-5 py-2.5 text-sm font-semibold text-ardosia-800 hover:border-azul-400 hover:text-azul-700"
          >
            Voltar
          </Link>
          {versao.rota && versao.publicado && (
            <a
              href={versao.rota}
              target="_blank"
              rel="noopener"
              className="ml-auto text-sm font-semibold text-ardosia-500 hover:text-azul-700"
            >
              Ver no site →
            </a>
          )}
        </div>
      </form>

      {/* Fora do formulário principal: formulário dentro de formulário não
          existe em HTML. */}
      {versao.rota && !correcao && (
        <form action={acaoRemover} className="mt-6">
          <input type="hidden" name="rota" value={versao.rota} />
          <button
            type="submit"
            disabled={removendo}
            onClick={(e) => {
              if (
                !confirm(
                  "Remover esta publicação? Ela sai do site e o texto só fica no histórico do repositório.",
                )
              ) {
                e.preventDefault();
              }
            }}
            className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50"
          >
            {removendo ? "Removendo…" : "Remover esta publicação"}
          </button>
          {estadoRemover?.erro && (
            <p role="alert" className={`mt-3 ${erroCaixa}`}>
              {estadoRemover.erro}
            </p>
          )}
          <p className="mt-2 text-sm text-ardosia-600">
            Sai do site no próximo deploy. O texto continua no histórico do
            repositório, então dá para recuperar.
          </p>
        </form>
      )}
    </div>
  );
}

/**
 * Encolhe a foto no navegador antes do envio.
 *
 * O teto real não é nosso: a Vercel recusa com 413 qualquer requisição
 * acima de 4.500.000 bytes, e isso acontece antes de o código da aplicação
 * rodar — aumentar o `bodySizeLimit` do Next não vence esse corte. Então o
 * que sobe tem de ser pequeno, e é por isso que a redução acontece aqui, no
 * navegador: a pessoa escolhe a foto de 10 MB que o celular tirou e o que
 * viaja são algumas centenas de KB.
 *
 * Também vale para quem visita o site, que serve as imagens cruas, sem
 * otimizador em tempo de execução — o peso que sobe é o peso que se baixa.
 *
 * As tentativas vão afrouxando qualidade e depois tamanho até caber em
 * ALVO. A primeira quase sempre basta; as demais existem para a foto
 * enorme de câmera profissional não virar um recado de erro.
 */
const ALVO = 3 * 1024 * 1024;

async function encolher(arquivo: File): Promise<File> {
  const TENTATIVAS: { lado: number; qualidade: number }[] = [
    { lado: 2000, qualidade: 0.85 },
    { lado: 2000, qualidade: 0.7 },
    { lado: 1600, qualidade: 0.7 },
    { lado: 1200, qualidade: 0.6 },
  ];

  try {
    const bitmap = await createImageBitmap(arquivo, {
      imageOrientation: "from-image",
    });

    /* Já pequena e dentro do alvo: mantém o arquivo original, que preserva
       o formato escolhido por quem enviou. */
    if (
      Math.max(bitmap.width, bitmap.height) <= TENTATIVAS[0].lado &&
      arquivo.size <= 1024 * 1024
    ) {
      bitmap.close();
      return arquivo;
    }

    let melhor: File | null = null;
    for (const { lado, qualidade } of TENTATIVAS) {
      const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
      const tela = document.createElement("canvas");
      tela.width = Math.round(bitmap.width * escala);
      tela.height = Math.round(bitmap.height * escala);
      const contexto = tela.getContext("2d");
      if (!contexto) break;
      contexto.drawImage(bitmap, 0, 0, tela.width, tela.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        tela.toBlob(resolve, "image/webp", qualidade),
      );
      if (!blob || blob.size === 0) break;

      const nome = `${arquivo.name.replace(/\.[^.]+$/, "")}.webp`;
      const candidato = new File([blob], nome, { type: "image/webp" });
      if (!melhor || candidato.size < melhor.size) melhor = candidato;
      if (candidato.size <= ALVO) break;
    }
    bitmap.close();

    if (!melhor) return arquivo;
    /* Reencodar pode engordar uma imagem já bem comprimida; nesse caso o
       original é melhor, desde que caiba. */
    return melhor.size < arquivo.size || arquivo.size > ALVO ? melhor : arquivo;
  } catch {
    return arquivo;
  }
}

/**
 * Imagem de destaque.
 *
 * O arquivo sobe assim que é escolhido, sem passar por botão: o aviso de
 * proporção só serve se chegar enquanto a pessoa ainda pode trocar a arte.
 * O envio não usa um formulário próprio porque este bloco mora dentro do
 * formulário da publicação — a ação é chamada direto, com um FormData
 * montado aqui.
 */
function Destaque({
  capa,
  aoMudarArte,
  aoMudarAlt,
}: {
  capa: Capa | null;
  aoMudarArte: (capa: Capa | null) => void;
  aoMudarAlt: (alt: string) => void;
}) {
  const [situacao, setSituacao] = useState<
    "parado" | "preparando" | "enviando"
  >("parado");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-ardosia-200 bg-white p-5">
      <p className={rotulo}>
        Imagem de destaque{" "}
        <span className="font-normal text-ardosia-500">
          — o ideal é 1600x1000 (a proporção do cartão); fotos grandes são
          reduzidas sozinhas antes do envio.
        </span>
      </p>

      {capa ? (
        <div className="mt-4 flex flex-wrap items-start gap-4">
          {/* Imagem local já enviada; <img> basta aqui e evita o otimizador
              tentar processar um caminho que só existe depois do deploy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capa.src}
            alt=""
            width={capa.largura ?? 160}
            height={capa.altura ?? 100}
            className="h-24 w-36 rounded-xl border border-ardosia-200 object-cover"
          />
          <div className="min-w-56 flex-1">
            <label htmlFor="capa-alt" className={rotulo}>
              Descrição da imagem
            </label>
            <input
              id="capa-alt"
              value={capa.alt}
              onChange={(e) => aoMudarAlt(e.target.value)}
              placeholder="O que a imagem mostra, em uma frase"
              className={campo}
            />
            <p className="mt-1.5 text-xs text-ardosia-500">
              É o que ouve quem usa leitor de tela, e o que aparece se a
              imagem não carregar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => aoMudarArte(null)}
            className="rounded-full border border-ardosia-300 px-4 py-2 text-sm font-semibold text-ardosia-800 transition-colors hover:border-azul-400 hover:text-azul-700"
          >
            Tirar a imagem
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ardosia-600">
          Sem imagem, o cartão aparece só com o título e o resumo.
        </p>
      )}

      <label className="mt-4 block">
        <span className="sr-only">Escolher arquivo de imagem</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={situacao !== "parado"}
          onChange={async (e) => {
            const escolhido = e.target.files?.[0];
            /* Limpa o campo para que escolher o mesmo arquivo de novo,
               depois de um erro, ainda dispare o envio. */
            e.target.value = "";
            if (!escolhido) return;
            setErro(null);
            setAviso(null);

            setSituacao("preparando");
            const arquivo = await encolher(escolhido);
            if (arquivo.size > ALVO) {
              setSituacao("parado");
              setErro(
                `Não consegui reduzir esta imagem o bastante (ficou com ${(arquivo.size / 1024 / 1024).toFixed(1)} MB). Se o arquivo for HEIC do iPhone, exporte como JPEG e tente de novo.`,
              );
              return;
            }

            /* A ação é chamada direto, em vez de por useActionState, para
               a falha poder ser capturada aqui. Com o despacho do
               useActionState, uma recusa do servidor (corpo grande demais,
               rede caindo) sobe para a fronteira de erro e troca a tela
               inteira por uma página de falha. Aqui o pior caso é uma frase
               vermelha embaixo do campo, com o texto da publicação intacto. */
            setSituacao("enviando");
            try {
              const dados = new FormData();
              dados.set("arquivo", arquivo);
              const resposta = await enviarCapa(undefined, dados);
              if (resposta.erro) setErro(resposta.erro);
              else if (resposta.imagem) {
                aoMudarArte({
                  src: resposta.imagem.src,
                  alt: capa?.alt ?? "",
                  largura: resposta.imagem.largura,
                  altura: resposta.imagem.altura,
                });
                setAviso(resposta.aviso ?? null);
              }
            } catch {
              setErro(
                "O envio não chegou ao servidor. Verifique a conexão e tente de novo; o texto da publicação continua aqui.",
              );
            } finally {
              setSituacao("parado");
            }
          }}
          className="block w-full cursor-pointer text-sm text-ardosia-700 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-ardosia-200 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-ardosia-900 hover:file:bg-ardosia-300 disabled:opacity-50"
        />
      </label>

      {situacao !== "parado" && (
        <p className="mt-3 text-sm text-ardosia-600">
          {situacao === "preparando"
            ? "Preparando a imagem…"
            : "Enviando a imagem…"}
        </p>
      )}
      {erro && (
        <p role="alert" className={`mt-3 ${erroCaixa}`}>
          {erro}
        </p>
      )}
      {aviso && !erro && situacao === "parado" && (
        <p className="mt-3 rounded-xl bg-ouro-50 px-4 py-3 text-sm text-ouro-900">
          {aviso}
        </p>
      )}
    </div>
  );
}
