<p align="center">
  <a href="https://salvia-dieta.vercel.app">
    <img src="docs/images/salvia-cover.png" alt="Sálvia: planejador de dieta e macros pra quem treina, com telas do app mostrando o planejado × meta e as refeições" width="100%">
  </a>
</p>

<p align="center">
  <a href="https://salvia-dieta.vercel.app"><strong>Abrir o app</strong></a> ·
  <a href="https://salvia-storybook.vercel.app"><strong>Storybook</strong></a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#rodando-localmente">Rodar localmente</a>
</p>

# Sálvia · Dieta e Nutrição

App web pra quem treina organizar a dieta: calcula quanto você gasta por dia, define a meta de proteína, carboidrato e gordura e monta as refeições com a Tabela TACO, mostrando na hora se o dia fecha com a meta. Serve pra quem monta a própria dieta e pra quem segue a do nutricionista (o app ajuda a colocar em prática, não substitui o profissional).

- **App:** https://salvia-dieta.vercel.app
- **Storybook (design system):** https://salvia-storybook.vercel.app

Nasceu pra substituir uma planilha (`Dieta.xlsx`); as regras de cálculo herdadas dela estão em [`docs/planilha-calculos.md`](docs/planilha-calculos.md).

## Funcionalidades

**Grátis, pra todo mundo**

- **TMB e gasto do dia:** Mifflin-St Jeor ou Harris-Benedict + atividade do dia a dia + treinos (MET), sem número técnico pra digitar.
- **Meta:** perder, manter ou ganhar peso no ritmo escolhido; proteína animal e gordura em g/kg, carboidrato no resto.
- **Dieta:** refeições com alimentos da TACO ou próprios, arrastar e soltar, substituir mantendo o macro, opções ("200 g de mamão **ou** 1 banana"), medidas caseiras ("≈ 4 colheres de sopa"), resumo do dia com fibra e água sugerida, modo Visualizar e PDF.
- **Dietas prontas:** modelos recalculados pras suas metas.
- **Lista de compras:** soma a dieta por período, converte pro que se compra (arroz cozido → cru), agrupa por seção do mercado e estima o custo (com o preço do seu mercado, se quiser).
- **Acompanhamento:** check-in diário ("comi" ou "furei"), sequência de dias com comemoração, medidas e pesagens com gráfico, ajuste da meta pelo peso real.
- **Compartilhar:** link público só de leitura da dieta.
- **Calculadoras públicas** (TMB, macros, proteína, água) e landing.
- **PWA:** instalável, abre em tela cheia.

**Com IA, em beta fechado** (só pra e-mails em `BETA_EMAILS`)

- **Importar dieta do nutricionista:** PDF ou fotos → a IA (Gemini) lê refeições, quantidades e substituições → casa com a TACO → revisão alimento por alimento antes de salvar.
- **Receita da refeição:** receita prática com **todos os alimentos da refeição nas quantidades exatas** e só extras sem caloria, com foto ilustrativa (Unsplash). "Outra receita", salvar em **Minhas receitas** e compartilhar por link (`/r/:token`, com prévia no WhatsApp/LinkedIn).
- Limite diário por pessoa (20 receitas, 10 leituras de dieta).

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (sobre Base UI) · Better Auth (Google) · Drizzle ORM + Postgres (Neon) · Vercel AI SDK + Google Gemini · Serwist (PWA) · nuqs · Conform + Zod · Biome · Vitest + Testing Library · Storybook 10 · PostHog + Microsoft Clarity

## Rodando localmente

