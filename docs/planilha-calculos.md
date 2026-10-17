# Cálculos da planilha `Dieta.xlsx`

Referência das regras que o app substitui.

## Gasto calórico diário (GCD)

Entradas: peso (kg), altura (cm), idade (anos), FA (fator de atividade).

```
GCD = FA × (66,47 + 13,75×peso + 5×altura − 6,8×idade)   // Harris-Benedict, masculino
```

Exemplo: 70 kg, 170 cm, 30 anos, FA 1,3 → 2177,46 kcal.
Feminino (não existia na planilha): `655,1 + 9,563×peso + 1,85×altura − 4,676×idade`.

### No app (aba TMB) — método fatorial

A planilha usava GCD = TMB × FA (fator único 1,2–1,9). Na prática isso superestimou o gasto de quem treina mas passa o dia sentado (1,55 pela tabela vs 1,375 que funcionou). O app usa o método fatorial (referência: calculadora do hipertrofia.org):

```
TMB = 10 × peso + 6,25 × altura − 5 × idade + 5        // Mifflin-St Jeor (feminino: −161 no lugar de +5)
GCD = (TMB × NEAT + musculação + cardio) × 1,10        // +10% digestão (efeito térmico)
NEAT  = 1,10 · 1,15 · 1,20 · 1,25 · 1,30               // dia a dia SEM treino
treino (kcal/dia) = (MET − 1) × peso × horas × dias/semana ÷ 7
MET musculação = 3,5 · 4,5 · 5,5 · 6,5 · 7,5           // muito leve → muito pesado
MET cardio     = 5 · 6,25 · 7,5 · 8,75 · 10
```

- MET líquido (MET − 1) porque o repouso daquele tempo já está na TMB.
- TMB: Mifflin-St Jeor por padrão (mesma da calculadora de referência); Harris-Benedict continua disponível em Configurações. A Harris-Benedict da planilha que dava ~57 kcal a mais e inflava o carboidrato (2,3 vs ~2,0 g/kg no caso real).
- Exemplo real (out/2026): 70 kg, 170 cm, 30 anos, NEAT 1,10, musculação 4×/sem 60 min moderada, cardio 4×/sem 60 min muito leve → (1.617,5 × 1,1 + 180 + 160) × 1,1 ≈ 2.331 kcal; meta −500 = 1.831; com proteína 2,2 e gordura 1,0 g/kg sobram 146 g de carboidrato (2,1 g/kg).
- Domínio `src/domains/profile` (tabela `profile`). Fórmulas em `utils/energy.ts`, testadas. O servidor só aceita os valores de NEAT/MET das opções.

### No app (aba Meta)

- Domínio `src/domains/goal` (tabela `goal`). Meta kcal = GCD + ajuste do objetivo (Perder: −250/−500/−750 ou personalizado; Manter: 0; Ganhar: +250/+500 ou personalizado).
- Proteína **animal** e gordura em g/kg × peso. Carboidrato automático = (meta − proteína×4 − gordura×9) ÷ 4, ou fixado em g/kg pelo usuário (como na planilha); no manual, o app mostra quanto a soma dos macros fica acima/abaixo da meta. Avisos: meta abaixo da TMB; no automático, carboidrato negativo ou < 1 g/kg.
- O resumo da planilha (G · % · Kcal · g/kg por macro, total, excedente) e a diferença pra meta vão ficar na aba Dieta.

### No app (aba Dieta)

- Alimentos: Tabela TACO (596 itens, por 100 g) + alimentos cadastrados pelo usuário (por 100 g/ml ou por unidade). Proteína de cada alimento é animal ou vegetal (TACO: pela categoria; em pratos mistos, por palavras-chave no nome).
- Item = macros do alimento × quantidade ÷ 100 (ou × unidades). kcal = P×4 + C×4 + G×9, como na planilha.
- Resumo do dia (legenda "OFF"): Proteína (A), Proteína (V), Carboidrato, Gordura × g · % · kcal · g/kg; total planejado; excedente/déficit = planejado − GCD.
- Planejado × meta ("Protein e Carb / Kg"): calorias, proteína animal, carboidrato e gordura contra a aba Meta (±3% = "na meta").

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
