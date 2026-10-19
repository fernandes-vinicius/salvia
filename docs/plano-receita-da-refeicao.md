> Planejado e implementado em 19/10/2026 (beta fechado).

# Receita da refeição com IA (beta fechado)

## Contexto
Enjoar da mesma refeição é comum: "com exatamente isso aqui, dá pra fazer algo diferente?". O recurso pega **uma refeição da dieta** e a IA sugere **uma receita prática usando só os alimentos e as quantidades dela** (ex.: whey + banana + leite + aveia → shake proteico). Liberados só extras que não mudam os macros: temperos, ervas, folhas, legumes/vegetais, água, gelo, café/chá sem açúcar, adoçante zero, limão. Se não curtir, "Outra receita" gera outra (sem repetir as anteriores) até achar uma boa. Segue o beta fechado da importação (`BETA_EMAILS`, Gemini grátis) e é o 2º recurso do futuro Sálvia Pro (`docs/ideias-pro.md`).

## Como fica pra quem usa
1. Card da refeição → menu ⋮ → **"Sugerir receita (beta)"** (só beta e só se a refeição tiver alimentos).
2. Abre um `BottomSheetContent` (padrão dos painéis) com carregando "Pensando numa receita…".
3. Receita fácil de ler, mobile first:
   - **Título** + linha curta do que é + tempo (ex.: "5 min").
   - **"Mesmos macros da refeição"**: `MacroLine` + kcal calculados da refeição (não da IA).
   - **Ingredientes da refeição**: vêm da própria dieta (nome, quantidade, medida caseira via `householdHint`), nunca do texto da IA → os macros não têm como mudar na lista.
   - **"Pode juntar (não muda os macros)"**: extras da IA (ex.: canela, gelo, sal, cebola).
   - **Modo de preparo**: até 6 passos curtos, numerados. Dica opcional de 1 linha.
4. Botões: **"Outra receita"** (manda os títulos já sugeridos pra não repetir) e "Copiar" (texto da receita, como o compartilhar da lista de compras).
Nada é salvo no banco nesta versão.

## Prompt (o critério)
`instructions` em pt-BR, com a refeição em lista (`nome — quantidade unidade`):
- Use **todos** os alimentos, **nas quantidades exatas**; não troque nem tire nenhum. Se algum não combinar, sirva "à parte" no último passo.
- **Proibido** adicionar qualquer coisa com calorias relevantes: óleo, azeite, manteiga, margarina, açúcar, mel, melado, queijo, requeijão, creme de leite, leite condensado, farinhas, pães, molhos prontos, chocolate, granola, castanhas, frutas a mais, leite a mais. Gordura pra cozinhar só se já estiver na refeição; senão, frigideira antiaderente, forno, air fryer, cozido, vapor.
- **Liberado** à vontade: sal, temperos secos, ervas, alho, cebola, pimenta, limão, vinagre, folhas, legumes/vegetais sem amido (abobrinha, tomate, cenoura, brócolis…), água, gelo, café/chá sem açúcar, adoçante zero, canela, essência de baunilha.
- Prática: até ~20 min, utensílios comuns, linguagem simples, sem jargão; não falar de dieta nem saúde.
- Não repetir os títulos de `avoid`.

## Implementação
Domínio novo `src/domains/meal-recipe/` (mesma forma do `diet-import`):
- `schemas/meal-recipe-schema.ts`: saída da IA — `title`, `summary`, `minutes`, `extras: {name, amount}[]` (máx. 8), `steps: string[]` (1–6), `tip: string|null`. Entrada da action: `{ mealId: uuid, avoid: string[] (máx. 10) }`.
- `utils/meal-recipe.ts` (puras, **TDD primeiro**):
  - `mealPrompt(items)`: monta a lista da refeição (quantidade com `formatNumber` + `UNIT_LABELS`).
  - `safeExtras(extras, mealFoodNames)`: rede de segurança — tira extras calóricos (lista de palavras: óleo, azeite, manteiga, açúcar, mel, queijo, creme, farinha, pão, chocolate, granola, castanha, amendoim, leite…) a não ser que já estejam na refeição.
  - `recipeText(recipe, items)`: texto pra "Copiar".
- `services/meal-recipe-service.ts` (server-only): `suggestRecipe(items, avoid)` com `generateText` + `Output.object`, mesmo provedor/erros de `src/domains/diet-import/services/diet-reader-service.ts` — **extrair** `createGoogleGenerativeAI`/modelo/tratamento de 429 pra `src/shared/lib/ai.ts` (server-only: `getAiModel()` → modelo ou erro "não configurado"; `aiErrorMessage(error)`) e reaproveitar nos dois. `temperature` mais alta pra variar.
- `actions/meal-recipe-actions.ts`: `suggestRecipeAction(input)` → `getCurrentUser()` + `isBetaUser` (`~/domains/auth/services/beta-service`), valida, lê a refeição do usuário via `getDiet(user.id, { createIfEmpty: false })` (`~/domains/diet/services/diet-service`) e pega a `mealId` (só itens principais, sem as opções "ou"), chama o serviço, aplica `safeExtras`, devolve `{ recipe, items }`.
- `components/meal-recipe-sheet.tsx` (client): estados carregando / receita / erro; "Outra receita" acumula `avoid`; copiar com `navigator.clipboard` + toast (sonner). Story com a receita mockada (`*.stories.tsx`, título "Dieta/Receita da refeição"), sem chamar a action.
- `src/domains/diet/components/meal-card.tsx`: prop opcional `onSuggestRecipe?`; item no menu ⋮ com ícone `Sparkles` quando definida e a refeição tiver itens.
- `src/domains/diet/components/diet-view.tsx`: estado `recipeMealId`, passa `onSuggestRecipe` só se `beta` (prop que já existe), renderiza o sheet.

Reaproveita: `isBetaUser`, `getDiet`, `macrosFor`/`sumMacros`/`kcalFor`/`MacroLine`/`UNIT_LABELS`/`householdHint` (`~/domains/food`), `BottomSheetContent`, `formatNumber`.

## Docs
`CLAUDE.md` (seção do recurso + regra do prompt), `docs/ideias-pro.md` (nova ideia #2 "Receita da refeição", status beta), `docs/roadmap.md` se listar o item de receitas.

## Verificação
- `bun run test` (puras: `mealPrompt`, `safeExtras`, `recipeText`), `bun run lint`, `bun run typecheck`.
- Script no scratchpad chamando o serviço real com 3 refeições (shake: whey+banana+leite+aveia; almoço: arroz+feijão+frango+azeite; café: pão+ovo) e conferindo: todos os alimentos aparecem nos passos, nenhum extra calórico, "Outra receita" não repete título.
- Navegador headless 390 px com usuário de teste temporário (como na importação): menu ⋮ → receita → "Outra receita" → copiar; screenshot; apagar usuário depois.
