import type { Metadata } from "next";
import Arquivo from "@/components/Arquivo";
import CabecalhoDePagina from "@/components/CabecalhoDePagina";
import { listar } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Acompanhe as novidades, os comunicados e a cobertura da psicologia do esporte brasileira.",
};

export default function Noticias() {
  return (
    <>
      <CabecalhoDePagina
        titulo="Notícias"
        lead="Acompanhe as novidades, os comunicados e a cobertura da psicologia do esporte brasileira."
        migalhas={[{ t: "Publicações" }, { t: "Notícias" }]}
      />
      <section className="section">
        <div className="container">
          <Arquivo itens={listar("noticia")} rotulo="notícias" />
        </div>
      </section>
    </>
  );
}
