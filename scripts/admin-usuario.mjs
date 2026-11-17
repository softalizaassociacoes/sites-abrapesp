/**
 * Gera a linha de um usuário do painel para a variável ADMIN_USUARIOS.
 *
 * Uso:
 *   node scripts/admin-usuario.mjs <nome> <papel> <senha>
 *
 * Exemplo:
 *   node scripts/admin-usuario.mjs ana editor 'senha-boa-aqui'
 *
 * A senha não é guardada em lugar nenhum: a saída traz só o salgado e o
 * hash. Junte as linhas de todas as pessoas com ponto e vírgula e cadastre
 * em ADMIN_USUARIOS, no Vercel.
 */
import crypto from "node:crypto";

const [nome, papel, senha] = process.argv.slice(2);

if (!nome || !papel || !senha) {
  console.error("uso: node scripts/admin-usuario.mjs <nome> <papel> <senha>");
  console.error("     papel: editor | administrador");
  process.exit(1);
}

if (papel !== "editor" && papel !== "administrador") {
  console.error(`papel inválido: ${papel} (use editor ou administrador)`);
  process.exit(1);
}

if (senha.length < 12) {
  console.error("a senha precisa de pelo menos 12 caracteres");
  process.exit(1);
}

if (nome.includes(":") || nome.includes(";")) {
  console.error("o nome não pode conter : nem ;");
  process.exit(1);
}

const salgado = crypto.randomBytes(16).toString("hex");
const hash = crypto
  .pbkdf2Sync(senha.normalize("NFKC"), salgado, 210_000, 32, "sha256")
  .toString("hex");

console.log(`${nome}:${papel}:${salgado}:${hash}`);
