"use client";

import { useActionState } from "react";
import { useState } from "react";
import {
  alternarNoAr,
  devolverAoAr,
  type Resultado,
} from "@/app/(admin)/admin/acoes-conteudo";

/** Botões de linha que precisam de confirmação e de estado próprio. */

/**
 * O interruptor de cada linha: no ar ⇄ fora do ar, na hora, sem abrir o
 * editor. Desligar pede confirmação; ligar não — ligar de volta é o
 * conserto do clique errado.
 */
export function InterruptorNoAr({
  rota,
  titulo,
  ligado,
}: {
  rota: string;
  titulo: string;
  ligado: boolean;
}) {
  const [estado, acao, rodando] = useActionState<Resultado, FormData>(
    alternarNoAr,
    {},
  );
  /* Otimista SÓ no visual: o interruptor muda no clique e volta se o
     servidor recusar. A intenção enviada, porém, vem de `ligado`, o valor
     que o servidor renderizou — nunca do visual: o React descarrega o
     estado do clique de forma síncrona, antes de o formulário capturar os
     campos, e uma intenção derivada do visual chegava invertida. Foi um
     defeito real: todo religar chegava como "tirar do ar".  */
  const [aparente, setAparente] = useState<boolean | null>(null);
  if (estado?.erro && aparente !== null) setAparente(null);
  const ligar = !ligado;
  const mostra = estado?.erro ? ligado : (aparente ?? ligado);

  return (
    <form
      action={acao}
      className="flex items-center gap-2"
      title={
        estado?.erro ??
        (mostra
          ? "No ar — clique para tirar"
          : "Fora do ar — clique para publicar")
      }
    >
      <input type="hidden" name="rota" value={rota} />
      <input type="hidden" name="titulo" value={titulo} />
      <input type="hidden" name="ligar" value={ligar ? "sim" : "nao"} />
      <button
        type="submit"
        role="switch"
        aria-checked={mostra}
        aria-label={`${titulo}: ${mostra ? "no ar" : "fora do ar"}`}
        disabled={rodando}
        onClick={(e) => {
          if (
            mostra &&
            !confirm(`Tirar "${titulo}" do ar? Religar é um clique.`)
          ) {
            e.preventDefault();
            return;
          }
          setAparente(!mostra);
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          mostra ? "bg-verde-500" : "bg-ardosia-300"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            mostra ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
      <span
        className={`w-16 text-xs font-semibold ${
          estado?.erro
            ? "text-azul-800"
            : mostra
              ? "text-verde-800"
              : "text-ardosia-500"
        }`}
      >
        {estado?.erro
          ? "não deu"
          : rodando
            ? "gravando…"
            : mostra
              ? "no ar"
              : "fora do ar"}
      </span>
    </form>
  );
}

export function BotaoDevolverAoAr({ rota }: { rota: string }) {
  const [estado, acao, rodando] = useActionState<Resultado, FormData>(
    devolverAoAr,
    {},
  );

  if (estado?.aviso && !estado.erro) {
    return (
      <span className="text-xs font-semibold text-verde-800">
        Volta no próximo deploy
      </span>
    );
  }

  return (
    <form action={acao} className="inline">
      <input type="hidden" name="rota" value={rota} />
      <button
        type="submit"
        disabled={rodando}
        className="rounded-full border border-ardosia-300 px-4 py-2 text-sm font-semibold text-ardosia-800 transition-colors hover:border-azul-400 hover:text-azul-700 disabled:opacity-50"
        title={estado?.erro}
      >
        {rodando
          ? "Devolvendo…"
          : estado?.erro
            ? "Falhou — de novo?"
            : "Devolver ao site"}
      </button>
    </form>
  );
}
