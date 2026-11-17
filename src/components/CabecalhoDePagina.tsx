import Link from "next/link";

/**
 * A faixa azul do topo das páginas internas, com o caminho de migalhas.
 *
 * Mesmo markup de `page-hero` do site anterior.
 */
export type Migalha = { t: string; href?: string };

export default function CabecalhoDePagina({
  titulo,
  lead,
  migalhas = [],
  variante,
  children,
}: {
  titulo: string;
  lead?: string;
  migalhas?: Migalha[];
  /** "artigo" aperta o espaçamento, como nas páginas de publicação. */
  variante?: "artigo";
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`page-hero${variante === "artigo" ? " page-hero--article" : ""}`}
    >
      <div className="page-hero__bg">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
      </div>
      <div className="container page-hero__inner">
        <nav className="breadcrumb">
          <Link href="/">Início</Link>
          {migalhas.map((m) => (
            <span key={m.t} style={{ display: "contents" }}>
              <span className="sep">/</span>
              {m.href ? <Link href={m.href}>{m.t}</Link> : <span>{m.t}</span>}
            </span>
          ))}
        </nav>
        {children}
        <h1 className="h1">{titulo}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
    </section>
  );
}
