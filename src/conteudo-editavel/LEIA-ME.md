# Conteúdo escrito no painel

Estes arquivos guardam o que a ABRAPESP publica pelo painel (`/admin`),
separados do conteúdo migrado do site estático antigo, que fica em
`src/conteudo/`.

A separação existe por um motivo prático: `src/conteudo/` é **gerado** por
`scripts/extrair-legado.mjs` a partir da pasta `legado/` e sobrescrito
inteiro a cada execução. Se o painel gravasse lá, a próxima geração
apagaria tudo o que a Associação escreveu. Aqui nada é gerado — só o
painel escreve, e cada alteração vira um commit com o nome de quem fez.

O site lê os dois e junta (ver `src/lib/mesclar-publicacoes.ts`). Em caso
de mesma rota, o que foi escrito no painel tem precedência, para que uma
correção feita por eles nunca seja revertida por uma regeneração do
conteúdo antigo.

- `publicacoes.json` — notícias e colunas escritas ou corrigidas no painel.
- `removidos.json` — as lápides: rotas tiradas do ar. O conteúdo migrado
  não é apagado (a geração o recriaria), a rota é que passa a ser pulada.
- `usuarios.json` — quem entra no painel. A senha nunca é guardada: fica o
  hash PBKDF2 com um salgado por pessoa.
