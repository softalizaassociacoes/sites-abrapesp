# Site da ABRAPESP

Associação Brasileira de Psicologia do Esporte — site institucional e
painel de publicação.

Next.js 16 (App Router), React 19, implantado na Vercel. Sem banco de
dados: o conteúdo é JSON versionado neste repositório, e o histórico do
git é o histórico editorial.

## Como rodar

```
npm install
npm run dev
```

Para o painel abrir em desenvolvimento, copie `.env.example` para
`.env.local` e preencha ao menos `ADMIN_SESSION_SECRET` e
`ADMIN_USUARIOS` (ver `docs/painel.md`).

## Como o conteúdo está organizado

| Pasta | O que é |
| --- | --- |
| `src/conteudo/` | **gerado** a partir de `legado/` pelos scripts de extração; sobrescrito inteiro a cada execução |
| `src/conteudo-editavel/` | **escrito pelo painel**; nunca gerado |
| `legado/` | o site estático anterior, mantido só como fonte da migração |
| `public/assets/` | imagens, PDFs e fontes, como estavam no site antigo |

O site lê os dois primeiros e junta: em caso de mesma rota, vale o que foi
escrito no painel. Ver `src/lib/mesclar-publicacoes.ts`.

Para refazer a extração do conteúdo antigo:

```
npm run conteudo:extrair
```

## Painel

Em `/admin`. A documentação está em `docs/painel.md`.

## Testes

```
npm run teste
```
