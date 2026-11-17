/**
 * As regras do painel que não dependem de servidor.
 *
 * Sessão, contas, publicações, mesclagem, imagens e recuperação de senha.
 * Tudo o que decide sozinho, a partir dos dados — é onde um erro passa
 * despercebido na tela e só aparece quando já está no ar.
 */
import { criarToken, lerToken } from "@/lib/sessao-painel";
import {
  emailInvalido,
  nomeInvalido,
  problemaAoCriar,
  problemaAoMudarPapel,
  problemaAoRemover,
  senhaFraca,
  type Conta,
} from "@/lib/contas-painel";
import {
  comoParagrafos,
  comoSlug,
  montar,
  porData,
  proximoId,
  resumoAutomatico,
  type ItemDoPainel,
  type Rascunho,
} from "@/lib/publicacoes-painel";
import { mesclarPublicacoes } from "@/lib/mesclar-publicacoes";
import { avisoDeProporcao, medir, nomeSeguro } from "@/lib/imagens-painel";
import {
  criarTokenDeRecuperacao,
  lerTokenDeRecuperacao,
} from "@/lib/recuperacao-painel";

let falhas = 0;
const confere = (rotulo: string, obtido: unknown, esperado: unknown) => {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) falhas++;
  console.log(
    `${ok ? "  ok  " : " FALHA"} ${rotulo}`,
    ok
      ? ""
      : `\n        obtido=${JSON.stringify(obtido)}\n        esperado=${JSON.stringify(esperado)}`,
  );
};

/* ------------------------------------------------------------------ */
console.log("\n--- sessão ---");

const SEGREDO = "x".repeat(40);

confere(
  "o token de ida e volta devolve quem entrou",
  lerToken(criarToken("ana", SEGREDO), SEGREDO),
  "ana",
);
confere(
  "nome com ponto não quebra o formato",
  lerToken(criarToken("ana.silva", SEGREDO), SEGREDO),
  "ana.silva",
);
confere(
  "token assinado com outro segredo é recusado",
  lerToken(criarToken("ana", SEGREDO), "y".repeat(40)),
  null,
);
confere(
  "token vencido é recusado",
  lerToken(criarToken("ana", SEGREDO, 1000, 0), SEGREDO, 10_000),
  null,
);
confere("sem token, ninguém entra", lerToken(undefined, SEGREDO), null);
confere(
  "token adulterado é recusado",
  lerToken(`${criarToken("ana", SEGREDO)}x`, SEGREDO),
  null,
);

/* ------------------------------------------------------------------ */
console.log("\n--- contas ---");

const CONTAS: Conta[] = [
  { nome: "marina", papel: "administrador", email: "marina@abrapesp.org.br" },
  { nome: "ana", papel: "editor", email: "ana@abrapesp.org.br" },
];

confere("senha curta é recusada", Boolean(senhaFraca("curta")), true);
confere("senha só de números é recusada", Boolean(senhaFraca("1234567890123")), true);
confere("senha boa passa", senhaFraca("psicologia-do-esporte"), null);
confere("nome com espaço é recusado", Boolean(nomeInvalido("ana maria")), true);
confere("nome simples passa", nomeInvalido("ana.maria"), null);
confere("e-mail sem arroba é recusado", Boolean(emailInvalido("ana")), true);
confere("e-mail válido passa", emailInvalido("ana@abrapesp.org.br"), null);

confere(
  "nome repetido, mesmo com outra caixa, é recusado",
  Boolean(problemaAoCriar(CONTAS, "ANA", "outra@abrapesp.org.br", "senha-boa-aqui")),
  true,
);
confere(
  "e-mail repetido é recusado",
  Boolean(problemaAoCriar(CONTAS, "nova", "ana@abrapesp.org.br", "senha-boa-aqui")),
  true,
);
confere(
  "conta nova e válida passa",
  problemaAoCriar(CONTAS, "gustavo", "gustavo@abrapesp.org.br", "senha-boa-aqui"),
  null,
);

