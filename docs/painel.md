# Painel da ABRAPESP

O painel fica em `/admin` e serve para a Associação publicar sozinha, sem
depender da Softaliza.

É o mesmo painel que a SBCS usa, sem a parte bilíngue: a ABRAPESP publica
só em português, então não há abas de idioma, tradução automática nem
revisão obrigatória.

## O que ele faz

- Escrever, editar e remover notícias e textos da Coluna de Associados.
- **Corrigir e tirar do ar o conteúdo que veio do site antigo**: a lista de
  Publicações mostra as 137 publicações migradas junto com as novas, com
  busca e filtro por seção, e um interruptor no ar ⇄ fora do ar em cada
  linha.
- Guardar rascunho: o editor tem dois botões, Publicar e Salvar rascunho, e
  rascunho não aparece para quem visita. O interruptor da lista também liga
  e desliga sem abrir o editor.
- Enviar a imagem de destaque de cada publicação.
- Administrar as contas: criar, remover, mudar o papel, definir o e-mail,
  redefinir a senha de quem a perdeu — e cada pessoa troca a própria senha.
- Entrar com e-mail (ou com o nome de usuário) e recuperar a senha pelo
  "Esqueci a senha", que envia um link por e-mail.

## O conteúdo do site antigo

Corrigir um item migrado grava a correção **na mesma rota**, e a mesclagem
do site passa a mostrar a correção no lugar do original. O original não é
tocado: tire a correção do ar e ele volta.

Tirar do ar um item migrado também não o apaga — a extração o recriaria.
Fica uma lápide em `src/conteudo-editavel/removidos.json`, a mesclagem pula
a rota, e a tela **Fora do ar** desfaz com um clique.

## Como uma publicação vai ao ar

1. Alguém escreve e grava.
2. A gravação vira um commit neste repositório, com o nome de quem fez.
3. O Vercel vê o commit e publica o site em poucos minutos.

Não existe banco de dados. O histórico do git **é** o histórico editorial:
para saber quem mudou o quê e quando, basta o `git log` do arquivo
`src/conteudo-editavel/publicacoes.json`.

## Texto

O campo guarda HTML, mas ninguém precisa digitar `<p>`: escrevendo
normalmente, uma linha em branco separa parágrafos e o painel faz o resto
ao gravar. Quem já escreve HTML não é atrapalhado — havendo marcação de
bloco, o texto passa intacto.

O resumo é o que aparece no cartão da listagem. Em branco, sai do começo
do texto.

## Imagem de destaque

O arquivo é escolhido no formulário e sobe na hora, para
`public/assets/img/painel/AAAA/MM/`, como qualquer outro arquivo do site —
vira commit igual ao texto. Aceita JPG, PNG e WebP.

Antes de enviar, o navegador reduz a foto: no máximo 2000px no lado maior,
reencodada em WebP, afrouxando qualidade e depois tamanho até caber em
3 MB. Não é escolha, é o teto da plataforma: a Vercel recusa com 413 toda
requisição acima de 4.500.000 bytes, antes de o nosso código rodar.

A medida ideal é **1600x1000** (16:10), que é a proporção do quadro dos
cartões. Fora dela a imagem não é recusada — o cartão recorta as bordas —,
mas quem envia recebe o aviso.

## Esqueci a senha

O link chega pelo SendGrid, vale uma hora e funciona uma vez — ele carrega
um pedaço do hash atual, então redefinida a senha o link morre sozinho. A
tela responde a mesma coisa exista ou não a conta, para não entregar a
lista de e-mails. Conta sem e-mail cadastrado não recebe link: um
administrador redefine em Contas.

Sem `SENDGRID_API_KEY` configurada, essa tela some e a redefinição fica só
com os administradores, em Contas.

## Contas

A lista vive em `src/conteudo-editavel/usuarios.json`, versionada neste
repositório, que é privado. A senha nunca é guardada: o que fica é o hash
PBKDF2-SHA256 com 210 mil iterações e um salgado por pessoa.

`ADMIN_USUARIOS` serve de semente: enquanto o arquivo estiver vazio, vale a
variável. É o que permite o primeiro acesso antes de existir alguém
cadastrado.

**Defasagem:** a lista vem do pacote gerado no build, então uma conta
criada, removida ou com senha trocada pelo painel só passa a valer quando o
deploy termina, uns poucos minutos depois. Para cortar um acesso na hora,
troque `ADMIN_SESSION_SECRET`, que invalida todas as sessões abertas de uma
vez.

Vale criar um acesso individual para cada pessoa que for publicar: assim o
histórico registra quem fez cada alteração.

## O que precisa estar configurado

Ver `.env.example`. Em resumo:

| Variável | Sem ela |
| --- | --- |
| `ADMIN_SESSION_SECRET` | o painel não abre |
| `ADMIN_USUARIOS` | ninguém entra da primeira vez |
| `GITHUB_TOKEN`, `GITHUB_REPO` | o painel abre em leitura e avisa que não grava |
| `SENDGRID_API_KEY` | não há "esqueci a senha"; administradores redefinem |

A tela inicial do painel lista o que falta.

## Testes

```
npm run teste
```

`scripts/testes/painel.mts` cobre as regras que decidem sozinhas (sessão,
contas, slug, parágrafos, mesclagem, imagens, recuperação).
`scripts/testes/gravacao.mts` exercita a gravação contra um GitHub falso:
caminho do arquivo, mensagem do commit, conflito 409 e as lápides.
