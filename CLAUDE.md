@AGENTS.md

## Convenções do projeto

- Stack: Next.js 16 (App Router, Cache Components) · React 19 · Tailwind v4 · shadcn/ui (`base-maia`, sobre Base UI — não Radix) · Biome · Vitest.
- Estrutura por domínio: `src/domains/<dominio>/{components,hooks,services,schemas,types,utils}` + barrel `index.ts`. Código compartilhado em `src/shared/{components,hooks,lib}`; providers em `src/providers`. `src/app` só tem rotas.
- Imports sempre absolutos via `~/*` (→ `src/*`), nunca relativos.
- Arquivos/pastas em kebab-case, `-` como separador (`meal-types.ts`, não `meal.types.ts`).
- Ícones sempre via `~/shared/components/icons` (nunca direto de `lucide-react`).
- Design system (tokens em `src/app/globals.css`, preview em `/design-system`):
  - Paleta verde-sálvia + creme, light (padrão) e dark. Use só tokens semânticos (`bg-primary`, `bg-secondary`, `text-muted-foreground`…), nunca cores cruas do Tailwind (`green-600`, `stone-100`).
  - Cores de domínio: `macro-protein`, `macro-carb`, `macro-fat` (ex.: `bg-macro-carb`); séries de gráfico em `chart-1..5`.
  - Sem sombras: os namespaces `shadow`/`drop-shadow`/`inset-shadow`/`text-shadow` estão zerados no `@theme`, classes `shadow-*` não geram CSS.
  - Bordas leves: prefira separar por superfície (`bg-card` sobre `bg-background`, `bg-secondary` para destaque) em vez de bordas; quando precisar, `ring-1 ring-foreground/5`.
  - Títulos e números em `font-heading` (Manrope) com `tabular-nums`; corpo em Inter.
  - Componentes shadcn: não editar radius/border/shadow por arquivo; ajuste visual vem dos tokens.
- Formulários: Conform + Zod v4 (`import { parseWithZod } from "@conform-to/zod/v4"`).
- Estado de URL: nuqs. Toasts: sonner. Tema: next-themes (padrão claro).
- Regras de cálculo da dieta (migradas da planilha): `docs/planilha-calculos.md`.
- Antes de finalizar: `bun run lint`, `bun run typecheck`, `bun run test`.
