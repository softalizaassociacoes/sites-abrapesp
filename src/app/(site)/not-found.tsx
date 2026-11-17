import Link from "next/link";
import CabecalhoDePagina from "@/components/CabecalhoDePagina";

export default function NaoEncontrado() {
  return (
    <>
      <CabecalhoDePagina
        titulo="Página não encontrada"
        lead="O endereço que você abriu não existe mais ou foi digitado de outro jeito."
        migalhas={[{ t: "Erro 404" }]}
      />
      <section className="section">
        <div className="container center">
          <Link className="btn btn--brand btn--lg" href="/">
            Voltar ao início
          </Link>
          <p style={{ marginTop: 22 }}>
            Se você chegou por um link antigo, procure o conteúdo em{" "}
            <Link href="/noticias">Notícias</Link> ou fale com a gente em{" "}
            <Link href="/fale-conosco">Contato</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
