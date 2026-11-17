import Link from "next/link";
import Icone from "@/components/Icone";
import { formatarDataCurta, SECOES, type Item } from "@/lib/conteudo";

/**
 * O cartão de uma publicação nas listagens.
 *
 * Mesmo markup do site anterior (`newsCard` em abrapesp.js), para reusar
 * a folha de estilo sem um ajuste sequer. O `data-delay` escalona a
 * entrada dos cartões, em ciclos de quatro, como antes.
 */
export default function CartaoDeNoticia({
  item,
  posicao = 0,
}: {
  item: Item;
  posicao?: number;
}) {
  const secao = SECOES[item.tipo];
  const ehColuna = item.tipo === "coluna";

  return (
    <Link
      className="news-card reveal"
      data-delay={(posicao % 4) + 1}
      href={item.rota}
    >
      <div className="news-card__media">
        <span
          className={`news-card__tag${ehColuna ? " news-card__tag--coluna" : ""}`}
        >
          {secao.singular}
        </span>
        {item.capa ? (
          <img src={item.capa.src} alt={item.capa.alt} loading="lazy" />
        ) : null}
      </div>
      <div className="news-card__body">
        <div className="news-card__date">{formatarDataCurta(item.data)}</div>
        <h3 className="news-card__title">{item.titulo}</h3>
        <p className="news-card__excerpt">{item.resumo}</p>
        <span className="news-card__more">
          Ler {ehColuna ? "coluna" : "notícia"} <Icone nome="arrow" />
        </span>
      </div>
    </Link>
  );
}
