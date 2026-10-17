@AGENTS.md

## Convenções do projeto

- Stack: Next.js 16 (App Router, Cache Components) · React 19 · Tailwind v4 · shadcn/ui (`base-maia`, sobre Base UI — não Radix) · Biome · Vitest.
- Estrutura por domínio: `src/domains/<dominio>/{components,hooks,services,schemas,types,utils}` + barrel `index.ts`. Código compartilhado em `src/shared/{components,hooks,lib}`; providers em `src/providers`. `src/app` só tem rotas.
- Imports sempre absolutos via `~/*` (→ `src/*`), nunca relativos.
- Arquivos/pastas em kebab-case, `-` como separador (`meal-types.ts`, não `meal.types.ts`).
- Ícones sempre via `~/shared/components/icons` (nunca direto de `lucide-react`).
- Componentes shadcn sem customizar radius/border/shadow.
- Formulários: Conform + Zod v4 (`import { parseWithZod } from "@conform-to/zod/v4"`).
- Estado de URL: nuqs. Toasts: sonner. Tema: next-themes (padrão claro).
- Regras de cálculo da dieta (migradas da planilha): `docs/planilha-calculos.md`.
- Antes de finalizar: `bun run lint`, `bun run typecheck`, `bun run test`.
