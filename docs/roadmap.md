# Roadmap / ideias futuras

## Calibração da meta pelo peso real

**Problema:** o fator de atividade (FA) e a fórmula de Harris-Benedict são médias populacionais e costumam superestimar o gasto de quem treina mas passa o resto do dia sentado. Caso real (out/2026): pela tabela, musculação 3–5×/semana = 1,55, mas o que funcionou na prática foi 1,375 (~300 kcal/dia de diferença).

**Ideia:** com histórico de peso, o app compara a variação real com a esperada pela meta e sugere um ajuste.

- Registrar peso (ex.: semanal) — novo domínio/tabela de histórico; a aba TMB passa a usar o peso mais recente.
- Após 2–3 semanas, comparar a perda/ganho real com o ritmo do objetivo (`weeklyChangeKg` em `domains/goal/utils/goal.ts`).
- Diferença ≈ excesso/falta de kcal: `Δkg × 7700 / dias`. Sugerir em passos pequenos (ex.: ±100–150 kcal), nunca automático.
- Linguagem de leigo: "Seu peso caiu menos que o esperado. Que tal reduzir 150 kcal por dia?" com botão "Aplicar" (ajusta o déficit personalizado na aba Meta).
- Usar média móvel do peso (oscilação diária de água/sódio) e exigir dados mínimos antes de sugerir.
- Considerar mostrar o "gasto real estimado" ao lado do GCD da fórmula.

## Aba Dieta (próximo)

- Grade de refeições estilo planilha + cadastro de alimentos (macros por 100 g/ml/unidade × quantidade).
- Resumo estilo planilha: Proteína (A), Proteína (V), Carboidrato, Gordura × g · % · kcal · g/kg; Total; Excedente/Déficit vs GCD; diferença pra meta.
