/**
 * Todo endereço do site estático antigo tem destino no site novo.
 *
 * Eram 147 arquivos .html servidos da raiz, e há links de fora apontando
 * para eles — de outras associações, de redes sociais, dos buscadores. Um
 * 404 aqui é link perdido e posição perdida na busca, então cada um vira
 * um redirecionamento permanente.
 *
 * Lê o conteúdo já extraído e grava src/conteudo/redirecionamentos.json,
 * que o next.config.ts transforma em regras.
 */
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const ler = (nome) =>
  JSON.parse(fs.readFileSync(path.join(raiz, "src/conteudo", nome), "utf8"));

const itens = [...ler("publicacoes.json"), ...ler("paginas.json")];

const redirecionamentos = itens
  .filter((i) => i.rotaAntiga && i.rotaAntiga !== i.rota)
  .map((i) => ({ origem: i.rotaAntiga, destino: i.rota }));

/* As duas listagens não saem do conteúdo — elas são páginas do próprio
   app — mas os endereços antigos existiam e precisam de destino. */
redirecionamentos.push(
  { origem: "/noticias.html", destino: "/noticias" },
  { origem: "/coluna-de-associados.html", destino: "/coluna-de-associados" },
);

const vistos = new Set();
const unicos = redirecionamentos.filter((r) => {
  if (vistos.has(r.origem)) return false;
  vistos.add(r.origem);
  return true;
});

fs.writeFileSync(
  path.join(raiz, "src/conteudo/redirecionamentos.json"),
  `${JSON.stringify(unicos, null, 2)}\n`,
);

/* Conferência: todo .html que existia tem de estar coberto. */
const existiam = fs
  .readdirSync(path.join(raiz, "legado"))
  .filter((f) => f.endsWith(".html"))
  .map((f) => `/${f}`);
const descobertos = existiam.filter((e) => !vistos.has(e));

console.log(`redirecionamentos: ${unicos.length}`);
console.log(`páginas antigas sem destino: ${descobertos.length}`);
descobertos.forEach((d) => console.log(`  - ${d}`));
