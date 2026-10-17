# Roadmap / ideias futuras

## Calibração da meta pelo peso real

**Status:** mitigado em out/2026 trocando o FA único pelo método fatorial (NEAT + treinos por MET + digestão) na aba TMB. A calibração pelo peso continua útil como ajuste fino.

**Problema original:** o fator de atividade (FA) e a fórmula de Harris-Benedict são médias populacionais e costumam superestimar o gasto de quem treina mas passa o resto do dia sentado. Caso real (out/2026): pela tabela, musculação 3–5×/semana = 1,55, mas o que funcionou na prática foi 1,375 (~300 kcal/dia de diferença).

**Ideia:** com histórico de peso, o app compara a variação real com a esperada pela meta e sugere um ajuste.

- Registrar peso (ex.: semanal) — novo domínio/tabela de histórico; a aba TMB passa a usar o peso mais recente.
- Após 2–3 semanas, comparar a perda/ganho real com o ritmo do objetivo (`weeklyChangeKg` em `domains/goal/utils/goal.ts`).
- Diferença ≈ excesso/falta de kcal: `Δkg × 7700 / dias`. Sugerir em passos pequenos (ex.: ±100–150 kcal), nunca automático.
- Linguagem de leigo: "Seu peso caiu menos que o esperado. Que tal reduzir 150 kcal por dia?" com botão "Aplicar" (ajusta o déficit personalizado na aba Meta).
- Usar média móvel do peso (oscilação diária de água/sódio) e exigir dados mínimos antes de sugerir.
- Considerar mostrar o "gasto real estimado" ao lado do GCD da fórmula.

## Aproximar do atendimento profissional

Revisão de out/2026: o cálculo atual (Mifflin-St Jeor + método fatorial + MET líquido + 10% digestão + macros em g/kg) está no padrão moderno, mas é ponto de partida. Melhorias que um nutricionista faria:

### % de gordura opcional (TMB por massa magra)

- Campo opcional "Sabe seu % de gordura?" na aba TMB (como no hipertrofia.org), em linguagem simples, com dica de onde obter (bioimpedância, dobras, DEXA).
- Se informado: massa magra = peso × (1 − %gordura) e TMB por **Katch-McArdle** (`370 + 21,6 × massa magra`) ou **Cunningham** (`500 + 22 × massa magra`, mais usada em atletas). Sem o dado, segue Mifflin-St Jeor.
- Mais preciso pra quem treina e tem muita massa magra; também permite calcular proteína por massa magra.

### Ritmo proporcional ao peso

- Hoje o ritmo é fixo em kcal (−250/−500/−750). Padrão atual: **0,5–1% do peso corporal por semana** (ou déficit de 10–25% do GCD).
- Opções em % do peso ("~0,5% do seu peso por semana = 0,35 kg") convertidas em kcal pelo app; manter o personalizado em kcal.
- Avisar quando o déficit fixo ficar desproporcional (ex.: > 25% do GCD).
- Lembrar que a regra 7.700 kcal ≈ 1 kg superestima a perda no longo prazo (adaptação metabólica) — reforça a calibração pelo peso.

### Proteína total como opção

- Hoje a meta de proteína conta só a **animal** (escolha do usuário, igual à planilha). Prática comum: meta de proteína **total** (opcionalmente com peso menor pra vegetal, por qualidade/DIAAS).
- Opção na aba Meta: "Contar só proteína animal" (atual) × "Contar toda a proteína". O resumo da Dieta continua mostrando A e V separadas.

### Proteína pelo peso ajustado com IMC alto

- Com IMC alto, g/kg × peso total infla a proteína. Usar peso ajustado (ou massa magra, se houver % de gordura) a partir de um limiar de IMC, explicando na UI.

### Aviso de carboidrato baixo pro volume de treino

- Diretrizes de nutrição esportiva (ACSM): ~3–5 g/kg pra ~1 h de treino por dia; 5–7 g/kg pra volume alto.
- Com o volume de treino da aba TMB (dias × minutos de musculação + cardio), sugerir uma faixa e mostrar aviso suave quando o carboidrato ficar abaixo ("Pode faltar energia pro treino; se o rendimento cair, aumente o carbo") — sem bloquear, déficit com carbo baixo é comum.

### Transparência

- Página "Como calculamos" com as fórmulas e referências, e nota de que o app não substitui acompanhamento profissional.

## Aba Dieta (próximo)

- Grade de refeições estilo planilha + cadastro de alimentos (macros por 100 g/ml/unidade × quantidade).
- Resumo estilo planilha: Proteína (A), Proteína (V), Carboidrato, Gordura × g · % · kcal · g/kg; Total; Excedente/Déficit vs GCD; diferença pra meta.
