"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icone from "@/components/Icone";
import { externos, navegacao, type ItemDeMenu } from "@/data/site";

/**
 * O cabeçalho do site, com o mega-menu e o menu de celular.
 *
 * Precisa rodar no navegador por três coisas: saber a rota atual para
 * marcar o item ativo, trocar entre transparente e sólido conforme a
 * rolagem, e abrir o menu de celular. O resto do site continua todo no
 * servidor.
 *
 * O markup e as classes são os mesmos do site anterior, de propósito: a
 * folha de estilo é a mesma, e o visual tem de continuar idêntico.
 */

/** Marca o item do menu que corresponde à página aberta. */
function estaAtivo(item: ItemDeMenu, rota: string): boolean {
  const casa = (href: string) =>
    href === "/" ? rota === "/" : rota === href || rota.startsWith(`${href}/`);
  if (item.href) return casa(item.href);
  return (item.mega ?? []).some((s) => !s.externo && casa(s.href));
}

export default function Cabecalho() {
  const rota = usePathname();
  /* Só a home tem hero escuro atrás do cabeçalho; nas demais ele já
     começa sólido, senão o menu sairia branco sobre fundo branco. */
  const comHero = rota === "/";
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [abertos, setAbertos] = useState<string[]>([]);

  useEffect(() => {
    const aplicar = () => setRolou(window.scrollY > 30);
    aplicar();
    window.addEventListener("scroll", aplicar, { passive: true });
    return () => window.removeEventListener("scroll", aplicar);
  }, []);

  /* A classe fica no <body> porque é ela que trava a rolagem e gira o
     ícone do menu — regras que já existem na folha de estilo. */
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuAberto);
    return () => document.body.classList.remove("menu-open");
  }, [menuAberto]);

  /* Navegar fecha o menu: sem isto ele fica aberto por cima da página
     nova, porque no Next a troca de rota não recarrega a página.
     O ajuste acontece durante a renderização, comparando com a rota
     anterior, que é o padrão do React para reagir a um valor novo vindo
     de fora — um efeito aqui provocaria um render a mais. */
  const [rotaAnterior, setRotaAnterior] = useState(rota);
  if (rota !== rotaAnterior) {
    setRotaAnterior(rota);
    setMenuAberto(false);
  }

  const transparente = comHero && !rolou;

  return (
    <>
      <header
        className={`site-header ${transparente ? "is-transparent" : "is-solid"}`}
        id="siteHeader"
      >
        <div className="container site-header__inner">
          <Link className="brand" href="/" aria-label="ABRAPESP — Início">
            <img src="/assets/img/logo-abrapesp.png" alt="ABRAPESP" />
            <span className="brand__name">
              <b>ABRAPESP</b>
              <span>Psicologia do Esporte</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Menu principal">
            <ul>
              {navegacao.map((item) => {
                const ativo = estaAtivo(item, rota);
                if (!item.mega) {
                  return (
                    <li
                      key={item.label}
                      className={`nav__item${ativo ? " is-active" : ""}`}
                    >
                      <Link className="nav__link" href={item.href ?? "/"}>
                        {item.label}
                      </Link>
                    </li>
                  );
                }
                const primeiroInterno =
                  item.mega.find((s) => !s.externo) ?? item.mega[0];
                return (
                  <li
                    key={item.label}
                    className={`nav__item has-mega${ativo ? " is-active" : ""}`}
                  >
                    <Link className="nav__link" href={primeiroInterno.href}>
                      {item.label}
                      <Icone nome="chev" className="chev" />
                    </Link>
                    <div
                      className={`mega${item.mega.length > 3 ? " mega--wide" : ""}`}
                    >
                      {item.mega.map((s) => (
                        <Link
                          key={s.t}
                          className="mega__link"
                          href={s.href}
                          {...(s.externo
                            ? { target: "_blank", rel: "noopener" }
                            : {})}
                        >
                          <span className="mega__ico">
                            <Icone nome={s.icone} />
                          </span>
                          <span>
                            <span className="mega__t">
                              {s.t}
                              {s.externo ? (
                                <Icone nome="ext" className="chev" />
                              ) : null}
                            </span>
                            <span className="mega__d">{s.d}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="header-cta">
            <a
              className="btn btn--ghost btn--sm"
              href={externos.login}
              target="_blank"
              rel="noopener"
            >
              Entrar
            </a>
            <Link className="btn btn--brand btn--sm" href="/associe-se">
              Associe-se
            </Link>
            <button
              className="burger"
              id="burger"
              type="button"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((a) => !a)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-nav" id="mobileNav">
        {navegacao.map((item) => {
          if (!item.mega) {
            return (
              <div className="m-group" key={item.label}>
                <Link
                  className="m-top"
                  href={item.href ?? "/"}
                  style={{ textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              </div>
            );
          }
          const aberto = abertos.includes(item.label);
          return (
            <div
              className={`m-group${aberto ? " open" : ""}`}
              key={item.label}
            >
              <button
                className="m-top"
                type="button"
                aria-expanded={aberto}
                onClick={() =>
                  setAbertos((lista) =>
                    lista.includes(item.label)
                      ? lista.filter((l) => l !== item.label)
                      : [...lista, item.label],
                  )
                }
              >
                {item.label}
                <Icone nome="chev" className="chev" />
              </button>
              <div className="m-sub">
                <div>
                  {item.mega.map((s) => (
                    <Link
                      key={s.t}
                      href={s.href}
                      {...(s.externo
                        ? { target: "_blank", rel: "noopener" }
                        : {})}
                    >
                      {s.t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <a
          className="btn btn--ghost"
          href={externos.login}
          target="_blank"
          rel="noopener"
        >
          Área do associado
        </a>
        <Link className="btn btn--brand" href="/associe-se">
          Associe-se à ABRAPESP
        </Link>
      </div>
    </>
  );
}
