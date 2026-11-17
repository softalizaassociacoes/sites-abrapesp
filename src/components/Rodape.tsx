import Link from "next/link";
import Icone from "@/components/Icone";
import { externos, instituicao, social } from "@/data/site";

/**
 * O rodapé do site.
 *
 * Mesmo markup do site anterior. O ano sai do servidor: no estático ele
 * era escrito por JavaScript depois que a página carregava, e a página
 * chegava ao visitante com o ano errado durante esse instante.
 *
 * As páginas são regeneradas uma vez por dia (ver `revalidate`), então a
 * virada de ano entra sozinha.
 */

const REDES = [
  { nome: "Instagram", url: social.instagram, icone: "ig" },
  { nome: "YouTube", url: social.youtube, icone: "yt" },
  { nome: "Facebook", url: social.facebook, icone: "fb" },
  { nome: "LinkedIn", url: social.linkedin, icone: "linkedin" },
  { nome: "X", url: social.twitter, icone: "x" },
];

function Coluna({
  titulo,
  links,
}: {
  titulo: string;
  links: { t: string; href: string; externo?: boolean }[];
}) {
  return (
    <div className="footer-col">
      <h4>{titulo}</h4>
      <ul>
        {links.map((l) => (
          <li key={l.t}>
            {l.externo ? (
              <a href={l.href} target="_blank" rel="noopener">
                {l.t}
              </a>
            ) : (
              <Link href={l.href}>{l.t}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Rodape() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label="ABRAPESP">
              <img
                src="/assets/img/logo-abrapesp.png"
                alt="ABRAPESP"
                style={{ width: 52, height: 52 }}
              />
              <span className="brand__name">
                <b>ABRAPESP</b>
                <span>Psicologia do Esporte</span>
              </span>
            </Link>
            <p>{instituicao.descricao}</p>
            <div className="footer-social">
              {REDES.map((r) => (
                <a
                  key={r.nome}
                  href={r.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={r.nome}
                  data-evento="click_social_link"
                >
                  <Icone nome={r.icone} />
                </a>
              ))}
            </div>
          </div>

          <Coluna
            titulo="A ABRAPESP"
            links={[
              { t: "Quem somos", href: "/quem-somos" },
              { t: "Diretoria", href: "/diretoria" },
              { t: "Parceiros · CRE", href: "/parceiros-cre" },
              { t: "Estatuto", href: "/estatuto" },
              { t: "Associe-se", href: "/associe-se" },
            ]}
          />

          <Coluna
            titulo="Conteúdo"
            links={[
              { t: "Notícias", href: "/noticias" },
              { t: "Coluna de Associados", href: "/coluna-de-associados" },
              { t: "Eventos & Congressos", href: "/eventos" },
              {
                t: "Congresso ABRAPESP",
                href: externos.congresso,
                externo: true,
              },
              { t: "Revista RBPE", href: externos.revista, externo: true },
            ]}
          />

          <div className="footer-col">
            <h4>Contato</h4>
            <ul className="footer-contact">
              <li>
                <strong>E-mail</strong>
                <a href={`mailto:${social.email}`}>{social.email}</a>
              </li>
              <li>
                <strong>Área do associado</strong>
                <a href={externos.login} target="_blank" rel="noopener">
                  Acessar plataforma
                </a>
              </li>
              <li>
                <strong>CNPJ</strong>
                {instituicao.cnpj}
              </li>
            </ul>
            <Link
              className="btn btn--gold btn--sm"
              href="/fale-conosco"
              style={{ marginTop: 6 }}
            >
              Fale conosco
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} ABRAPESP — {instituicao.nome}.
          </span>
          <span>Ciência · Esporte · Bem-estar</span>
        </div>
      </div>
    </footer>
  );
}
