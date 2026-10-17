# Dieta

Web app para planejar e acompanhar a dieta, substituindo a planilha `Dieta.xlsx`.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (Base UI) · Biome · Vitest

## Rodando

```bash
bun install
bun run dev        # http://localhost:3000
```

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
```

## Estrutura

```
src/
  app/          rotas (App Router)
  domains/      código por domínio de negócio
  providers/    providers globais (tema, nuqs, tooltip, toaster)
  shared/       components (ui/ = shadcn, icons.tsx), hooks, lib
docs/           regras de cálculo herdadas da planilha
```
