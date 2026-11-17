"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  alterarEmail,
  alterarPapel,
  criarConta,
  redefinirSenhaDe,
  removerConta,
  type Resultado,
} from "@/app/(admin)/admin/acoes-contas";

/**
 * Quem pode entrar no painel.
 *
 * Cada linha tem a sua própria ação, com o seu próprio estado: o erro de
 * uma remoção não some a mensagem de outra, e nada fica dependendo de um
 * formulário gigante só porque as três operações moram na mesma tela.
 *
 * Remover e redefinir senha pedem confirmação no navegador. Não é
 * segurança — a salvaguarda de verdade está no servidor —, é não deixar um
 * clique errado cortar o acesso de alguém.
 */

type Conta = {
  nome: string;
  papel: "editor" | "administrador";
  email?: string;
};

const campo =
  "mt-1.5 block w-full rounded-xl border border-ardosia-300 bg-white px-4 py-2.5 text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200";
const rotulo = "block text-sm font-medium text-ardosia-800";
const botaoDiscreto =
  "rounded-full border border-ardosia-300 px-4 py-2 text-sm font-semibold text-ardosia-800 transition-colors hover:border-azul-400 hover:text-azul-700 disabled:opacity-50";

function Aviso({ estado }: { estado: Resultado | undefined }) {
  if (estado?.erro) {
    return (
      <p
        role="alert"
        className="mt-3 rounded-xl bg-azul-50 px-4 py-3 text-sm text-azul-800"
      >
        {estado.erro}
      </p>
    );
  }
  if (estado?.feito) {
    return (
      <p className="mt-3 rounded-xl bg-verde-50 px-4 py-3 text-sm text-verde-900">
        {estado.feito}
      </p>
    );
  }
  return null;
}

