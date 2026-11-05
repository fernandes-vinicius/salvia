# Suplementação na dieta

Nutricionistas costumam incluir suplementação no plano (na planilha original era a linha "Suplementação: 7g creatina, 1 multivitamínico"). No Sálvia ela vira uma seção própria no fim da Dieta.

**Princípio:** registro, não prescrição. O app anota o que a pessoa toma ou o que o nutricionista passou; não sugere suplemento nem dose. Suplementos não entram nas calorias. Whey, albumina, hipercalórico e afins continuam como alimento dentro da refeição (o painel avisa).

Protótipo: https://claude.ai/artifact/2jkVfNbvRqMUEZgeNHJo1T

## Fases

1. [x] **Dieta + Visualizar/PDF/link** (05/11/2026): tabela `diet_supplement`, card no fim da Dieta, painel de adicionar/editar, remover com desfazer, reordenar, bloco no `DietPreview`, link compartilhado, resetar dieta, baixar meus dados.
2. [x] **Início** (05/11/2026): no check-in, "Suplementos de hoje" com chips de marcar (tabela `supplement_checkin`, um por suplemento por dia; não conta pro dia completo). Os de "dias de treino" aparecem todo dia como "se treinar" (o perfil guarda treinos por semana, não os dias; se fizer falta, escolher os dias no perfil). A próxima refeição lembra "+ Creatina 5 g" quando o suplemento está ligado a ela.
3. [ ] **Importar dieta:** `extractedDietSchema` ganha `supplements`; revisão mostra o grupo "Suplementação" antes de salvar.
4. [ ] **Lista de compras:** seção "Suplementos" com dose × dias do período, sem marcar e com preço só se a pessoa informar.
5. [ ] Lembrete por notificação (junto do `plano-notificacoes.md`).

Fora: IA sugerindo suplemento ou dose.