confere(
  "ninguém remove a própria conta",
  Boolean(problemaAoRemover(CONTAS, "marina", "marina")),
  true,
);
confere(
  "o último administrador não é removido",
  Boolean(problemaAoRemover(CONTAS, "marina", "ana")),
  true,
);
confere(
  "o último administrador não se rebaixa",
  Boolean(problemaAoMudarPapel(CONTAS, "marina", "editor", "ana")),
  true,
);
confere(
  "promover um editor passa",
  problemaAoMudarPapel(CONTAS, "ana", "administrador", "marina"),
  null,
);

/* ------------------------------------------------------------------ */
console.log("\n--- publicações ---");

confere(
  "slug sem acento nem pontuação",
  comoSlug("Saúde mental & esporte: o que há de novo?"),
  "saude-mental-esporte-o-que-ha-de-novo",
);
confere("slug de título vazio", comoSlug("…"), "");

confere(
  "texto corrido vira parágrafos",
  comoParagrafos("Primeira linha.\n\nSegunda linha."),
  "<p>Primeira linha.</p>\n<p>Segunda linha.</p>",
);
confere(
  "quebra simples também vira parágrafo",
  comoParagrafos("Uma.\nOutra."),
  "<p>Uma.</p>\n<p>Outra.</p>",
);
confere(
  "quem já escreveu HTML não é atrapalhado",
  comoParagrafos("<p>Já marcado.</p>"),
  "<p>Já marcado.</p>",
);

confere(
  "resumo automático corta na palavra e põe reticência",
  resumoAutomatico("<p>" + "palavra ".repeat(40) + "</p>", 40),
  "palavra palavra palavra palavra palavra…",
);
confere(
  "texto curto vira resumo inteiro, sem tags",
  resumoAutomatico("<p>Um texto curto.</p>"),
  "Um texto curto.",
);

/* Os ids do painel nunca encostam nos da migração, que vão até 137. */
confere("primeiro id do painel", proximoId([]), 1_000_001);
confere(
  "id seguinte considera o maior existente",
  proximoId([{ id: 1_000_009 } as ItemDoPainel]),
  1_000_010,
);

const RASCUNHO: Rascunho = {
  tipo: "noticia",
  titulo: "ABRAPESP no Congresso",
  resumo: "",
  html: "Primeiro parágrafo.",
  data: "2026-03-10",
  capa: null,
  publicado: true,
};

const montada = montar(RASCUNHO, 1_000_001, "ana", "2026-03-10T10:00:00Z");
confere("a rota sai da seção e do título", montada.rota, "/noticias/abrapesp-no-congresso");
confere("o resumo em branco sai do texto", montada.resumo, "Primeiro parágrafo.");
confere("o texto vira parágrafo", montada.html, "<p>Primeiro parágrafo.</p>");
confere("quem criou fica registrado", montada.criadoPor, "ana");

const colunaMontada = montar(
  { ...RASCUNHO, tipo: "coluna" },
  1_000_002,
  "ana",
  "2026-03-10T10:00:00Z",
);
confere(
  "coluna vai para a seção dela",
  colunaMontada.rota,
  "/coluna-de-associados/abrapesp-no-congresso",
);

const comRotaFixa = montar(
  { ...RASCUNHO, rota: "/noticias/endereco-antigo", titulo: "Título novo" },
  1_000_003,
  "ana",
  "2026-03-10T10:00:00Z",
);
confere(
  "título novo não muda o endereço já publicado",
  comRotaFixa.rota,
  "/noticias/endereco-antigo",
);
confere("o slug acompanha a rota mantida", comRotaFixa.slug, "endereco-antigo");

confere(
  "ordena da mais recente para a mais antiga",
  porData([{ data: "2024-01-01" }, { data: "2026-01-01" }]).map((i) => i.data),
  ["2026-01-01", "2024-01-01"],
);

