import CabecalhoDePagina from "@/components/CabecalhoDePagina";
import { formatarData, SECOES, type Item } from "@/lib/conteudo";

/**
 * A página de uma notícia ou coluna.
 *
 * Mesmo desenho do site anterior: faixa azul com data e seção, a imagem
 * de destaque e o texto em `.prose`. O corpo vem como HTML — do conteúdo
 * migrado ou do painel — e por isso é injetado direto.
 *
 * O HTML do painel é escrito por quem tem conta no painel, que é gente da
 * ABRAPESP: o risco aqui é o mesmo de qualquer CMS, e não o de aceitar
 * texto de desconhecido.
 */
export default function Publicacao({ item }: { item: Item }) {
  const secao = SECOES[item.tipo];

  return (
    <>
      <CabecalhoDePagina
        titulo={item.titulo}
        migalhas={[
          { t: secao.nome, href: secao.listagem },
          { t: secao.singular },
        ]}
        variante="artigo"
      >
        <span className="hero__badge" style={{ marginBottom: 18 }}>
          <span className="dot" /> {formatarData(item.data)} · {secao.singular}
        </span>
      </CabecalhoDePagina>

      <section className="section section--tight">
        <div className="container">
          <article className="prose narrow reveal">
            {item.capa ? (
              <figure className="article-feat">
                <img
                  src={item.capa.src}
                  alt={item.capa.alt}
                  loading="lazy"
                />
              </figure>
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: item.html }} />
          </article>
        </div>
      </section>
    </>
  );
}
