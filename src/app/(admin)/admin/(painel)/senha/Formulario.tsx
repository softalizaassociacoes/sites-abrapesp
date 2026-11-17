"use client";

import { useActionState, useState } from "react";
import {
  trocarMinhaSenha,
  type Resultado,
} from "@/app/(admin)/admin/acoes-contas";

const campo =
  "mt-1.5 block w-full rounded-xl border border-ardosia-300 bg-white px-4 py-2.5 text-ardosia-900 outline-none transition-colors focus:border-azul-500 focus:ring-2 focus:ring-azul-200";
const rotulo = "block text-sm font-medium text-ardosia-800";

export default function Formulario() {
  const [estado, acao, gravando] = useActionState<Resultado, FormData>(
    trocarMinhaSenha,
    {},
  );

  /* Campos controlados: o React esvazia formulário não controlado depois da
     ação, e numa recusa — senha atual errada, as duas novas diferentes —
     obrigaria a redigitar os três campos. Esvazia só quando deu certo. */
  const [campos, setCampos] = useState({ atual: "", nova: "", repetida: "" });
  const [ultimoFeito, setUltimoFeito] = useState<string | undefined>();
  if (estado?.feito && estado.feito !== ultimoFeito) {
    setUltimoFeito(estado.feito);
    setCampos({ atual: "", nova: "", repetida: "" });
  }

  return (
    <form
      action={acao}
      className="mt-8 rounded-2xl border border-ardosia-200 bg-white p-6"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="atual" className={rotulo}>
            Senha atual
          </label>
          <input
            id="atual"
            name="atual"
            type="password"
            value={campos.atual}
            onChange={(e) => setCampos({ ...campos, atual: e.target.value })}
            required
            autoComplete="current-password"
            className={campo}
          />
        </div>
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
            Pelo menos 12 caracteres. Uma frase que só você diria funciona
            melhor do que uma palavra com símbolos.
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
      </div>

      {estado?.erro && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-azul-50 px-4 py-3 text-sm text-azul-800"
        >
          {estado.erro}
        </p>
      )}
      {estado?.feito && (
        <p className="mt-5 rounded-xl bg-verde-50 px-4 py-3 text-sm text-verde-900">
          {estado.feito}
        </p>
      )}

      <button
        type="submit"
        disabled={gravando}
        className="mt-6 rounded-full bg-azul-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-azul-600 disabled:opacity-60"
      >
        {gravando ? "Gravando…" : "Trocar a senha"}
      </button>
    </form>
  );
}
