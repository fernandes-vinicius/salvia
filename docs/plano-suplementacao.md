# Suplementação na dieta

Nutricionistas costumam incluir suplementação no plano (na planilha original era a linha "Suplementação: 7g creatina, 1 multivitamínico"). No Sálvia ela vira uma seção própria no fim da Dieta.

**Princípio:** registro, não prescrição. O app anota o que a pessoa toma ou o que o nutricionista passou; não sugere suplemento nem dose. Suplementos não entram nas calorias. Whey, albumina, hipercalórico e afins continuam como alimento dentro da refeição (o painel avisa).

Protótipo: https://claude.ai/artifact/2jkVfNbvRqMUEZgeNHJo1T

## Fases

1. [x] **Dieta + Visualizar/PDF/link** (05/11/2026): tabela `diet_supplement`, card no fim da Dieta, painel de adicionar/editar, remover com desfazer, reordenar, bloco no `DietPreview`, link compartilhado, resetar dieta, baixar meus dados.
2. [ ] **Início:** no check-in, linha "Suplementos de hoje" com chips de marcar (só os do dia; não conta pro "dia completo"). Precisa de tabela de marcação (ex.: `supplement_checkin`) e de saber se hoje é dia de treino — hoje o perfil guarda treinos por semana, não por dia da semana: decidir se "dias de treino" vira escolha de dias. A próxima refeição lembra "+ creatina 5 g" quando o suplemento está ligado a ela.
3. [ ] **Importar dieta:** `extractedDietSchema` ganha `supplements`; revisão mostra o grupo "Suplementação" antes de salvar.
4. [ ] **Lista de compras:** seção "Suplementos" com dose × dias do período, sem marcar e com preço só se a pessoa informar.
5. [ ] Lembrete por notificação (junto do `plano-notificacoes.md`).

Fora: IA sugerindo suplemento ou dose.
