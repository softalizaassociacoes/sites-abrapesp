import "server-only";
import crypto from "node:crypto";
import sementeJson from "@/conteudo-editavel/usuarios.json";
import { type Papel } from "@/lib/contas-painel";

/**
 * Quem pode entrar no painel.
 *
 * O painel de outro site nosso tem um usuário só, numa variável de ambiente. Aqui a
 * lista é gravável, porque a ABRAPESP pediu para administrar as contas pelo
 * próprio painel: quem publica entra com a sua conta, e é o nome dela que
 * fica no histórico de cada alteração.
 *
 * A lista vive em src/conteudo-editavel/usuarios.json, versionada neste
 * repositório, que é privado. A senha nunca é guardada: o que fica é o hash
 * PBKDF2-SHA256 com 210 mil iterações e um salgado por pessoa — o mínimo
 * que a OWASP recomenda para esse algoritmo.
 *
 * ADMIN_USUARIOS continua sendo lida, e serve de semente: enquanto o
 * arquivo estiver vazio, vale a variável. É o que permite o primeiro acesso
 * antes de existir alguém cadastrado.
 *
 * DEFASAGEM: a lista vem do pacote gerado no build, então uma conta criada,
 * removida ou com senha trocada pelo painel só passa a valer quando o
 * deploy termina, uns poucos minutos depois. Para cortar um acesso na hora,
 * remova a pessoa e refaça o deploy, ou troque ADMIN_SESSION_SECRET, que
 * invalida todas as sessões abertas de uma vez.
 */

export type { Papel };

export type Usuario = {
  nome: string;
  papel: Papel;
  salgado: string;
  hash: string;
  /** Para entrar e para receber o link de redefinição de senha. */
  email?: string;
};

const ITERACOES = 210_000;
const TAMANHO = 32;

export function gerarHash(senha: string, salgado: string): string {
  return crypto
    .pbkdf2Sync(senha.normalize("NFKC"), salgado, ITERACOES, TAMANHO, "sha256")
    .toString("hex");
}

export function gerarSalgado(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function criarUsuario(
  nome: string,
  papel: Papel,
  senha: string,
  email?: string,
): Usuario {
  const salgado = gerarSalgado();
  return {
    nome,
    papel,
    salgado,
    hash: gerarHash(senha, salgado),
    ...(email ? { email: email.trim().toLowerCase() } : {}),
  };
}

/** Lê as contas da variável de ambiente, no formato nome:papel:salgado:hash. */
function daSemente(): Usuario[] {
  const bruto = process.env.ADMIN_USUARIOS ?? "";
  const usuarios: Usuario[] = [];
  for (const linha of bruto.split(";")) {
    const partes = linha.trim().split(":");
    if (partes.length !== 4) continue;
    const [nome, papel, salgado, hash] = partes;
    if (!nome || !salgado || !hash) continue;
    if (papel !== "editor" && papel !== "administrador") continue;
    usuarios.push({ nome, papel, salgado, hash });
  }
  return usuarios;
}

export function listarUsuarios(): Usuario[] {
  const doArquivo = sementeJson as Usuario[];
  return doArquivo.length > 0 ? doArquivo : daSemente();
}

/** De onde a lista veio, para o painel saber o que pode administrar. */
export function origemDasContas(): "arquivo" | "variavel" | "nenhuma" {
  if ((sementeJson as Usuario[]).length > 0) return "arquivo";
  return daSemente().length > 0 ? "variavel" : "nenhuma";
}

/** Encontra a conta pelo nome ou pelo e-mail, tanto faz o que foi digitado. */
export function porIdentificador(identificador: string): Usuario | undefined {
  const limpo = identificador.trim();
  const baixo = limpo.toLowerCase();
  const usuarios = listarUsuarios();
  return (
    usuarios.find((u) => u.nome === limpo) ??
    usuarios.find((u) => u.email?.toLowerCase() === baixo)
  );
}

/**
 * Confere nome (ou e-mail) e senha.
 *
 * Quando a conta não existe, ainda assim calculamos um hash descartável:
 * sem isso, o tempo de resposta diria quais contas existem.
 */
export function autenticar(nome: string, senha: string): Usuario | null {
  const achado = porIdentificador(nome);
  const alvo = achado ?? {
    nome: "",
    papel: "editor" as Papel,
    salgado: "00".repeat(16),
    hash: "00".repeat(TAMANHO),
  };

  const calculado = gerarHash(senha, alvo.salgado);
  const a = Buffer.from(calculado, "hex");
  const b = Buffer.from(alvo.hash, "hex");
  const confere = a.length === b.length && crypto.timingSafeEqual(a, b);

  return achado && confere ? achado : null;
}

export function papelDe(nome: string): Papel | null {
  return listarUsuarios().find((u) => u.nome === nome)?.papel ?? null;
}

export function ehAdministrador(nome: string): boolean {
  return papelDe(nome) === "administrador";
}

/* As regras de senha e de nome ficam em src/lib/contas-painel.ts, com as
   demais decisões sobre contas, e são reexportadas daqui porque é por este
   módulo que o painel entra. */
export { nomeInvalido, senhaFraca } from "@/lib/contas-painel";
