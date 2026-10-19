# Plano: infra barata + planos (Grátis e Sálvia Pro)

> Planejado em 18/10/2026. Ainda não implementado.

## Contexto

O Sálvia vai continuar grátis em tudo o que já existe; a receita virá do **Sálvia Pro** (~R$ 9,90/mês), que reúne os recursos de IA do roadmap. Dois bloqueios antes de cobrar:

1. **Vercel Hobby proíbe uso comercial** (cobrança ou anúncios). Vercel Pro custa ~R$ 110/mês, caro pro começo.
2. Comparando os outros projetos: o **Acesso Amador** (React Router + Cloudflare Workers/D1) é o mais barato, mas o Next 16 com `cacheComponents` tem bugs abertos no adaptador OpenNext da Cloudflare (HTTP 500/Error 1101, "Connection closed"); migrar de framework custaria semanas pra economizar R$ 0–10/mês. O **Vitrine** (Docker + Node + Stripe) mostra o caminho que suporta o Next 16 inteiro.

**Decisões já tomadas com você:** Next em **VPS + Coolify**; cobrança pela **Stripe**; nome **Sálvia Pro**; **AdSense fica pra depois** (pouco tráfego, exige domínio próprio + banner de cookies, piora o Lighthouse). A IA em si é a fase seguinte, fora deste plano.

## Atualização 19/10/2026: começar sem domínio

**Decisão:** nada de domínio pago antes da primeira venda (o erro do Vitrine foi comprar cedo). Fica assim:

| Fase | Onde roda | Endereço | Custo |
|---|---|---|---|
| **0. Validar (agora, tudo grátis)** | Vercel Hobby + Neon free (como hoje) | `salvia-dieta.vercel.app` | **R$ 0** |
| **1. Primeira venda** | VPS SP + Coolify, Cloudflare free na frente (DNS, SSL, cache, analytics) | domínio `.com.br` comprado só aqui | ~R$ 35–50/mês |

**Por que não "só Cloudflare free" sem domínio:**
- O proxy/DNS/SSL grátis da Cloudflare só funciona com um domínio seu. Sem domínio, o único endereço grátis é `*.workers.dev`, e aí o app teria que **rodar** nos Workers.
- Workers free: 100 mil requisições/dia, mas **10 ms de CPU por requisição**. Uma página do Next renderizada no servidor passa disso fácil (erro 1102). O plano pago custa US$ 5 (~R$ 28/mês).
- O adaptador OpenNext ainda tem bugs abertos com Next 16 + `cacheComponents` (ver Contexto). Migrar pra React Router (como o Acesso Amador) custaria semanas.
- A Vercel Hobby já dá o endereço grátis com HTTPS. A proibição de uso comercial só vale quando começar a cobrar (pagamento ou anúncio). Até lá, ficar onde está é o mais barato e não dá trabalho nenhum.

**Gatilho pra Fase 1:** o primeiro recurso Pro estar pronto pra vender. Aí entra o domínio (R$ 40/ano, ~R$ 3,35/mês, menos que meia assinatura) + VPS. A troca de endereço custa um login novo por pessoa e o redirecionamento 301 (passo 4 abaixo); quanto menos usuários na hora, mais barato.

