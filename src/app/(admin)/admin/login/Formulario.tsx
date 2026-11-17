"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar } from "../acoes";

const campo =
  "mt-1.5 block w-full rounded-xl border border-ardosia-300 bg-white px-4 py-2.5 text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200";

export default function Formulario() {
  const [estado, acao, enviando] = useActionState(entrar, {});

  return (
    <form action={acao} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="usuario"
          className="block text-sm font-medium text-ardosia-800"
        >
          E-mail ou usuário
        </label>
        <input
          id="usuario"
          name="usuario"
          autoComplete="username"
          required
          className={campo}
        />
      </div>

      <div>
        <label
          htmlFor="senha"
          className="block text-sm font-medium text-ardosia-800"
        >
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className={campo}
        />
      </div>

      {estado?.erro && (
        <p
          role="alert"
          className="rounded-xl bg-azul-50 px-4 py-3 text-sm text-azul-800"
        >
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-azul-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-azul-600 disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center">
        <Link
          href="/admin/recuperar"
          className="text-sm font-semibold text-azul-700 hover:text-azul-500"
        >
          Esqueci a senha
        </Link>
      </p>
    </form>
  );
}