/* ------------------------------------------------------------------ */
console.log("\n--- mesclagem (o que o site mostra) ---");

type Linha = { rota: string; data: string | null; titulo: string; publicado?: boolean };
const migradas: Linha[] = [
  { rota: "/noticias/a", data: "2024-01-01", titulo: "A, do site antigo" },
  { rota: "/noticias/b", data: "2024-02-01", titulo: "B, do site antigo" },
];

confere(
  "sem nada do painel, valem as migradas",
  mesclarPublicacoes(migradas, [], []).map((i) => i.titulo),
  ["B, do site antigo", "A, do site antigo"],
);
confere(
  "rascunho não vai ao ar",
  mesclarPublicacoes(
    migradas,
    [{ rota: "/noticias/c", data: "2026-01-01", titulo: "C", publicado: false }],
    [],
  ).length,
  2,
);
confere(
  "a correção do painel ganha da migrada de mesma rota",
  mesclarPublicacoes(
    migradas,
    [{ rota: "/noticias/a", data: "2024-01-01", titulo: "A, corrigida", publicado: true }],
    [],
  ).map((i) => i.titulo),
  ["B, do site antigo", "A, corrigida"],
);
confere(
  "a lápide tira a migrada do site",
  mesclarPublicacoes(migradas, [], [{ rota: "/noticias/b" }]).map((i) => i.rota),
  ["/noticias/a"],
);
confere(
  "a lápide tira também o que o painel escreveu na rota",
  mesclarPublicacoes(
    migradas,
    [{ rota: "/noticias/a", data: "2024-01-01", titulo: "A, corrigida", publicado: true }],
    [{ rota: "/noticias/a" }],
  ).map((i) => i.rota),
  ["/noticias/b"],
);

/* ------------------------------------------------------------------ */
console.log("\n--- imagens ---");

/* PNG mínimo: assinatura + IHDR dizendo 1600x1000. */
const png = Buffer.alloc(26);
Buffer.from("89504e470d0a1a0a", "hex").copy(png, 0);
png.writeUInt32BE(1600, 16);
png.writeUInt32BE(1000, 20);
confere("mede um PNG pelo cabeçalho", medir(png), { largura: 1600, altura: 1000 });
confere("arquivo que não é imagem não mede", medir(Buffer.alloc(40)), null);

confere("16:10 na medida certa não gera aviso", avisoDeProporcao(1600, 1000), null);
confere(
  "16:10 pequena demais avisa",
  Boolean(avisoDeProporcao(800, 500)),
  true,
);
confere(
  "fora da proporção avisa",
  Boolean(avisoDeProporcao(1000, 1600)),
  true,
);

const nome = nomeSeguro("Foto do Congresso (final).JPG", "webp");
confere(
  "o nome do arquivo vira slug com extensão",
  /^foto-do-congresso-final-[a-z0-9]+\.webp$/.test(nome),
  true,
);

/* ------------------------------------------------------------------ */
console.log("\n--- recuperação de senha ---");

const HASH = "a".repeat(64);
const tokenRec = criarTokenDeRecuperacao("ana@abrapesp.org.br", HASH, SEGREDO);
confere(
  "o link devolve o e-mail de quem pediu",
  lerTokenDeRecuperacao(tokenRec, () => HASH, SEGREDO),
  "ana@abrapesp.org.br",
);
confere(
  "trocada a senha, o link morre",
  lerTokenDeRecuperacao(tokenRec, () => "b".repeat(64), SEGREDO),
  null,
);
confere(
  "conta inexistente não valida",
  lerTokenDeRecuperacao(tokenRec, () => null, SEGREDO),
  null,
);

console.log(
  falhas === 0 ? "\nTudo certo.\n" : `\n${falhas} falha(s).\n`,
);
process.exit(falhas === 0 ? 0 : 1);
