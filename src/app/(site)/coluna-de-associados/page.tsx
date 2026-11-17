import type { Metadata } from "next";
import Arquivo from "@/components/Arquivo";
import CabecalhoDePagina from "@/components/CabecalhoDePagina";
import { listar } from "@/lib/conteudo";

const LEAD =
  "Espaço de artigos e reflexões dos associados sobre psicologia do esporte, esportes e questões sociais ligadas ao universo esportivo.";

export const metadata: Metadata = {
  title: "Coluna de Associados",
  description: LEAD,
};

export default function ColunaDeAssociados() {
  return (
    <>
      <CabecalhoDePagina
        titulo="Coluna de Associados"
        lead={LEAD}
        migalhas={[{ t: "Publicações" }, { t: "Coluna de Associados" }]}
      />
      <section className="section">
        <div className="container">
          <Arquivo itens={listar("coluna")} rotulo="colunas" />
        </div>
      </section>
    </>
  );
}
