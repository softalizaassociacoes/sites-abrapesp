/**
 * Os dados fixos do site, num lugar só.
 *
 * Vieram de legado/assets/js/abrapesp.js, que montava o cabeçalho e o
 * rodapé no navegador. Aqui eles são dados de verdade, lidos no servidor:
 * o menu passa a existir no HTML entregue, em vez de aparecer depois que
 * o JavaScript roda.
 */

export const instituicao = {
  sigla: "ABRAPESP",
  nome: "Associação Brasileira de Psicologia do Esporte",
  descricao:
    "A Associação Brasileira de Psicologia do Esporte zela e incentiva o crescimento da ciência e da profissão de psicólogo do esporte, promovendo o bem-estar e o desenvolvimento humano por meio do esporte e da atividade física.",
  cnpj: "08.281.609/0001-98",
};

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://abrapesp.org.br";

/** Enquanto em homologação, o site inteiro fica fora dos buscadores. */
export const siteIndexavel = process.env.NEXT_PUBLIC_SITE_INDEXAVEL === "true";

export const externos = {
  /** Assocializa: planos e área do associado. */
  plataforma: "https://assocializa.com.br/abrapesp",
  login: "https://assocializa.com.br/abrapesp#login",
  congresso: "https://app.ciente.studio/abrapesp2025",
  revista: "https://portalrevistas.ucb.br/index.php/RBPE",
};

export const social = {
  instagram: "https://www.instagram.com/abrapesp_oficial/",
  youtube: "https://www.youtube.com/@abrapesp3878",
  facebook: "https://www.facebook.com/abrapesp",
  linkedin: "https://www.linkedin.com/company/abrapesp_oficial/",
  twitter: "https://twitter.com/abrapesp",
  email: "tesouraria@abrapesp.org.br",
};

export type ItemDeMenu = {
  label: string;
  href?: string;
  mega?: {
    t: string;
    d: string;
    href: string;
    icone: string;
    externo?: boolean;
  }[];
};

export const navegacao: ItemDeMenu[] = [
  { label: "Início", href: "/" },
  {
    label: "A ABRAPESP",
    mega: [
      {
        t: "Quem somos",
        d: "Missão, história e propósito",
        href: "/quem-somos",
        icone: "info",
      },
      {
        t: "Diretoria",
        d: "Gestão 2024/2026",
        href: "/diretoria",
        icone: "users",
      },
      {
        t: "Parceiros · CRE",
        d: "Comitê de Relacionamento Externo",
        href: "/parceiros-cre",
        icone: "handshake",
      },
      {
        t: "Estatuto",
        d: "Documento oficial (PDF)",
        href: "/estatuto",
        icone: "scroll",
      },
    ],
  },
  {
    label: "Eventos",
    mega: [
      {
        t: "Eventos & Congressos",
        d: "Nossa trajetória de encontros",
        href: "/eventos",
        icone: "calendar",
      },
      {
        t: "Congresso ABRAPESP",
        d: "X Congresso · plataforma oficial",
        href: externos.congresso,
        icone: "trophy",
        externo: true,
      },
    ],
  },
  {
    label: "Publicações",
    mega: [
      {
        t: "Notícias",
        d: "Novidades da psicologia do esporte",
        href: "/noticias",
        icone: "news",
      },
      {
        t: "Coluna de Associados",
        d: "Artigos e reflexões dos associados",
        href: "/coluna-de-associados",
        icone: "pen",
      },
      {
        t: "Revista RBPE",
        d: "Revista Brasileira de Psic. do Esporte",
        href: externos.revista,
        icone: "book",
        externo: true,
      },
    ],
  },
  { label: "Associe-se", href: "/associe-se" },
  { label: "Contato", href: "/fale-conosco" },
];

export const diretoria = [
  {
    nome: "Marina Gusson",
    cargo: "Presidente",
    foto: "/assets/img/diretoria/marina-gusson.jpeg",
  },
  {
    nome: "Matheus Vasconcelos",
    cargo: "Vice-Presidente",
    foto: "/assets/img/diretoria/matheus-vasconcelos.png",
  },
  {
    nome: "Marina Mattos",
    cargo: "Primeira Secretária",
    foto: "/assets/img/diretoria/marina-mattos.png",
  },
  {
    nome: "Gustavo Baroni",
    cargo: "Segundo Secretário",
    foto: "/assets/img/diretoria/gustavo-baroni.png",
  },
  {
    nome: "Aline Lobo",
    cargo: "Primeira Tesoureira",
    foto: "/assets/img/diretoria/aline-lobo.jpeg",
  },
  {
    nome: "Ariel Murlik",
    cargo: "Segundo Tesoureiro",
    foto: "/assets/img/diretoria/ariel-murlik.jpeg",
  },
];