Pré-requisitos: [bun](https://bun.sh) e Docker.

```bash
bun install
cp .env.example .env          # preencha conforme abaixo
bun run db:up                 # Postgres local (docker compose)
bun run db:migrate            # aplica as migrations em ./drizzle
bun run db:seed:taco          # importa a Tabela TACO (alimentos)
bun run dev                   # http://localhost:3000
```

### Variáveis de ambiente

As obrigatórias são validadas com Zod em `src/shared/lib/env.ts` (se faltar alguma, o erro diz qual). As opcionais só ligam recursos: sem elas, o app funciona sem aquela parte.

| Variável | | Descrição |
|---|---|---|
| `DATABASE_URL` | obrigatória | Postgres. Local: `postgresql://salvia:salvia@localhost:5432/salvia`. Produção: Neon (São Paulo). |
| `BETTER_AUTH_SECRET` | obrigatória | Segredo da sessão (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | obrigatória | URL base do app (`http://localhost:3000` em dev). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | obrigatórias | OAuth do Google (abaixo). |
| `GEMINI_API_KEY` | opcional | Chave do [Google AI Studio](https://aistudio.google.com/apikey) pros recursos de IA. |
| `GEMINI_MODEL` | opcional | Modelo do Gemini (padrão `gemini-3.1-flash-lite`). |
| `BETA_EMAILS` | opcional | E-mails (vírgula) que veem os recursos em beta. |
| `UNSPLASH_ACCESS_KEY` | opcional | Fotos ilustrativas das receitas ([unsplash.com/developers](https://unsplash.com/developers)). |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | opcionais | PostHog (funil, retenção, gravações). Só em produção. |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | opcional | Microsoft Clarity (mapa de calor nas páginas públicas). Só em produção. |
| `NEXT_PUBLIC_SITE_URL` | opcional | URL pública (SEO, links compartilhados). Padrão: `https://salvia-dieta.vercel.app`. |

As `NEXT_PUBLIC_*` entram no build: na Vercel, cadastre antes do deploy.

### Login com Google

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Criar credenciais → ID do cliente OAuth** → tipo **Aplicativo da Web** (configure a tela de consentimento antes, se pedir).
2. **Origens JavaScript autorizadas:** `http://localhost:3000`
3. **URIs de redirecionamento autorizados:** `http://localhost:3000/api/auth/callback/google`
4. Copie o client ID/secret para o `.env`. Em produção, repita com o domínio real.

### Recursos em beta

Ponha seu e-mail em `BETA_EMAILS` e a chave do Gemini em `GEMINI_API_KEY`. Aparecem: **Importar dieta (beta)** no menu ⋮ da Dieta, **Sugerir receita (beta)** no menu ⋮ de cada refeição e **Minhas receitas** no menu do perfil. A checagem é sempre no servidor (`isBetaUser`); pra quem não está na lista, as páginas dão 404.

## Scripts

```bash
bun run dev               # dev server (Turbopack)
bun run build             # build de produção
bun run start             # serve o build (PWA/service worker só funciona aqui)
bun run typecheck         # next typegen && tsc --noEmit
bun run lint              # biome check --write .
bun run lint:ci           # biome ci .
bun run format            # biome format --write .
bun run test              # vitest run
bun run test:watch        # vitest em modo watch
bun run storybook         # Storybook em http://localhost:6006
bun run build-storybook   # gera storybook-static/

bun run db:up             # sobe o Postgres local
bun run db:down           # derruba o Postgres local
bun run db:generate       # gera migration a partir do schema Drizzle
bun run db:migrate        # aplica migrations (Neon: bun --env-file=.env.neon run db:migrate)
bun run db:studio         # Drizzle Studio
bun run db:seed:taco      # importa/atualiza a Tabela TACO (idempotente)
bun run auth:generate     # regenera o schema do Better Auth (após mudar plugins/campos)

bun run metrics           # funil e retenção (agregados, sem dados pessoais); :prod lê o Neon
bun run feedback          # sugestões enviadas pelo app (-- --dias=N); :prod lê o Neon
bun run generate-pwa-assets  # ícones do PWA a partir de public/logo-salvia-icon.svg
```

`.env.neon` (só com `DATABASE_URL` do Neon) é usado pelos scripts `:prod` e pelas migrations de produção.

## Storybook

Design system e componentes do app, publicado em **https://salvia-storybook.vercel.app**.

- **Fundamentos** (MDX em `src/stories/`): introdução, cores (com contraste calculado ao vivo), tipografia, raios e espaçamento, ícones.
- **Componentes:** `*.stories.tsx` ao lado de cada componente, com títulos em pt-BR (`Componentes/…`, `App/…`, `Dieta/…`). Ex.: telas da Dieta com o dia de exemplo da landing, comemorações, receita da refeição.
- Tema claro/escuro (addon-themes), acessibilidade com axe (addon-a11y), marca do Sálvia no manager.
- Configuração em `.storybook/` (`@storybook/nextjs-vite`, Tailwind via `@tailwindcss/vite`, alias `~`).

Componente novo de UI ou do app? Crie a story junto. Componentes que chamam Server Actions ficam de fora ou com a action mockada.

## Deploy

Dois projetos na Vercel ligados ao GitHub; cada push na `main` publica os dois:

| Projeto | O quê | Build |
|---|---|---|
| `salvia` | o app (região `gru1`, ao lado do Neon) | `next build` |
| `salvia-storybook` | o Storybook | `bun run build-storybook` → `storybook-static/` |

Fluxo: trabalhar na branch `dev` → PR pra `main` → merge. **Mudou o schema?** Rode `bun --env-file=.env.neon run db:migrate` **antes** do merge.

## Qualidade e convenções

- **Mobile first** (estilos base pro celular; conferir em ~390 px, também com a fonte do sistema em 130%) e **TDD** (teste falhando antes do código). Regras puras ficam em `domains/<x>/utils` com testes ao lado.
- Antes de subir: `bun run lint`, `bun run typecheck`, `bun run test`.
- Landing com Lighthouse 100 em acessibilidade, boas práticas e SEO; desempenho ~90–96.
- Telas de 404 e erro em todos os grupos de rota (`not-found.tsx`, `error.tsx`, `global-error.tsx`).
- Convenções completas (estrutura, design system, auth, Cache Components, cada recurso): [`CLAUDE.md`](CLAUDE.md).

## Observabilidade

- **PostHog** (app inteiro, só em produção): funil (`tmb_salva`, `meta_salva`, `alimento_adicionado`, `receita_gerada`…), retenção e gravações com **todo texto da área logada mascarado** (dados de saúde). Carrega depois da página e passa por `/ingest` no próprio domínio.
- **Microsoft Clarity** (só páginas públicas): mapa de calor e gravações, carregado na primeira interação e sem cookies.
- **Vercel Web Analytics** e `bun run metrics` (funil e retenção direto do banco).
- Links de divulgação com UTM (`?utm_source=linkedin&utm_campaign=...`).

## Estrutura

```
src/
  app/            rotas (App Router): (marketing) landing/calculadoras/links públicos,
                  (app) área logada, (auth) login, 404/erros
  domains/        código por domínio de negócio (components, actions, services,
                  schemas, types, utils + barrel index.ts):
                  profile, goal, food, diet, diet-templates, diet-import, meal-recipe,
                  shopping, checkin, measurements, home, calculators, landing,
                  settings, feedback, ai-usage, metrics, auth, legal
  providers/      providers globais (tema, comemorações…)
  shared/         components (ui/ = shadcn, icons.tsx), hooks, lib (env, ai, analytics…),
                  db (Drizzle: schema/ e seeds/)
  stories/        fundamentos do Storybook (MDX)
  instrumentation-client.ts   PostHog (carregado depois da página)
  proxy.ts        checagem otimista de sessão (a real é o DAL getCurrentUser)
docs/             cálculos da planilha, roadmap, modelo de negócio, planos e ideias Pro
drizzle/          migrations SQL geradas pelo drizzle-kit
scripts/          seed da TACO, métricas, sugestões
.storybook/       configuração do Storybook
```

## Documentação

- [`docs/roadmap.md`](docs/roadmap.md): ideias e backlog.
- [`docs/ideias-pro.md`](docs/ideias-pro.md): recursos pagos (Sálvia Pro) e o que já está em beta.
- [`docs/modelo-de-negocio.md`](docs/modelo-de-negocio.md) e [`docs/plano-infra-e-planos.md`](docs/plano-infra-e-planos.md): custos, planos e infraestrutura.
- [`docs/planilha-calculos.md`](docs/planilha-calculos.md): regras de cálculo da dieta.
- [`docs/plano-receita-da-refeicao.md`](docs/plano-receita-da-refeicao.md) e [`docs/plano-receitas-salvas.md`](docs/plano-receitas-salvas.md): planos dos recursos de receita.

O Sálvia é uma ferramenta de cálculo e planejamento: não faz prescrição dietética nem substitui nutricionista ou médico.
