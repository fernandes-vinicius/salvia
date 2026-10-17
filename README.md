# Dieta

Web app para planejar e acompanhar a dieta, substituindo a planilha `Dieta.xlsx`.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (Base UI) · Better Auth (Google) · Drizzle + Postgres · Biome · Vitest

## Rodando

Pré-requisitos: bun, Docker.

```bash
bun install
cp .env.example .env          # preencha conforme abaixo
bun run db:up                 # Postgres local (docker compose)
bun run db:migrate            # aplica as migrations em ./drizzle
bun run dev                   # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Postgres. Local: `postgresql://dieta:dieta@localhost:5432/dieta`. Produção: Neon. |
| `BETTER_AUTH_SECRET` | Segredo da sessão (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | URL base do app (`http://localhost:3000` em dev). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth do Google (abaixo). |

As variáveis são validadas com Zod em `src/shared/lib/env.ts`: se faltar alguma, o erro diz qual.

### Login com Google

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Criar credenciais → ID do cliente OAuth** → tipo **Aplicativo da Web** (configure a tela de consentimento antes, se pedir).
2. **Origens JavaScript autorizadas:** `http://localhost:3000`
3. **URIs de redirecionamento autorizados:** `http://localhost:3000/api/auth/callback/google`
4. Copie o client ID/secret para o `.env`. Em produção, repita com o domínio real.

## Scripts

```bash
bun run dev         # dev server (Turbopack)
bun run build       # build de produção
bun run start       # serve o build
bun run typecheck   # next typegen && tsc --noEmit
bun run lint        # biome check --write .
bun run lint:ci     # biome ci .
bun run format      # biome format --write .
bun run test        # vitest run
bun run db:up       # sobe o Postgres local
bun run db:generate # gera migration a partir do schema Drizzle
bun run db:migrate  # aplica migrations
bun run db:studio   # Drizzle Studio
bun run auth:generate # regenera o schema do Better Auth (após mudar plugins/campos)
```

## Estrutura

```
src/
  app/          rotas (App Router)
  domains/      código por domínio de negócio
  providers/    providers globais (tema, nuqs, tooltip, toaster)
  shared/       components (ui/ = shadcn, icons.tsx), hooks, lib, db (Drizzle)
  proxy.ts      redireciona pra /login sem cookie de sessão
docs/           regras de cálculo herdadas da planilha
drizzle/        migrations SQL geradas pelo drizzle-kit
```
