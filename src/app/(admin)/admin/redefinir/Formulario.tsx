"use client";

import { useActionState, useState } from "react";
import {
  redefinirComToken,
  type Resultado,
} from "@/app/(admin)/admin/acoes-recuperacao";

const campo =
  "mt-1.5 block w-full rounded-xl border border-ardosia-300 bg-white px-4 py-2.5 text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200";
const rotulo = "block text-sm font-medium text-ardosia-800";

export default function Formulario({ token }: { token: string }) {
  const [estado, acao, gravando] = useActionState<Resultado, FormData>(
    redefinirComToken,
    {},
  );

  /* Controlados: o React esvazia formulário não controlado depois da ação,
     e numa recusa a pessoa teria de digitar as duas senhas de novo. */
  const [campos, setCampos] = useState({ nova: "", repetida: "" });

  return (
    <form action={acao} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="nova" className={rotulo}>
          Senha nova
        </label>
        <input
          id="nova"
          name="nova"
          type="password"
          value={campos.nova}
          onChange={(e) => setCampos({ ...campos, nova: e.target.value })}
          required
          minLength={12}
          autoComplete="new-password"
          className={campo}
        />
        <p className="mt-1.5 text-xs text-ardosia-500">
          Pelo menos 12 caracteres. Uma frase que só você diria funciona melhor
          do que uma palavra com símbolos.
        </p>
      </div>
      <div>
        <label htmlFor="repetida" className={rotulo}>
          Repita a senha nova
        </label>
        <input
          id="repetida"
          name="repetida"
          type="password"
          value={campos.repetida}
          onChange={(e) => setCampos({ ...campos, repetida: e.target.value })}
          required
          minLength={12}
          autoComplete="new-password"
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
        disabled={gravando}
        className="w-full rounded-full bg-azul-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-azul-600 disabled:opacity-60"
      >
        {gravando ? "Gravando…" : "Definir a senha nova"}
      </button>
    </form>
  );
}