function Linha({ conta, eu }: { conta: Conta; eu: string }) {
  const [estadoPapel, acaoPapel, mudandoPapel] = useActionState<
    Resultado,
    FormData
  >(alterarPapel, {});
  const [estadoRemover, acaoRemover, removendo] = useActionState<
    Resultado,
    FormData
  >(removerConta, {});
  const [estadoSenha, acaoSenha, redefinindo] = useActionState<
    Resultado,
    FormData
  >(redefinirSenhaDe, {});
  const [estadoEmail, acaoEmail, mudandoEmail] = useActionState<
    Resultado,
    FormData
  >(alterarEmail, {});

  /* O campo é controlado porque o React esvazia formulário não controlado
     depois da ação: numa falha, a senha digitada sumiria e a pessoa teria
     de pensar outra. Esvazia aqui só quando a gravação deu certo. */
  const [senha, setSenha] = useState("");
  const [ultimoFeito, setUltimoFeito] = useState<string | undefined>();
  if (estadoSenha?.feito && estadoSenha.feito !== ultimoFeito) {
    setUltimoFeito(estadoSenha.feito);
    setSenha("");
  }

  const souEu = conta.nome === eu;
  const outroPapel =
    conta.papel === "administrador" ? "editor" : "administrador";

  return (
    <li className="rounded-2xl border border-ardosia-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ardosia-950">
            {conta.nome}
            {souEu && (
              <span className="ml-2 align-middle text-xs font-normal text-ardosia-500">
                você
              </span>
            )}
          </p>
          <p className="text-sm text-ardosia-600">
            {conta.papel === "administrador"
              ? "Administrador — publica e administra as contas"
              : "Editor — publica"}
          </p>
          <p className="mt-0.5 text-sm text-ardosia-500">
            {conta.email ??
              "sem e-mail — não entra por e-mail nem redefine senha sozinha"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={acaoPapel}>
            <input type="hidden" name="nome" value={conta.nome} />
            <input type="hidden" name="papel" value={outroPapel} />
            <button
              type="submit"
              disabled={mudandoPapel || souEu}
              className={botaoDiscreto}
              title={
                souEu
                  ? "Outro administrador precisa fazer isso pela sua conta."
                  : undefined
              }
            >
              {mudandoPapel
                ? "Mudando…"
                : outroPapel === "administrador"
                  ? "Tornar administrador"
                  : "Tornar editor"}
            </button>
          </form>

          <form action={acaoRemover}>
            <input type="hidden" name="nome" value={conta.nome} />
            <button
              type="submit"
              disabled={removendo || souEu}
              onClick={(e) => {
                if (
                  !confirm(
                    `Remover a conta de ${conta.nome}? Ela perde o acesso ao painel.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="rounded-full border border-azul-300 px-4 py-2 text-sm font-semibold text-azul-800 transition-colors hover:bg-azul-50 disabled:opacity-40"
              title={
                souEu ? "Você não pode remover a sua própria conta." : undefined
              }
            >
              {removendo ? "Removendo…" : "Remover"}
            </button>
          </form>
        </div>
      </div>

      <form
        action={acaoEmail}
        className="mt-4 flex flex-wrap items-end gap-3 border-t border-ardosia-200 pt-4"
      >
        <input type="hidden" name="nome" value={conta.nome} />
        <div className="min-w-56 flex-1">
          <label htmlFor={`email-${conta.nome}`} className={rotulo}>
            {conta.email ? "Trocar o e-mail" : "Definir o e-mail"}
          </label>
          <input
            id={`email-${conta.nome}`}
            name="email"
            type="email"
            autoComplete="off"
            placeholder="nome@sbcs.org.br"
            className={campo}
          />
        </div>
        <button type="submit" disabled={mudandoEmail} className={botaoDiscreto}>
          {mudandoEmail ? "Gravando…" : "Gravar e-mail"}
        </button>
      </form>

      {!souEu && (
        <form
          action={acaoSenha}
          className="mt-4 flex flex-wrap items-end gap-3 border-t border-ardosia-200 pt-4"
        >
          <input type="hidden" name="nome" value={conta.nome} />
          <div className="min-w-56 flex-1">
            <label htmlFor={`senha-${conta.nome}`} className={rotulo}>
              Redefinir a senha{" "}
              <span className="font-normal text-ardosia-500">
                — se a pessoa perdeu a dela
              </span>
            </label>
            <input
              id={`senha-${conta.nome}`}
              name="senha"
              type="text"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="off"
              minLength={12}
              placeholder="pelo menos 12 caracteres"
              className={campo}
            />
          </div>
          <button
            type="submit"
            disabled={redefinindo}
            onClick={(e) => {
              if (
                !confirm(
                  `Trocar a senha de ${conta.nome}? A senha antiga dela deixa de valer.`,
                )
              ) {
                e.preventDefault();
              }
            }}
            className={botaoDiscreto}
          >
            {redefinindo ? "Gravando…" : "Redefinir"}
          </button>
        </form>
      )}

      <Aviso estado={estadoEmail} />
      <Aviso estado={estadoPapel} />
      <Aviso estado={estadoRemover} />
      <Aviso estado={estadoSenha} />
    </li>
  );
}

export default function Contas({
  contas,
  eu,
  souAdministrador,
}: {
  contas: Conta[];
  eu: string;
  souAdministrador: boolean;
}) {
  const [estadoNova, acaoNova, criando] = useActionState<Resultado, FormData>(
    criarConta,
    {},
  );

  /* Mesmo motivo da linha: numa recusa — nome repetido, senha curta, ou a
     gravação não configurada — o que foi digitado tem de continuar aí. */
  const [nova, setNova] = useState({
    nome: "",
    email: "",
    papel: "editor",
    senha: "",
  });
  const [ultimoFeito, setUltimoFeito] = useState<string | undefined>();
  if (estadoNova?.feito && estadoNova.feito !== ultimoFeito) {
    setUltimoFeito(estadoNova.feito);
    setNova({ nome: "", email: "", papel: "editor", senha: "" });
  }

  if (!souAdministrador) {
    return (
      <div className="mt-8 rounded-2xl border border-ardosia-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ardosia-950">
          Contas do painel
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ardosia-700">
          Administrar as contas é restrito a administradores. Hoje existem{" "}
          {contas.length}{" "}
          {contas.length === 1 ? "conta cadastrada" : "contas cadastradas"}.
          Para criar ou remover alguém, peça a um administrador.
        </p>
        <p className="mt-3 text-sm text-ardosia-700">
          A sua própria senha você troca em{" "}
          <Link
            href="/admin/senha"
            className="font-semibold text-azul-700 underline"
          >
            trocar a minha senha
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="mt-8 space-y-4">
        {contas.map((c) => (
          <Linha key={c.nome} conta={c} eu={eu} />
        ))}
      </ul>

      <form
        action={acaoNova}
        className="mt-8 rounded-2xl border border-ardosia-200 bg-white p-6"
      >
        <h2 className="font-display text-lg font-semibold text-ardosia-950">
          Nova conta
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nome" className={rotulo}>
              Nome de usuário
            </label>
            <input
              id="nome"
              name="nome"
              value={nova.nome}
              onChange={(e) => setNova({ ...nova, nome: e.target.value })}
              required
              autoComplete="off"
              placeholder="ana"
              className={campo}
            />
            <p className="mt-1.5 text-xs text-ardosia-500">
              Sem espaços nem acentos. É o nome que assina cada alteração.
            </p>
          </div>
          <div>
            <label htmlFor="email" className={rotulo}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={nova.email}
              onChange={(e) => setNova({ ...nova, email: e.target.value })}
              required
              autoComplete="off"
              placeholder="nome@sbcs.org.br"
              className={campo}
            />
            <p className="mt-1.5 text-xs text-ardosia-500">
              Serve para entrar e para receber o link de redefinição.
            </p>
          </div>
          <div>
            <label htmlFor="papel" className={rotulo}>
              Papel
            </label>
            <select
              id="papel"
              name="papel"
              value={nova.papel}
              onChange={(e) => setNova({ ...nova, papel: e.target.value })}
              className={campo}
            >
              <option value="editor">Editor — publica</option>
              <option value="administrador">
                Administrador — publica e administra contas
              </option>
            </select>
          </div>
          <div>
            <label htmlFor="senha-nova" className={rotulo}>
              Senha inicial
            </label>
            <input
              id="senha-nova"
              name="senha"
              type="text"
              value={nova.senha}
              onChange={(e) => setNova({ ...nova, senha: e.target.value })}
              required
              minLength={12}
              autoComplete="off"
              placeholder="pelo menos 12 caracteres"
              className={campo}
            />
            <p className="mt-1.5 text-xs text-ardosia-500">
              Aparece à vista porque você vai repassá-la. Peça que a pessoa
              troque depois.
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={criando}
          className="mt-5 rounded-full bg-azul-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-azul-600 disabled:opacity-60"
        >
          {criando ? "Criando…" : "Criar conta"}
        </button>
        <Aviso estado={estadoNova} />
      </form>
    </>
  );
}
