/**
 * As regras de quem pode alterar qual conta — só decisão, sem gravação.
 *
 * Separado de src/lib/admin/contas.ts, que é `server-only`, para poder ser
 * testado sozinho. A separação importa aqui mais do que em qualquer outro
 * lugar do painel: um erro nestas regras tranca a Associação fora da própria
 * ferramenta, e consertar isso exige mexer no Vercel, que é justamente a
 * dependência que o painel existe para acabar.
 */

export type Papel = "editor" | "administrador";

/** O mínimo que estas regras precisam saber de uma conta. */
export type Conta = { nome: string; papel: Papel; email?: string };

function administradores(contas: Conta[]): Conta[] {
  return contas.filter((c) => c.papel === "administrador");
}

export function senhaFraca(senha: string): string | null {
  if (senha.length < 12) return "A senha precisa de pelo menos 12 caracteres.";
  if (/^\d+$/.test(senha)) return "A senha não pode ser só números.";
  if (/^(.)\1+$/.test(senha)) {
    return "A senha não pode ser um caractere repetido.";
  }
  return null;
}

/**
 * A validação de e-mail é a mesma do formulário de contato: só o que
 * impediria o envio de funcionar. Quem valida e-mail de verdade é a caixa
 * de entrada, na hora de redefinir a senha.
 */
export function emailInvalido(email: string): string | null {
  const limpo = email.trim();
  if (!limpo) return "Informe o e-mail.";
  if (limpo.length > 160) return "O e-mail é longo demais.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo)) {
    return "Este e-mail não parece válido.";
  }
  return null;
}

export function nomeInvalido(nome: string): string | null {
  const limpo = nome.trim();
  if (limpo.length < 2) return "O nome precisa de pelo menos 2 caracteres.";
  if (!/^[a-zA-Z0-9._-]+$/.test(limpo)) {
    return "Use apenas letras, números, ponto, hífen ou sublinhado, sem espaços.";
  }
  return null;
}

/** Por que esta conta não pode ser criada, ou nulo se pode. */
export function problemaAoCriar(
  contas: Conta[],
  nome: string,
  email: string,
  senha: string,
): string | null {
  const limpo = nome.trim();
  const doNome = nomeInvalido(limpo);
  if (doNome) return doNome;
  const doEmail = emailInvalido(email);
  if (doEmail) return doEmail;
  const daSenha = senhaFraca(senha);
  if (daSenha) return daSenha;
  /* Comparação sem caso: "Ana" e "ana" seriam duas contas para quem lê e
     uma fonte de confusão na hora de cortar um acesso. */
  if (contas.some((c) => c.nome.toLowerCase() === limpo.toLowerCase())) {
    return `Já existe uma conta chamada ${limpo}.`;
  }
  const emailBaixo = email.trim().toLowerCase();
  if (contas.some((c) => c.email?.toLowerCase() === emailBaixo)) {
    return `Já existe uma conta com o e-mail ${email.trim()}.`;
  }
  return null;
}

export function problemaAoRemover(
  contas: Conta[],
  nome: string,
  autor: string,
): string | null {
  const alvo = contas.find((c) => c.nome === nome);
  if (!alvo) return `Não existe conta chamada ${nome}.`;
  if (nome === autor) return "Você não pode remover a sua própria conta.";
  if (alvo.papel === "administrador" && administradores(contas).length === 1) {
    return "Esta é a última conta de administrador. Crie outra antes de remover.";
  }
  return null;
}

export function problemaAoMudarPapel(
  contas: Conta[],
  nome: string,
  papel: Papel,
  autor: string,
): string | null {
  const alvo = contas.find((c) => c.nome === nome);
  if (!alvo) return `Não existe conta chamada ${nome}.`;
  if (alvo.papel === papel) return null;
  if (nome === autor && papel !== "administrador") {
    return "Você não pode rebaixar a sua própria conta. Pedir a outro administrador evita trancar o painel por engano.";
  }
  if (alvo.papel === "administrador" && administradores(contas).length === 1) {
    return "Esta é a última conta de administrador. Promova outra antes de rebaixar.";
  }
  return null;
}
