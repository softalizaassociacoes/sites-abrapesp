"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Os links do painel, com o item da tela atual marcado.
 *
 * Só isto é cliente: o resto do shell é servidor. O que está ativo depende
 * do endereço, e endereço no navegador é usePathname.
 */

export type ItemDeNavegacao = {
  href: string;
  rotulo: string;
  /** Marca ativo também nas telas-filhas (ex.: /admin/publicacoes/nova). */
  prefixo?: boolean;
};

export default function Navegacao({
  itens,
  aoLado,
}: {
  itens: ItemDeNavegacao[];
  aoLado?: boolean;
}) {
  const atual = usePathname();

  return (
    <nav
      aria-label="Seções do painel"
      className={
        aoLado ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto pb-px"
      }
    >
      {itens.map((item) => {
        const ativo = item.prefixo
          ? atual === item.href || atual.startsWith(`${item.href}/`)
          : atual === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={
              aoLado
                ? `rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    ativo
                      ? "bg-azul-700 text-white"
                      : "text-ardosia-700 hover:bg-ardosia-100 hover:text-ardosia-950"
                  }`
                : `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    ativo
                      ? "bg-azul-700 text-white"
                      : "text-ardosia-700 hover:bg-ardosia-200"
                  }`
            }
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
