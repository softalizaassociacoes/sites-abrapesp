"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icone from "@/components/Icone";

/**
 * As duas animações que o site estático fazia no navegador: revelar os
 * blocos ao entrarem na tela e contar os números das estatísticas.
 *
 * Vive num componente só porque as duas observam a mesma coisa e precisam
 * rodar de novo a cada troca de página — no Next a navegação não recarrega
 * o documento, e sem isto a segunda página abriria com tudo invisível,
 * porque `.reveal` começa transparente na folha de estilo.
 */
function usarAnimacoesDeEntrada() {
  const rota = usePathname();

  useEffect(() => {
    const blocos = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    const numeros = document.querySelectorAll<HTMLElement>("[data-count]");

    if (!("IntersectionObserver" in window)) {
      blocos.forEach((b) => b.classList.add("in"));
      return;
    }

    const aoEntrar = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          aoEntrar.unobserve(e.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    blocos.forEach((b) => aoEntrar.observe(b));

    const contador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const no = e.target as HTMLElement;
          contador.unobserve(no);

          const alvo = Number.parseInt(no.dataset.count ?? "0", 10);
          const sufixo = no.dataset.suffix ?? "";
          const prefixo = no.dataset.prefix ?? "";
          const duracao = 1700;
          let inicio: number | null = null;

          const passo = (agora: number) => {
            inicio ??= agora;
            const p = Math.min((agora - inicio) / duracao, 1);
            const valor = Math.floor((1 - (1 - p) ** 3) * alvo);
            no.textContent = prefixo + valor.toLocaleString("pt-BR") + sufixo;
            if (p < 1) requestAnimationFrame(passo);
          };
          requestAnimationFrame(passo);
        }
      },
      { threshold: 0.5 },
    );
    numeros.forEach((n) => contador.observe(n));

    return () => {
      aoEntrar.disconnect();
      contador.disconnect();
    };
  }, [rota]);
}

/** O botão redondo que volta ao topo, a partir de 600px de rolagem. */
function VoltarAoTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aplicar = () => setVisivel(window.scrollY > 600);
    aplicar();
    window.addEventListener("scroll", aplicar, { passive: true });
    return () => window.removeEventListener("scroll", aplicar);
  }, []);

  return (
    <button
      className={`to-top${visivel ? " show" : ""}`}
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Icone nome="up" />
    </button>
  );
}

export default function Interacoes() {
  usarAnimacoesDeEntrada();
  return <VoltarAoTopo />;
}
