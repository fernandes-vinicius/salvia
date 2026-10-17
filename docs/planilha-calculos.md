# Cálculos da planilha `Dieta.xlsx`

Referência das regras que o app substitui.

## Gasto calórico diário (GCD)

Entradas: peso (kg), altura (cm), idade (anos), FA (fator de atividade).

```
GCD = FA × (66,47 + 13,75×peso + 5×altura − 6,8×idade)   // Harris-Benedict, masculino
```

Exemplo: 70 kg, 170 cm, 30 anos, FA 1,3 → 2177,46 kcal.
Feminino (não existia na planilha): `655,1 + 9,563×peso + 1,85×altura − 4,676×idade`.

## Refeição

Cada item: quantidade, nome, gramas de Ptn animal, Ptn vegetal, Carb, Gordura.

```
g_macro(refeição) = Σ g_macro(itens)
kcal_ptnA = g × 4 · kcal_ptnV = g × 4 · kcal_carb = g × 4 · kcal_fat = g × 9
kcal(refeição) = Σ kcal dos 4 macros
```

## Totais do dia

```
g_macro_dia = Σ g_macro(refeições)
kcal_total  = Σ kcal_macro
%_macro     = kcal_macro × 100 / kcal_total
g/kg_macro  = g_macro_dia / peso
saldo       = kcal_total − GCD          // negativo = déficit (planilha chamava de "Excedente")
```

## Metas g/kg

```
alvo_g    = meta_g/kg × peso      // planilha: Ptn animal 2,2 · Carb 2,0
diferença = g_macro_dia − alvo_g
```

## Plano de referência (planilha)

| Refeição | Itens | kcal |
|---|---|---|
| 1 — 9h | 4 ovos, 200g mamão, 15g chia/linhaça | 374 |
| 2 — 12h | 100g frango, 10ml azeite, 100g arroz, salada + legumes | 374 |
| 3 — 15h | 100g frango desfiado, 2 fatias pão integral (ou 100g cuscuz) | 303 |
| 4 — 18h | 100g frango, 100g arroz, salada + legumes | 284 |
| 5 — 21h | 30g whey, leite integral, 30g aveia | 371 |
| Suplementação | 7g creatina, 1 multivitamínico | 0 |

Total 1706 kcal · Ptn A 154g · Ptn V 13g · Carb 138g · Gordura 54g. Notas: água 3,5 L/dia; cardio 30–45 min, 4×/semana.

## Pontos a melhorar no app

- Macros eram digitados por porção; o app deve calcular a partir de um cadastro de alimentos (macros por 100 g/ml/unidade × quantidade).
- Substituições ("ou cuscuz") não tinham macros.
- "20g leite integral" com 7/10/7 g parece ser ~200 ml (provável erro de digitação).
- g/kg de proteína considerava só a animal.
