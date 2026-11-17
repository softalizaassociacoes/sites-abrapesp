import Link from "next/link";
import Icone from "@/components/Icone";
import { diretoria, eventos, parceiros } from "@/data/site";
import { formatarDataCurta, listar } from "@/lib/conteudo";

/**
 * Os blocos que o JavaScript do site antigo montava no navegador.
 *
 * Cada um substitui um `data-…` do markup original (ver
 * scripts/extrair-paginas.mjs) e reproduz o mesmo HTML — a folha de
 * estilo é a mesma, então qualquer diferença de classe apareceria na
 * tela. A diferença é que agora eles chegam prontos do servidor.
 */

/** O destaque de notícias da home: uma grande e quatro ao lado. */
function NoticiasEmDestaque() {
  const lista = listar("noticia", 5);
  if (lista.length === 0) return null;
  const [principal, ...resto] = lista;

  return (
    <>
      <Link className="feat-main reveal" href={principal.rota}>
        <div className="feat-main__media">
          <span className="news-card__tag">Notícia</span>
          {principal.capa ? (
            <img
              src={principal.capa.src}
              alt={principal.capa.alt}
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="feat-main__body">
          <div className="news-card__date">
            {formatarDataCurta(principal.data)}
          </div>
          <h3>{principal.titulo}</h3>
          <p className="news-card__excerpt">{principal.resumo}</p>
          <span className="news-card__more">
            Ler notícia <Icone nome="arrow" />
          </span>
        </div>
      </Link>
      <div className="feat-list">
        {resto.map((n) => (
          <Link className="feat-item reveal" href={n.rota} key={n.rota}>
            <div className="feat-item__media">
              {n.capa ? (
                <img src={n.capa.src} alt={n.capa.alt} loading="lazy" />
              ) : null}
            </div>
            <div className="feat-item__body">
              <div className="feat-item__date">
                {formatarDataCurta(n.data)}
              </div>
              <div className="feat-item__title">{n.titulo}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function Colunas({ limite = 3 }: { limite?: number }) {
  return (
    <>
      {listar("coluna", limite).map((c, i) => (
        <Link
          className="col-card reveal"
          data-delay={(i % 3) + 1}
          href={c.rota}
          key={c.rota}
        >
          <Icone nome="quote" className="col-card__quote" />
          <h3>{c.titulo}</h3>
          <div className="col-card__meta">
            <span className="col-card__av">
              <Icone nome="pen" />
            </span>
            <span className="col-card__by">
              <b>Coluna de Associados</b>
              <span>{formatarDataCurta(c.data)}</span>
            </span>
          </div>
        </Link>
      ))}
    </>
  );
}

function Parceiros() {
  return (
    <>
      {parceiros.map((p, i) => (
        <a
          className="partner reveal"
          data-delay={(i % 4) + 1}
          href={p.url}
          target="_blank"
          rel="noopener"
          key={p.nome}
        >
          <div className="partner__logo">
            <img src={p.logo} alt={p.nome} loading="lazy" />
          </div>
          <div className="partner__name">{p.nome}</div>
          <span className="partner__ext">
            Visitar <Icone nome="ext" />
          </span>
        </a>
      ))}
    </>
  );
}

function Diretoria() {
  return (
    <>
      {diretoria.map((p, i) => (
        <div className="person reveal" data-delay={(i % 3) + 1} key={p.nome}>
          <div className="person__photo">
            <img src={p.foto} alt={p.nome} loading="lazy" />
          </div>
          <div className="person__body">
            <div className="person__role">{p.cargo}</div>
            <div className="person__name">{p.nome}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function Eventos({ limite }: { limite?: number }) {
  return (
    <>
      {eventos.slice(0, limite ?? eventos.length).map((e, i) => (
        <article className="event reveal" data-delay={(i % 2) + 1} key={e.titulo}>
          <div className="event__media">
            <img src={e.img} alt={e.titulo} loading="lazy" />
          </div>
          <div className="event__body">
            <span className="event__tag">
              <Icone nome="trophy" />
              {e.tag}
            </span>
            <h3 className="event__title">{e.titulo}</h3>
            <div className="event__meta">
              <span>
                <Icone nome="calendar" />
                {e.data}
              </span>
              <span>
                <Icone nome="pin" />
                {e.local}
              </span>
            </div>
            <p>{e.desc}</p>
            {e.link ? (
              <a
                className="card__link"
                href={e.link}
                target="_blank"
                rel="noopener"
                style={{ marginTop: 16 }}
              >
                Saiba mais <Icone nome="ext" />
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </>
  );
}

/**
 * Escolhe o bloco pelo nome gravado em paginas.json e o devolve dentro do
 * mesmo contêiner que o markup antigo tinha — é dele que vem a grade.
 */
export default function Bloco({
  nome,
  limite,
  classe,
}: {
  nome: string;
  limite?: number;
  classe?: string;
}) {
  const conteudo =
    nome === "noticias-destaque" ? (
      <NoticiasEmDestaque />
    ) : nome === "colunas" ? (
      <Colunas limite={limite} />
    ) : nome === "parceiros" ? (
      <Parceiros />
    ) : nome === "diretoria" ? (
      <Diretoria />
    ) : nome === "eventos" ? (
      <Eventos limite={limite} />
    ) : null;

  if (!conteudo) return null;
  return <div className={classe}>{conteudo}</div>;
}