**Sequência de lançamento do Pro (IA paga), gastando só quando entrar dinheiro:**
1. **Primeiro recurso de IA, ainda na Vercel grátis**: importar dieta do nutri ([`ideias-pro.md`](ideias-pro.md) #1). Sai como "Pro em teste", grátis por um tempo e com limite por pessoa. Sem cobrança, então a Hobby continua valendo. Custo: só a IA, centavos por uso, com teto mensal na conta da Anthropic.
2. **Medir**: quantos usam, quantos importam mais de uma vez, o que dizem no "Enviar sugestão". Botão "Assinar Pro (em breve)" com o preço, contando cliques: é o teste de quem pagaria.
3. **Cobrança pronta em modo teste**: Stripe com cartões de teste (`@better-auth/stripe`, domínio `billing`, `/planos`, `/assinatura`, termos/privacidade), escondida por flag.
4. **Dia do lançamento** (só se os passos 1–2 mostrarem interesse): compra o domínio, sobe a VPS (Fase 1 abaixo), liga a flag e a Stripe em modo real. A partir daqui custa ~R$ 40–50/mês, pagos com 5–6 assinantes.

**Usar a Cloudflare free desde já, sem domínio:** R2 (10 GB grátis) pro backup semanal do `pg_dump` e, se precisar, Turnstile (anti-robô grátis) no feedback ou no login.

## Custos mensais estimados

| Item | Custo |
|---|---|
| VPS em São Paulo (2 vCPU / 4 GB; ex.: Hostinger KVM, Magalu Cloud, Lightsail sa-east-1) | ~R$ 30–45 |
| Domínio `.com.br` (registro.br, R$ 40/ano) | ~R$ 3,35 |
| Neon Postgres (free, já em `sa-east-1`), Cloudflare (DNS/SSL/CDN/Analytics), Coolify, GitHub | R$ 0 |
| Stripe | sem mensalidade, só taxa por venda (confirmar em stripe.com/br/pricing) |
| **Total** | **~R$ 35–50/mês** → empata com **~5 assinantes** |

- O VPS **tem que ficar em São Paulo**: hoje o app roda em `gru1` ao lado do Neon `sa-east-1`; longe dele, cada query ganha ~120 ms.
- Opção R$ 0: Oracle Cloud Always Free (ARM, região São Paulo), porém com capacidade difícil de conseguir e risco de suspensão da conta. Só como experimento.
- **Domínio próprio (único gasto além do VPS)**: com VPS não existe um `*.vercel.app` grátis equivalente; subdomínio grátis (duckdns etc.) passa pouca confiança na tela do Google e no checkout, atrapalha SEO e impede AdSense no futuro.

## Fase 1: migrar pra VPS (dá pra fazer ainda no grátis, antes de cobrar)

1. **App pronto pra self-host**
   - `next.config.ts`: `output: "standalone"`.
   - `Dockerfile` multi-stage (build com bun, runtime `node:24-slim`, roda `server.js` do standalone) + `.dockerignore`. Base: o `Dockerfile` do Vitrine (`~/dev/vitrine-alto-oeste/Dockerfile`).
   - `src/app/serwist/[path]/route.ts`: versão do SW passa a usar o commit do Coolify (`SOURCE_COMMIT`), mantendo `VERCEL_GIT_COMMIT_SHA` como fallback.
   - `src/app/layout.tsx`: trocar `@vercel/analytics` por **Cloudflare Web Analytics** (sem cookies, grátis). `after()` em `src/app/(app)/layout.tsx` e o pool `pg` em `src/shared/db/index.ts` funcionam iguais num servidor Node de instância única.
2. **Servidor**: VPS SP + Coolify; app ligado ao GitHub (`main` = deploy automático), variáveis de ambiente (`DATABASE_URL` do Neon, `BETTER_AUTH_*`, `GOOGLE_*`, `NEXT_PUBLIC_SITE_URL`), health check. Cloudflare na frente (proxy laranja, SSL Full strict).
3. **Domínio e login**: registrar o `.com.br`; Google Auth Platform: domínio autorizado + redirect `https://<dominio>/api/auth/callback/google`; `BETTER_AUTH_URL`/`NEXT_PUBLIC_SITE_URL` novos. Os cookies são por domínio, então **cada pessoa entra de novo uma vez** (avisar).
4. **Virada sem perder SEO**: o projeto da Vercel passa a só redirecionar (301) `salvia-dieta.vercel.app/*` → domínio novo (`vercel.json` com `redirects`); nova propriedade no Search Console + sitemap; atualizar `public/llms.txt`.
5. **Rotina**: migrations continuam manuais antes do merge (`bun --env-file=.env.neon run db:migrate`), como hoje. Backup: o Neon tem restauração por horário; somar um `pg_dump` semanal (tarefa agendada no Coolify → R2/Backblaze grátis). Uptime: monitor grátis (UptimeRobot/Better Stack) com alerta.
6. **Docs/legal**: `CLAUDE.md` (deploy, analytics), Política de privacidade (Vercel → servidor próprio + Cloudflare), `SITE_URL` em `src/shared/lib/app-config.ts`, `src/app/robots.ts`.

## Fase 2: planos e cobrança (estrutura pronta; liga junto com o 1º recurso de IA)

**Planos**
- **Grátis**: tudo o que existe hoje (TMB, Meta, Dieta, opções, PDF, lista de compras, medidas, ajuste pelo peso, calculadoras, dietas prontas).
- **Sálvia Pro**: recursos de IA (receitas da refeição, insights de evolução/dicas, montar refeição com IA), lançados aos poucos.
- Preço: **R$ 9,90/mês** ou **R$ 79,90/ano** (R$ 6,66/mês, −33%; uma taxa por ano e menos cancelamento). Cupom de lançamento ("FUNDADOR") pelo painel da Stripe, sem lógica no app (como no Vitrine).

**Implementação**
- **`@better-auth/stripe`** (plugin oficial do Better Auth): cria a tabela de assinaturas, o cliente na Stripe, o checkout, o portal e o webhook (`/api/auth/stripe/webhook`). Seguir a regra do `CLAUDE.md`: atualizar `auth-cli-config.ts` e rodar `bun run auth:generate && bun run db:generate`.
- **Domínio `billing`** (`src/domains/billing`): `getPlan(userId)`/`requirePro()` server-only (mesmo padrão do DAL `getCurrentUser()` em `~/domains/auth/services/session-service`) e um `ProGate` pra telas/ações Pro. A checagem real é sempre no servidor, nunca só na UI.
- **Telas**: página pública `/planos` (Grátis × Sálvia Pro, layout `(marketing)`, FAQ com `FaqList`); `/assinatura` no menu do perfil (status, próximo pagamento, "Gerenciar" → portal da Stripe), como Medidas e Meus alimentos.
- **Legal**: Termos com cobrança, renovação, cancelamento a qualquer hora e arrependimento em 7 dias (CDC, compra online); Privacidade com a Stripe como operadora de pagamento; atualizar `LEGAL_UPDATED_AT`.
- **Métricas**: etapa "pagou" no `bun run metrics` (hoje: cadastro → TMB → Meta → dieta → pesou → voltou).
- Sem vender antes de ter: `/planos` e o botão de assinar ficam escondidos por uma flag de ambiente até o primeiro recurso de IA estar pronto.

## Fora deste plano
- Recursos de IA (próxima etapa, roadmap "IA no app").
- AdSense (reavaliar com tráfego, só nas páginas públicas).
- Migração pra React Router/Workers (só se o VPS virar dor de cabeça).

## Verificação
- **Fase 1**: `docker build` + `docker run` local servindo o standalone (`/`, `/dieta` logado, `/calculadoras/agua`, `/serwist/sw.js`, `/opengraph-image`); depois em produção: login com Google no domínio novo, Lighthouse da landing (meta: a11y/boas práticas/SEO 100), axe nas páginas logadas, `curl -I` do domínio antigo devolvendo 301, analytics da Cloudflare recebendo visitas, teste de restauração de um `pg_dump`.
- **Fase 2**: Stripe em modo teste (cartões de teste) → assinar, webhook ativa o Pro, `requirePro()` libera/recusa no servidor, portal cancela, `invoice.payment_failed` segue a regra; `bun run lint`, `bun run typecheck`, `bun run test` (testes das regras puras de plano).
