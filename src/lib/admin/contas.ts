import "server-only";
import { gravarArquivo, lerJson, podeGravar } from "@/lib/admin/repositorio";
import {
  autenticar,
  criarUsuario,
  gerarHash,
  listarUsuarios,
  type Usuario,
} from "@/lib/admin/usuarios";
import {
  emailInvalido,
  problemaAoCriar,
  problemaAoMudarPapel,
  problemaAoRemover,
  senhaFraca,
  type Papel,
} from "@/lib/contas-painel";

/**
 * Administração das contas do painel.
 *
 * Grava a lista como commit, igual ao conteúdo. Duas salvaguardas que não
 * são opcionais: a última conta de administrador não pode ser removida nem
 * rebaixada, senão ninguém mais administra o painel; e ninguém remove nem
 * rebaixa a si mesmo por engano no meio de uma sessão.
 *
 * Toda alteração parte da lista que está no repositório agora, lida pela
 * API, e não da que veio no pacote do build. A diferença importa: entre
 * criar uma conta e criar a seguinte passam-se poucos minutos, e o deploy
 * novo pode não ter terminado — gravando a partir do pacote antigo, a
 * segunda alteração apagaria a primeira.
 */

const ARQUIVO = "src/conteudo-editavel/usuarios.json";

export class ErroDeConta extends Error {}

/** A lista como está no repositório; o pacote do build é só a reserva. */
async function atuais(): Promise<Usuario[]> {
  const doRepositorio = await lerJson<Usuario[]>(ARQUIVO, []);
  return doRepositorio.length > 0 ? doRepositorio : listarUsuarios();
}

async function gravar(usuarios: Usuario[], mensagem: string, autor: string) {
  await gravarArquivo(
    ARQUIVO,
    `${JSON.stringify(usuarios, null, 2)}\n`,
    mensagem,
    autor,
  );
}

/** Para o painel listar sem precisar saber de onde a lista veio. */
export async function contas(): Promise<
  { nome: string; papel: Papel; email?: string }[]
> {
  const lista = podeGravar() ? await atuais() : listarUsuarios();
  return lista
    .map((u) => ({ nome: u.nome, papel: u.papel, email: u.email }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function adicionar(
  nome: string,
  email: string,
  papel: Papel,
  senha: string,
  autor: string,
): Promise<void> {
  const limpo = nome.trim();
  const usuarios = await atuais();
  const problema = problemaAoCriar(usuarios, limpo, email, senha);
  if (problema) throw new ErroDeConta(problema);

  await gravar(
    [...usuarios, criarUsuario(limpo, papel, senha, email)],
    `Cria a conta de ${limpo} (${papel})`,
    autor,
  );
}

/** Define ou corrige o e-mail de uma conta; só administrador chega aqui. */
export async function mudarEmail(
  nome: string,
  email: string,
  autor: string,
): Promise<void> {
  const problema = emailInvalido(email);
  if (problema) throw new ErroDeConta(problema);
  const usuarios = await atuais();
  const alvo = usuarios.find((u) => u.nome === nome);
  if (!alvo) throw new ErroDeConta(`Não existe conta chamada ${nome}.`);
  const baixo = email.trim().toLowerCase();
  if (
    usuarios.some((u) => u.nome !== nome && u.email?.toLowerCase() === baixo)
  ) {
    throw new ErroDeConta(`Já existe uma conta com o e-mail ${email.trim()}.`);
  }
  await gravar(
    usuarios.map((u) => (u.nome === nome ? { ...u, email: baixo } : u)),
    `Define o e-mail de ${nome}`,
    autor,
  );
}

export async function remover(nome: string, autor: string): Promise<void> {
  const usuarios = await atuais();
  const problema = problemaAoRemover(usuarios, nome, autor);
  if (problema) throw new ErroDeConta(problema);

  await gravar(
    usuarios.filter((u) => u.nome !== nome),
    `Remove a conta de ${nome}`,
    autor,
  );
}

export async function mudarPapel(
  nome: string,
  papel: Papel,
  autor: string,
): Promise<void> {
  const usuarios = await atuais();
  const problema = problemaAoMudarPapel(usuarios, nome, papel, autor);
  if (problema) throw new ErroDeConta(problema);
  if (usuarios.find((u) => u.nome === nome)?.papel === papel) return;

  await gravar(
    usuarios.map((u) => (u.nome === nome ? { ...u, papel } : u)),
    `Muda ${nome} para ${papel}`,
    autor,
  );
}

/**
 * Troca a senha de quem está logado, conferindo a atual antes.
 *
 * A conferência usa a lista do pacote do build, que é a mesma que o login
 * usou: é ela que diz qual senha vale agora. A gravação, por sua vez, parte
 * da lista do repositório, para não desfazer alteração recente de outra
 * pessoa.
 */
export async function trocarSenha(
  nome: string,
  senhaAtual: string,
  senhaNova: string,
): Promise<void> {
  if (!autenticar(nome, senhaAtual)) {
    throw new ErroDeConta("A senha atual não confere.");
  }
  const problema = senhaFraca(senhaNova);
  if (problema) throw new ErroDeConta(problema);
  if (senhaAtual === senhaNova) {
    throw new ErroDeConta("A senha nova é igual à atual.");
  }

  const usuarios = await atuais();
  const alvo = usuarios.find((u) => u.nome === nome);
  if (!alvo) throw new ErroDeConta("Conta não encontrada.");

  /* Mantém papel e e-mail do registro que está no repositório, com hash e
     salgado novos: assim uma promoção feita por outra pessoa no intervalo
     não é desfeita pela troca de senha. */
  const novo = {
    ...alvo,
    ...criarUsuario(nome, alvo.papel, senhaNova, alvo.email),
  };
  await gravar(
    usuarios.map((u) => (u.nome === nome ? novo : u)),
    `Troca a senha de ${nome}`,
    nome,
  );
}

/**
 * Troca a senha de quem provou ser dono do e-mail pelo link de
 * redefinição. A prova é o token, conferido antes, na ação — aqui só se
 * valida a senha nova e grava.
 */
export async function trocarSenhaPorToken(
  nome: string,
  senhaNova: string,
): Promise<void> {
  const problema = senhaFraca(senhaNova);
  if (problema) throw new ErroDeConta(problema);
  const usuarios = await atuais();
  const alvo = usuarios.find((u) => u.nome === nome);
  if (!alvo) throw new ErroDeConta("Conta não encontrada.");
  const novo = {
    ...alvo,
    ...criarUsuario(nome, alvo.papel, senhaNova, alvo.email),
  };
  await gravar(
    usuarios.map((u) => (u.nome === nome ? novo : u)),
    `Redefine a senha de ${nome} pelo link de e-mail`,
    nome,
  );
}

/** Redefine a senha de outra pessoa; só administrador chega aqui. */
export async function redefinirSenha(
  nome: string,
  senhaNova: string,
  autor: string,
): Promise<void> {
  const problema = senhaFraca(senhaNova);
  if (problema) throw new ErroDeConta(problema);

  const usuarios = await atuais();
  const alvo = usuarios.find((u) => u.nome === nome);
  if (!alvo) throw new ErroDeConta(`Não existe conta chamada ${nome}.`);

  await gravar(
    usuarios.map((u) =>
      u.nome === nome ? { ...u, hash: gerarHash(senhaNova, u.salgado) } : u,
    ),
    `Redefine a senha de ${nome}`,
    autor,
  );
}
