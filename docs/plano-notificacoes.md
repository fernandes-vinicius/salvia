# Plano: lembretes por notificação (Web Push do PWA)

> Planejado em 20/10/2026. Ainda não implementado.

## Contexto
O app resolve a montagem da dieta, mas precisa de motivo pra pessoa voltar todo dia (check-in, pesagem). O roadmap pede "lembrete de pesagem e de check-in (push do PWA)". O Sálvia já é PWA, com service worker Serwist (`src/app/sw.ts`), então dá pra mandar notificação sem app de loja.

## Custo: grátis
- **Web Push é padrão do navegador:** os serviços de entrega (Google/FCM no Android e Chrome, Apple no iPhone, Mozilla no Firefox) não cobram. A gente assina as mensagens com chaves VAPID geradas uma vez (biblioteca `web-push`, grátis).
- **Agendamento: Vercel Cron**, incluído em todos os planos. **No Hobby**: no máximo 1 execução por dia e precisão de ±59 min (`0 23 * * *` em UTC roda entre 20h e 21h de Brasília). Horário escolhido por pessoa ou um lembrete por refeição precisariam de cron a cada minuto (Vercel Pro ou o VPS planejado).
- **Banco:** uma tabela pequena no Neon (já usado).

**Conclusão:** v1 com **um disparo por dia no começo da noite**, grátis. Horário personalizado fica pro VPS (cron de verdade, também grátis).

## Limitações a avisar na tela
- **iPhone:** só recebe notificação com o app **instalado na tela de início** (iOS 16.4+). Pelo Safari aberto não funciona. A tela de ativar mostra as instruções de instalar (as mesmas do `InstallPrompt`).
- **Android/computador:** funciona pelo navegador, instalado ou não.
- **Permissão:** sempre pedida por um toque da pessoa ("Ativar lembretes"), nunca ao abrir o app (o navegador bloqueia e irrita).

## Lembretes da v1 (no máximo 1 notificação por dia por pessoa)
1. **Check-in do dia (20h–21h):** se ainda faltam refeições pra marcar hoje. Ex.: "Como foi a dieta hoje? Marque suas refeições e mantenha a sequência de 6 dias." Abre o Início.
2. **Pesagem semanal:** se a última pesagem tem 7 dias ou mais. Ex.: "Dia de se pesar: com o peso da semana, o app confere se a meta está no ritmo." Abre `/medidas`. Tem prioridade sobre o check-in no mesmo dia.
3. **Medidas do mês (30 dias sem medir):** reaproveita a regra do Início. No máximo 1 vez por mês.
4. **(Opcional) Ajuste pelo peso disponível:** quando `analyzeCalibration` tiver sugestão. "O app tem uma sugestão de ajuste da sua meta." Abre `/meta`.

**Texto:** neutro na tela bloqueada (sem peso, kcal ou nada pessoal) e em linguagem simples, no tom do app.

## Implementação
- **Chaves e env:**
  - `bunx web-push generate-vapid-keys`;
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:` do `SUPPORT_EMAIL`), `CRON_SECRET`;
  - entram em `env.ts`/`.env.example` como opcionais: sem elas, o recurso some.
- **Banco** (`src/shared/db/schema/push-schema.ts` + migration):
  - `push_subscription`: `id`, `user_id` (cascade), `endpoint` (único), `p256dh`, `auth`, `user_agent`, `created_at`, `last_sent_at`. Uma por aparelho.
  - `settings`: `reminder_checkin`, `reminder_weighin`, `reminder_measurements` (boolean, padrão `true`; só valem com aparelho inscrito).
  - `notification_log`: `user_id`, `kind`, `day`, com chave única. Garante 1 por dia e evita repetir a mensal.
- **Domínio `notifications`:**
  - `utils/reminders.ts` (puro, TDD): `pickReminder({ today, checkins, mealsWithFoods, lastWeighIn, lastMeasurement, calibration, prefs, sentLog })` → `{ kind, title, body, url } | null`, com a prioridade acima e o máximo de 1 por dia. Reaproveita `checkin/utils/checkin.ts`, `home.ts` (lembrete de 30 dias) e `analyzeCalibration`.
  - `services/push-service.ts` (server-only): salva/remove a inscrição; `sendPush(subscription, payload)` com `web-push`; inscrição respondendo 404/410 (aparelho desinstalado) é apagada.
  - `actions`: `subscribePushAction`, `unsubscribePushAction`, `sendTestPushAction` ("Enviar teste"), todas com `getCurrentUser()`.
  - `components/reminders-settings.tsx`:
    - seção "Lembretes" em Configurações: botão "Ativar lembretes neste aparelho" → `Notification.requestPermission()` → `pushManager.subscribe({ applicationServerKey })` → action;
    - interruptores por lembrete (`SwitchCard`) e "Enviar teste";
    - estados: sem suporte, iPhone sem instalar (instruções), permissão negada (como liberar nas configurações do navegador), ativo.
- **Service worker (`src/app/sw.ts`):** eventos `push` (`showNotification` com título, texto, ícone `pwa-192x192.png`, badge e `data.url`) e `notificationclick` (foca a aba aberta ou abre `data.url`).
  - O SW só existe no build de produção: testar com `bun run build && PORT=3001 bun run start`.
- **Disparo:**
  - rota `src/app/api/cron/lembretes/route.ts` (GET, confere `Authorization: Bearer ${CRON_SECRET}`, que a Vercel manda);
  - cron em `vercel.json`/`vercel.ts`: `0 23 * * *`;
  - a rota busca quem tem inscrição, calcula `pickReminder` em lotes, envia, grava `notification_log` e `last_sent_at`;
  - o proxy deixa `/api/cron` passar.
- **Analytics:** `lembretes_ativados`, `lembretes_desativados`, `notificacao_aberta` (pelo `?origem=lembrete` no link da notificação).
- **Política de privacidade:** guardamos o endereço de entrega do aparelho (endpoint) pra mandar lembretes, entregues pelos serviços de push do Google/Apple/Mozilla, e dá pra desativar a qualquer momento. Atualizar `LEGAL_UPDATED_AT`.
- **Docs:** `CLAUDE.md` (seção de lembretes) e `roadmap.md`.

## Verificação
- **TDD de `pickReminder`:** prioridade, 1 por dia, mensal sem repetir, sem inscrição = nada, preferências desligadas.
- `lint`, `typecheck`, `test`.
- **Build local na 3001 com usuário de teste:** ativar no Chrome desktop → "Enviar teste" chega → clique abre o app → chamar a rota do cron com o `CRON_SECRET` e ver o lembrete certo → desativar remove a inscrição.
- **Celular:** Android (Chrome) e iPhone com o app instalado, depois do deploy (push não funciona em `localhost` no celular).
- **Neon:** migration aplicada antes do merge.

## Depois (com o VPS ou Vercel Pro)
- Horário escolhido pela pessoa e lembrete por refeição ("Hora do almoço: 150 g de frango…").
- Resumo semanal no domingo (junto com os insights do roadmap).
