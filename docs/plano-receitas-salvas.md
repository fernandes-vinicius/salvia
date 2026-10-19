# Plano: receitas salvas + menu da refeição no Visualizar

> Planejado e implementado em 19/10/2026 (beta fechado). Continua o beta da receita da refeição ([`plano-receita-da-refeicao.md`](plano-receita-da-refeicao.md)).

## Contexto
A receita gerada some ao fechar o painel. Se a pessoa gostou, quer guardar e achar de novo depois, sem gerar outra vez. E no modo **Visualizar** da Dieta o card da refeição não tem o menu ⋮, então dá pra ler a dieta mas não usar os recursos dela (como sugerir receita).

## Onde fica
- **"Minhas receitas"** no menu do perfil, entre "Meus alimentos" e "Enviar sugestão". Mesmo padrão de Medidas e Meus alimentos, porque é coleção pessoal que cresce com o tempo. Uma 5ª aba na barra de baixo apertaria o celular e não é algo de todo dia.
- **Atalho na própria refeição**: menu ⋮ → "Receitas salvas (2)" abre as receitas daquela refeição. É onde a pessoa está quando enjoa da comida.
- Só pra beta (`BETA_EMAILS`), como a geração. No Pro, entra no pacote.

## Como funciona
1. **Salvar**: no painel da receita, botão **"Salvar"** (ícone de marcador) ao lado de "Copiar". Depois de salvo vira **"Salva ✓"** e aparece "Ver minhas receitas". "Outra receita" continua funcionando, e cada uma pode ser salva.
2. **Página `/receitas`** ("Minhas receitas"):
   - Lista em cards (título, refeição de origem, tempo, kcal), a mais nova primeiro.
   - Filtro por refeição em chips ("Todas", "Café da manhã", "Almoço"…), na URL (`?refeicao=`, nuqs).
   - Tocar abre a receita num `BottomSheetContent` com o mesmo `RecipeView`, mais "Copiar" e "Excluir" (com "Desfazer" no toast).
   - Vazio: explica como gerar ("Na Dieta, menu ⋮ da refeição → Sugerir receita").
3. **Foto da refeição na hora de salvar**: a receita guarda os ingredientes, as quantidades e os macros daquele momento, porque a dieta pode mudar depois. Se a refeição de origem mudou (outros alimentos ou quantidades), a receita mostra um aviso discreto: "Sua refeição mudou desde que você salvou: confira as quantidades." Se a refeição foi apagada, a receita fica, com o nome guardado.
4. Limite de 100 receitas por pessoa (aviso pra excluir antigas).

## Menu ⋮ no Visualizar
- O `DietPreview` ganha um espaço opcional de ações por refeição (`mealActions`). Só o `DietView` passa; landing, link compartilhado e PDF ficam como estão. Fica `print:hidden`.
- No Visualizar, o menu é **o mesmo do Editar** (renomear, horário, sugerir receita, receitas salvas, remover), decidido em 19/10/2026: o componente do menu sai do `MealCard` e é usado nos dois modos.
- **Layout no celular**: hoje é nome à esquerda e "09:00 · 360 kcal" à direita. Com o ⋮, no celular o horário e as kcal descem pra uma linha embaixo do nome (como no card do Editar) e o ⋮ fica à direita. A partir de `sm`, tudo na mesma linha: nome · horário · kcal · ⋮. Conferir em 360 px com a fonte em 130%.

## Implementação
- **Banco**: `src/shared/db/schema/recipe-schema.ts`, tabela `saved_recipe`: `id`, `user_id` (cascade), `meal_id` (nulo se a refeição sumir), `meal_name`, `title`, `summary`, `minutes`, `extras` (jsonb), `steps` (jsonb), `tip`, `ingredients` (jsonb: nome, quantidade, unidade, macros por item), `created_at`. Export no `schema/index.ts`, `bun run db:generate`, migration no Neon antes do merge.
- **Domínio `meal-recipe`**:
  - `services/saved-recipe-service.ts` (server-only): listar, contar por refeição, salvar (com limite), excluir, recriar (desfazer).
  - `actions`: `saveRecipeAction`, `deleteRecipeAction`, `restoreRecipeAction`, todas com `getCurrentUser()` + `isBetaUser`. Salvar recebe a receita + `mealId` e monta a foto dos ingredientes **no servidor**, a partir da dieta (não confia no client).
  - `utils` (puras, TDD): `recipeSnapshot(items)`, `mealChangedSince(snapshot, items)`, `savedRecipeText` (copiar).
  - `RecipeView` aceita ingredientes da foto salva (nome, quantidade, unidade) além dos da dieta.
  - Componentes: `SavedRecipes` (página), `SavedRecipeSheet`; botão "Salvar" no `MealRecipeSheet`.
- **Rotas/menus**: `src/app/(app)/receitas/page.tsx` (Suspense + `notFound()` sem beta); `UserMenu` recebe `beta` de `CurrentUserMenu` em `src/app/(app)/layout.tsx`; contagem por refeição vem pro `DietView` pela página da Dieta.
- **Dieta**: `DietPreview` com `mealActions?`; `DietView` monta o menu do Visualizar; `MealCard` ganha "Receitas salvas (N)".
- **Docs**: `CLAUDE.md`, `docs/ideias-pro.md` (#2), Política de privacidade quando abrir pra mais gente (receitas ficam guardadas na conta).

## Verificação
- `bun run test` (puras), `lint`, `typecheck`; migration local + `db:migrate` no Neon antes do merge.
- Navegador 390 px e 360 px com fonte 130%: Visualizar com ⋮ → gerar → salvar → "Minhas receitas" → filtro → abrir → copiar → excluir/desfazer; refeição alterada mostra o aviso; sem scroll lateral.
