"use client";

import { useState } from "react";
import CartaoDeNoticia from "@/components/CartaoDeNoticia";
import type { Item } from "@/lib/conteudo";

/**
 * A listagem de uma seção, com o "Carregar mais" do site anterior.
 *
 * O lote existe pelo mesmo motivo de antes: são 137 publicações, e jogar
 * todas de uma vez custa caro no celular. A diferença é que agora elas
 * chegam prontas do servidor — quem entra com JavaScript desligado vê o
 * primeiro lote em vez de uma página vazia.
 */
const LOTE = 12;

export default function Arquivo({
  itens,
  rotulo,
}: {
  itens: Item[];
  rotulo: string;
}) {
  const [visiveis, setVisiveis] = useState(LOTE);
  const mostrados = itens.slice(0, visiveis);

  return (
    <>
      <div className="grid cols-4">
        {mostrados.map((item, i) => (
          <CartaoDeNoticia key={item.rota} item={item} posicao={i} />
        ))}
      </div>
      {visiveis < itens.length ? (
        <div className="load-more">
          <button
            className="btn btn--ghost btn--lg"
            type="button"
            onClick={() => setVisiveis((v) => v + LOTE)}
          >
            Carregar mais {rotulo}
          </button>
        </div>
      ) : null}
    </>
  );
}