export const parceiros = [
  {
    nome: "Flow Psicologia",
    logo: "/assets/img/parceiros/flow-psicologia.png",
    url: "https://www.flowpsicologia.com.br/",
  },
  {
    nome: "REMS",
    logo: "/assets/img/parceiros/rems.png",
    url: "https://rems.org.br/brasil-em-campo-glasgow-2016-homeless-world-cup/",
  },
  {
    nome: "Mundus Esportivus",
    logo: "/assets/img/parceiros/mundus-esportivus.png",
    url: "https://www.mundusesportivus.com.br/",
  },
  {
    nome: "IESF AFÉ",
    logo: "/assets/img/parceiros/iesf-afe.png",
    url: "https://www.iesfafe.pt/",
  },
  {
    nome: "Ludopédio",
    logo: "/assets/img/parceiros/ludopedio.png",
    url: "https://ludopedio.com.br/",
  },
];

export const eventos = [
  {
    tag: "Encontro",
    titulo:
      "Encontro Interinstitucional — Psicologia do Esporte e Coaching Esportivo",
    data: "16 de agosto de 2025",
    local: "ABRAPESP + ABEPEEx",
    img: "/assets/img/eventos/encontro-interinstitucional.jpeg",
    desc: "Pela primeira vez na história, ABRAPESP e ABEPEEx uniram-se em um evento interinstitucional, com Marina Gusson, Matheus Vasconcelos, André Aroni e Franco Noce.",
    link: "https://youtu.be/RoMQhnYf25A",
  },
  {
    tag: "X Congresso · 2025",
    titulo: "X Congresso Brasileiro de Psicologia do Esporte",
    data: "03 a 06 de setembro de 2025",
    local: "Uni7 · Fortaleza — CE",
    img: "/assets/img/eventos/x-congresso-2025.png",
    desc: "A décima edição do principal congresso brasileiro da área, reunindo pesquisadores e profissionais em Fortaleza.",
    link: externos.congresso,
  },
  {
    tag: "IX Congresso · 2023",
    titulo: "IX Congresso da ABRAPESP",
    data: "15 a 18 de novembro de 2023",
    local: "UNIFASE · Petrópolis — RJ",
    img: "/assets/img/eventos/ix-congresso-2023.png",
    desc: "“A Psicologia do Esporte no Brasil no século XXI — 20 anos de ABRAPESP”.",
  },
  {
    tag: "VIII Congresso · 2021",
    titulo: "VIII Congresso da ABRAPESP",
    data: "19 a 21 de novembro de 2021",
    local: "Formato remoto",
    img: "/assets/img/eventos/viii-congresso-2021.png",
    desc: "Evento bianual dedicado a debater temas emergentes em Psicologia do Esporte e Exercício Físico.",
  },
  {
    tag: "VII Congresso · 2019",
    titulo: "VII Congresso da ABRAPESP",
    data: "2019",
    local: "SESC · EEFERP-USP · Ribeirão Preto — SP",
    img: "/assets/img/eventos/vii-congresso-2019.jpg",
    desc: "Encontro realizado entre o SESC Ribeirão Preto, a EEFERP-USP e o Teatro do Campus-USP.",
  },
  {
    tag: "VI Congresso · 2017",
    titulo: "VI Congresso da ABRAPESP",
    data: "2017",
    local: "Universidade Católica de Brasília",
    img: "/assets/img/eventos/vi-congresso-2017.jpeg",
    desc: "Edição realizada na Universidade Católica de Brasília.",
  },
  {
    tag: "V Congresso · 2015",
    titulo: "V Congresso da ABRAPESP",
    data: "2015",
    local: "Universidade Católica de Brasília",
    img: "/assets/img/eventos/v-congresso-2015.png",
    desc: "Quinta edição do congresso nacional da associação.",
  },
];
