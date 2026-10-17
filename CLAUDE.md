@AGENTS.md

## Sálvia · Dieta e Nutrição

Nome/tagline centralizados em `~/shared/lib/app-config.ts` (`APP_NAME`, `APP_TAGLINE`); não escrever o nome do app hardcoded.

## Convenções do projeto

- Stack: Next.js 16 (App Router, Cache Components) · React 19 · Tailwind v4 · shadcn/ui (`base-maia`, sobre Base UI — não Radix) · Biome · Vitest.
- Estrutura por domínio: `src/domains/<dominio>/{components,hooks,services,schemas,types,utils}` + barrel `index.ts`. Código compartilhado em `src/shared/{components,hooks,lib}`; providers em `src/providers`. `src/app` só tem rotas.
- Imports sempre absolutos via `~/*` (→ `src/*`), nunca relativos.
- Arquivos/pastas em kebab-case, `-` como separador (`meal-types.ts`, não `meal.types.ts`).
- Ícones sempre via `~/shared/components/icons` (nunca direto de `lucide-react`).
- Design system (tokens em `src/app/globals.css`, preview em `/design-system`):
  - Paleta verde-sálvia + creme, light (padrão) e dark. Use só tokens semânticos (`bg-primary`, `bg-secondary`, `text-muted-foreground`…), nunca cores cruas do Tailwind (`green-600`, `stone-100`).
  - Cores de domínio: `macro-protein` (proteína animal), `macro-protein-vegetal`, `macro-carb`, `macro-fat` (ex.: `bg-macro-carb`); séries de gráfico em `chart-1..5`. Em texto (letras e valores de macro), use os tons `text-macro-*-ink` (contraste ≥ 4,5:1 no tema claro); as cores base são pra barras e bolinhas. Origem da proteína é mostrada pela cor (animal × vegetal), não por letra A/V.
  - Sem sombras: os namespaces `shadow`/`drop-shadow`/`inset-shadow`/`text-shadow` estão zerados no `@theme`, classes `shadow-*` não geram CSS.
  - Bordas leves: prefira separar por superfície (`bg-card` sobre `bg-background`, `bg-secondary` para destaque) em vez de bordas; quando precisar, `ring-1 ring-foreground/5`.
  - Títulos e números em `font-heading` (Manrope) com `tabular-nums`; corpo em Inter.
  - Componentes shadcn: não editar radius/border/shadow por arquivo; ajuste visual vem dos tokens.
  - Tailwind v4: breakpoints arbitrários em `rem` (ex.: `min-[85rem]:`), não em `px` — misturar unidades quebra a ordem das regras e o `md:` vence. Utilitários `@utility` novos não podem ter o nome de outro como prefixo (`container-wrapper-wide` não gera CSS).
  - Painéis (adicionar/editar) sobem de baixo como no listify: `BottomSheetContent` (`~/shared/components/bottom-sheet`) dentro de `<Sheet>`; pra altura fixa use `data-[side=bottom]:h-[…]`.
  - `Button` (Base UI) renderizado como link: `nativeButton={false}` + `render={<Link href="…" />}`, senão o Base UI acusa erro de semântica.
- Navegação: rotas logadas ficam em `src/app/(app)/` (header + barra de abas flutuante `~/shared/components/navigation/tab-bar.tsx`, abas Início `/`, TMB `/tmb`, Meta `/meta`, Dieta `/dieta`). Páginas usam `container-wrapper` + `PageHeader`; o layout já reserva espaço inferior pra barra. Página larga (ex.: Dieta, grade + coluna lateral): `<main data-wide-page className="container-wide …">` — o header acompanha via `group-has-[[data-wide-page]]/app`. Configurações em `/configuracoes` (engrenagem no header), domínio `settings` (tabela `settings`, sem linha = padrão); a fórmula da TMB escolhida lá é passada como `bmrFormula` pras abas TMB e Meta.
- Auth (Better Auth + Google, Drizzle/Postgres):
  - Proteção em 2 camadas: `src/proxy.ts` só checa se o cookie existe (otimista); a checagem real é o DAL `getCurrentUser()` em `~/domains/auth/services/session-service`, obrigatório em toda página/ação que toque dados do usuário.
  - Cache Components: ler sessão (`getCurrentUser`, `headers()`) só dentro de `<Suspense>`, nunca com `await` no topo de layout/página.
  - `~/domains/auth/lib/auth` e `session-service` são server-only; o barrel `~/domains/auth` só exporta coisas seguras pro client.
  - Mudou plugins ou campos do Better Auth? Atualize também `auth-cli-config.ts` e rode `bun run auth:generate && bun run db:generate`.
  - Tabelas novas da dieta: `src/shared/db/schema/<nome>-schema.ts` + export no `schema/index.ts`, com `userId` referenciando `user.id`.
- Testes: importar `describe/it/expect/vi` de `vitest` explicitamente.
- Edição estilo "salva sozinho" (ex.: aba TMB): estado local no client + `useAutosave` (`~/shared/hooks/use-autosave`, debounce + fila + flush ao sair) chamando uma Server Action que valida com Zod e checa o usuário via `getCurrentUser()`. Cálculos derivados rodam no client a partir do estado (funções puras em `domains/<x>/utils`), sem esperar o servidor.
- UX pra leigos: valores técnicos (ex.: fator de atividade) nunca são digitados; o usuário escolhe uma opção descritiva (`ChoiceCard`) e o número aparece só como dica discreta. Medidas numéricas usam `MeasureSlider` (slider + botões −/+).
- Dieta: alimentos arrastáveis (`@dnd-kit/core` + `sortable`) pela alça ⋮⋮: reordenar, mover entre refeições e soltar na lixeira (com "Desfazer"). Estado com ref espelhada (`mealsRef`) porque o `onDragEnd` vem antes do re-render; persistência via `placeItemsAction` só das refeições alteradas (`changedLayouts`).
- Medidas (`/medidas`, menu do perfil): domínio `measurements` (tabela `body_measurement`, uma por dia, tudo opcional; independente do peso da TMB). Histórico estilo planilha, cards de evolução e gráfico (shadcn chart/Recharts) com eixo X em tempo real. Gráficos seguem a skill dataviz (linha 2px, pontos com anel, sem legenda pra 1 série).
- Início (`/`): domínio `home` (só leitura: `getDiet(…, { createIfEmpty: false })`) com checklist TMB → Meta → Dieta, pontos de atenção, plano × meta com veredito, próxima refeição (calculada no navegador, horário local) e objetivo. Regras puras em `domains/home/utils/home.ts`.
- Domínios: `profile` (TMB Mifflin-St Jeor ou Harris-Benedict + NEAT + treinos por MET → GCD fatorial) → `goal` (Meta: objetivo, ajuste de kcal, proteína ANIMAL e gordura em g/kg; carboidrato automático (resto) ou fixado em g/kg) → `food` (TACO global + alimentos do usuário, macros por 100 g/ml ou unidade, proteína animal/vegetal) → `diet` (refeições + itens; resumo estilo planilha g · % · kcal · g/kg, excedente vs GCD, planejado × meta). Base TACO: `bun run db:seed:taco` (idempotente; CSVs em `src/shared/db/seeds/taco`).
- Formulários: Conform + Zod v4 (`import { parseWithZod } from "@conform-to/zod/v4"`).
- Estado de URL: nuqs. Toasts: sonner. Tema: next-themes (padrão claro).
- Regras de cálculo da dieta (migradas da planilha): `docs/planilha-calculos.md`. Ideias futuras/backlog: `docs/roadmap.md`.
- Antes de finalizar: `bun run lint`, `bun run typecheck`, `bun run test`.
