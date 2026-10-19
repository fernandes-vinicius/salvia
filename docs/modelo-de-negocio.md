# Modelo de negócio do Sálvia

Documento vivo. Parte 1 (custos) feita em 19/10/2026; as próximas partes entram aqui conforme forem decididas. Relacionados: [`plano-infra-e-planos.md`](plano-infra-e-planos.md) (infra e planos), [`ideias-pro.md`](ideias-pro.md) (recursos pagos) e a seção Posicionamento do [`roadmap.md`](roadmap.md).

**Premissas:** câmbio US$ 1 ≈ R$ 5,50; preços de IA da tabela oficial da Anthropic (out/2026: Haiku 5.5 US$ 0,10/US$ 0,50 e Sonnet 5.5 US$ 2/US$ 10 por milhão de tokens de entrada/saída); taxas da Stripe e impostos são estimativas **a confirmar** (stripe.com/br/pricing e contador).

## Parte 1 — Contas de padaria (custo mínimo)

### 1. Fase 0 — validar sem cobrar (hoje): **R$ 0/mês**
Vercel Hobby + Neon free + GitHub + Cloudflare (DNS/analytics) + Storybook na Vercel. Domínio `.com.br` opcional (R$ 40/ano ≈ R$ 3,35/mês). Limite: Hobby proíbe uso comercial, então serve só enquanto for grátis.

### 2. Fase 1 — cobrando (custo fixo mínimo)
| Item | R$/mês |
|---|---|
| VPS em São Paulo (Coolify) | 30–45 |
| Domínio `.com.br` | 3,35 |
| Neon (free até alguns milhares de usuários ativos; depois ~US$ 19 ≈ R$ 105) | 0 |
| Cloudflare, GitHub, monitor de uptime, e-mail transacional (Resend free 3 mil/mês) | 0 |
| **Infra** | **~35–50** |
| Formalização (ver §5): MEI (DAS ~R$ 80) **ou** Simples + contador (~R$ 250 + ~6% da receita) | 80 **ou** ~250+ |

Opção extrema: Oracle Cloud Always Free (R$ 0), com risco de suspensão.

### 3. IA por assinante Pro (Haiku 5.5 na maioria, Sonnet 5.5 só onde precisa de precisão)
| Recurso | Uso/mês (pesado) | Tokens por uso (entrada/saída) | Custo/mês |
|---|---|---|---|
| Receita da refeição | 30 | 1,5k / 0,6k (Haiku) | ~R$ 0,08 |
| Montar refeição pelos macros | 30 | 4k / 0,8k (Haiku) | ~R$ 0,13 |
| Insight semanal | 4 | 3k / 0,5k (Haiku) | ~R$ 0,01 |
| "Pergunte" (chat) | 20 msgs | 5k / 0,4k (Haiku) | ~R$ 0,08 |
| Importar dieta (PDF/foto) | 2 | ~7k / 3k (Sonnet, visão) | ~R$ 0,50 |
| **Total (usuário pesado)** | | | **~R$ 0,80** |

Folga ×2 pelo raciocínio (thinking) e erros de estimativa → **teto de ~R$ 2/assinante/mês**. Alavancas que baixam mais: cache do prompt (leitura a ~10% do preço), Batch (−50%) pro insight semanal, limite mensal por recurso.

### 4. Cobrança (Stripe, a confirmar em stripe.com/br/pricing)
- Mensal R$ 9,90: taxa ~3,99% + R$ 0,39 → **líquido ~R$ 9,11**.
- Anual R$ 79,90: taxa ~R$ 3,58 → **líquido ~R$ 76,30/ano (~R$ 6,36/mês)**.
- Pix pode sair mais barato; sem loja de app (PWA), sem os 15–30% da Apple/Google.

### 5. Impostos e formalização (confirmar com contador)
- **MEI**: DAS fixo ~R$ 80/mês, teto R$ 81 mil/ano; atenção: vários CNAEs de software **não** são permitidos no MEI.
- Se não couber: **Simples Nacional** (~6% da receita, Anexo III) + contador (~R$ 150–300/mês).

### 6. Ponto de equilíbrio
Margem por assinante mensal ≈ R$ 9,11 − R$ 2 (IA, teto) ≈ **R$ 7,10** (anual ≈ R$ 4,40/mês).
| Cenário | Custo fixo/mês | Assinantes mensais pra empatar |
|---|---|---|
| Enxuto (VPS + domínio + MEI) | ~R$ 125 | **~18** |
| Simples + contador | ~R$ 300 + 6% | **~45** |
| Se migrar só a infra e ainda sem CNPJ (pessoa física/carnê-leão) | ~R$ 45 + IR | ~7 (+ imposto de PF) |

Leitura: o custo variável (IA) é baixo; o que pesa é **custo fixo de formalização**, não infra nem IA. Não contabiliza o tempo do fundador.

### 7. Ordem recomendada: validar como pessoa física, formalizar depois
Formalização **não é pré-requisito** pra começar (decidido em 19/10/2026):
- **Grátis (agora)**: sem receita, sem imposto, sem CNPJ.
- **Primeiras vendas como pessoa física**: Stripe aceita CPF; a renda entra no carnê-leão (com a isenção ampliada do IR em 2026, rendas pequenas tendem a não pagar; **confirmar com contador**). Custo fixo só da infra (~R$ 45) → **empata com ~7–8 assinantes**.
- **CNPJ (MEI ou Simples)** só quando a receita ficar constante (centenas de reais/mês) ou alguém precisar de nota fiscal.
- **Metas**: (1) usuários grátis que voltam (check-in e `bun run metrics`); (2) **10 primeiros assinantes** pelo boca a boca, que pagam a infra e provam que o Pro vende; (3) só então CNPJ, escala e marketing.

### 8. Quantos assinantes pra lucrar (cenário de viver disso)
Margem conservadora (IA no teto de R$ 2): mensal R$ 7,11, anual R$ 4,36/mês → **mistura 50/50 ≈ R$ 5,74/assinante/mês** (≈ R$ 5,24 no Simples, com ~6% de imposto).

| Lucro desejado/mês | MEI (fixo ~R$ 125) | Simples + contador (fixo ~R$ 300) |
|---|---|---|
| Empatar | ~22 | ~58 |
| R$ 1.000 | ~200 | ~250 |
| R$ 3.000 | ~545 | ~630 |
| R$ 5.000 | acima do teto do MEI | ~1.010 |

- **Teto do MEI**: R$ 81 mil/ano (~R$ 6.750/mês ≈ 800 assinaturas); acima disso, Simples.
- **Usuários grátis necessários**: freemium converte 2–5% dos ativos → 200 pagantes pedem **~4–10 mil usuários ativos**. O gargalo é aquisição, não custo.
- Com a IA no gasto realista (~R$ 1), os números caem ~15%. Neon pago (~R$ 105) pode entrar na faixa de 5–10 mil ativos (+~18 assinantes no empate).

## Próximas partes
Preço e oferta (grátis × Pro, anual, fundador), aquisição (calculadoras/SEO, conteúdo, indicação), vendas (gatilhos de upgrade no app), parceria com nutricionistas, metas de conversão e LTV/CAC.
