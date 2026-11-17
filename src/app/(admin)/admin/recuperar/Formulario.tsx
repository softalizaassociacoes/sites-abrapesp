"use client";

import { useActionState, useState } from "react";
import {
  pedirRedefinicao,
  type Resultado,
} from "@/app/(admin)/admin/acoes-recuperacao";

const campo =
  "mt-1.5 block w-full rounded-xl border border-ardosia-300 bg-white px-4 py-2.5 text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200";

export default function Formulario() {
  const [estado, acao, enviando] = useActionState<Resultado, FormData>(
    pedirRedefinicao,
    {},
  );
  const [email, setEmail] = useState("");

  if (estado?.feito) {
    return (
      <p className="mt-6 rounded-xl bg-verde-50 px-4 py-3 text-sm leading-relaxed text-verde-900">
        {estado.feito}
      </p>
    );
  }

  return (
    <form action={acao} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-ardosia-800"
        >
          E-mail da conta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
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
        {enviando ? "Enviando…" : "Enviar o link"}
      </button>
    </form>
  );
}
