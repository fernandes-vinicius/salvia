# Roadmap / ideias futuras

## Calibração da meta pelo peso real

**Status:** feito em out/2026 (ajuste pelo seu peso: `goal/utils/calibration.ts` + `CalibrationCard` no Início e na Meta). Antes disso, mitigado trocando o FA único pelo método fatorial na aba TMB. Próximos passos possíveis: lembrete semanal de pesagem (push do PWA), mostrar o "gasto real estimado" num gráfico, usar a dieta registrada (se um dia houver diário do que foi comido) em vez de assumir que a pessoa seguiu o plano.

**Problema original:** o fator de atividade (FA) e a fórmula de Harris-Benedict são médias populacionais e costumam superestimar o gasto de quem treina mas passa o resto do dia sentado. Caso real (out/2026): pela tabela, musculação 3–5×/semana = 1,55, mas o que funcionou na prática foi 1,375 (~300 kcal/dia de diferença).

**Ideia:** com histórico de peso, o app compara a variação real com a esperada pela meta e sugere um ajuste.

- Registrar peso: feito em Minhas medidas (`body_measurement`). Hoje é independente da TMB (escolha do usuário); a calibração pode ler o peso de lá.
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

**Status:** feito em 20/10/2026, em Configurações → "Como contar a proteína" (`goal/utils/protein-counting.ts`). Padrão das contas novas: proteína **total** (coluna P); "só animal" (coluna P(A)) é opção, e as contas que já existiam foram migradas pra ela. Vale na grade, Visualizar/PDF, Meta, plano × meta e dietas prontas; o Resumo do dia continua mostrando A e V separadas. Próximo passo possível: peso menor pra proteína vegetal (qualidade/DIAAS) em vez de 0 ou 100%.

### Proteína pelo peso ajustado com IMC alto

- Com IMC alto, g/kg × peso total infla a proteína. Usar peso ajustado (ou massa magra, se houver % de gordura) a partir de um limiar de IMC, explicando na UI.

### Aviso de carboidrato baixo pro volume de treino

- Diretrizes de nutrição esportiva (ACSM): ~3–5 g/kg pra ~1 h de treino por dia; 5–7 g/kg pra volume alto.
- Com o volume de treino da aba TMB (dias × minutos de musculação + cardio), sugerir uma faixa e mostrar aviso suave quando o carboidrato ficar abaixo ("Pode faltar energia pro treino; se o rendimento cair, aumente o carbo") — sem bloquear, déficit com carbo baixo é comum.

### Insights contextuais (tirar dúvidas na hora de escolher)

Origem: ao definir a gordura na Meta (70 kg, querendo perder peso sem perder muito músculo), surgiu a dúvida "1 g/kg ou 0,8 g/kg?". Dúvidas assim, no momento da escolha, viram insights.

**Status:** primeira versão feita em 20/10/2026 (`WhyItMatters` na TMB e na Meta, faixas por `goal/utils/insights.ts`). Próximo passo: o "Pergunte" com IA.

- Cartões curtos ("Por que isso importa?") ao lado de cada escolha da Meta e da TMB, escritos pra leigos, com a recomendação aplicada aos dados da pessoa (peso, objetivo, treino).
- Exemplo (gordura em déficit): faixa usual 0,6–1,0 g/kg, sem descer de ~0,5 g/kg nem de ~20% das kcal (saúde hormonal). Quem preserva o músculo é a proteína (1,6–2,2 g/kg) + musculação, não a gordura; baixar a gordura libera kcal pro carboidrato, o que ajuda o treino. Pra 70 kg em déficit e treinando, 0,8 g/kg (~56 g) costuma ser um bom meio-termo; 1,0 g/kg se a dieta ficar mais saciante assim.
- Gatilhos: valor escolhido fora da faixa recomendada, combinação estranha (ex.: carbo baixo + muito treino, ver item acima), mudança de objetivo.
- Formato: dica discreta na própria tela (não bloqueia), com link pra "Como calculamos". No futuro, um "Pergunte" com IA usando o contexto do usuário (perfil, meta, dieta).
- Sempre com referência e o aviso de que não substitui nutricionista.

### Transparência

- [x] Página "Como calculamos" (`/como-calculamos`) com as fórmulas e referências: feita em 20/10/2026.

## IA no app (aos poucos)

> Ideias de recursos pagos ficam em [`ideias-pro.md`](ideias-pro.md).

Planejado em out/2026. Ordem pensada pra começar pelo que não usa IA e ir aumentando o risco/custo aos poucos.

### 0. Base (antes da 1ª funcionalidade com IA)

**Status:** feita em out/2026, com os recursos em beta fechado (`BETA_EMAILS`).

- [x] Provedor: Gemini (grátis) pelo AI SDK, centralizado em `~/shared/lib/ai` (trocar de fornecedor = trocar esse arquivo). Vercel AI Gateway fica pra quando a IA for paga.
- [x] Limite de uso por usuário por dia (`ai-usage`: receita 20, variar refeição 20, importação 10), com mensagem amigável quando acaba e devolução da cota se a IA falhar.
- [x] Mandar pra IA só o mínimo (alimentos, quantidades, nome/horário da refeição), nunca nome/e-mail.
- [x] Política de privacidade cita Google/Gemini e Unsplash. Falta antes de abrir pra todos: IA paga (o plano grátis do Gemini pode usar os dados).
- [x] Prompt base com as regras do app: linguagem simples, nunca prescrição, sem falar de dieta/saúde nos textos gerados.
- [x] Respostas estruturadas (schema Zod, `Output.object`) e números sempre calculados no servidor, nunca pela IA.
- [x] Candidato a recurso Pro: em beta fechado; abrir com limite baixo pra medir uso.

### 1. Calculadora de água (sem IA)

**Status:** feito em out/2026 (`/calculadoras/agua`, `calculators/utils/water.ts`): mínimo 35 ml/kg e recomendado 40 ml/kg + suor do treino (0,5/0,75/1 L por hora conforme clima) + 0,5 L no calor, em litros, copos e garrafas. Junto veio a **fibra na dieta** (TACO `dietaryFiber`, Resumo do dia com a recomendação da OMS).

- [x] Reaproveitar peso e treinos da aba TMB quando logado: água sugerida no Resumo do dia e no card "Água por dia" do Início (20/10/2026).
- [ ] Revisar as faixas com um nutricionista e, se preciso, citar as referências com link.

### 2. Sugestão de receitas da refeição (IA)

**Status:** feito em out/2026, em beta fechado (`meal-recipe`; detalhes em `ideias-pro.md` nº 2).

- [x] No menu ⋮ da refeição: "Sugerir receita (beta)", com passos curtos, extras sem caloria, tempo e foto ilustrativa (Unsplash).
- [x] Regra: só os alimentos da refeição + extras sem caloria (filtro `safeExtras` no servidor). Em vez de mostrar extras calóricos, a receita pode usar até 2 **trocas equivalentes** calculadas no servidor (mamão → banana).
- [x] "Outra receita" (não repete), salvar em "Minhas receitas" e compartilhar por link (`/r/:token`, WhatsApp/redes).
- [x] Opções simples na hora de pedir: chips Rápida · Marmita · Air fryer (20/10/2026).
- [x] **Variar refeição (beta)**: outra versão da refeição inteira com trocas equivalentes que combinam entre si, com "Usar esta" e "Desfazer" (`meal-variation`, `ideias-pro.md` nº 4).
- [x] "Completar com IA" (beta, 20/10/2026, `meal-fill`): a IA escolhe os alimentos e o servidor calcula as quantidades pelo que falta da meta. Ideia original: "Montar refeição com IA" a partir dos macros que faltam (ex.: "faltam 40 g de proteína e 60 g de carbo"), sugerindo alimentos da TACO com quantidades no passo do editor, aplicáveis com "Desfazer".
- [x] Extra: importar a dieta do nutricionista (PDF/foto) com IA, em beta (`diet-import`, `ideias-pro.md` nº 1).

### 3. Insights de evolução e dicas (IA)

- [x] Resumo da semana (beta, 20/10/2026, `weekly-summary`): um por semana, sob pedido, guardado no banco. Ideia original: card no Início com um resumo semanal: tendência do peso e da cintura (Medidas), se está no ritmo da meta, calibração sugerida e um próximo passo. As contas continuam nas funções puras (`analyzeCalibration`, `home.ts`); a IA só escreve o texto a partir delas.
- [ ] Dicas contextuais: água (ligada à calculadora), proteína distribuída nas refeições (a coluna P já mostra), sono e constância nas pesagens, fibras/vegetais.
- [x] Gerar no máximo 1×/semana por usuário (cache no banco) pra controlar custo; "Ver de novo" não chama a IA de novo.
- [ ] Evolui pro "Pergunte" com IA dos Insights contextuais (seção acima), usando perfil, meta e dieta como contexto.

### 4. Mais calculadoras (sem IA)

- [x] IMC (com as limitações e o peso saudável) e % de gordura estimado (Marinha dos EUA, com massa magra): feitos em 20/10/2026.
- [ ] Outras páginas de busca: "quantas calorias pra perder 1 kg por mês", fibras por dia, creatina.
- [ ] Cada nova calculadora alimenta o sitemap, a lista em `/calculadoras` e a seção de calculadoras da landing.

## Ideias que agregam valor (out/2026)

Para quem treina e conta macro sem nutricionista; o que falta é motivo pra voltar todo dia.

- [x] Enviar sugestão (menu do perfil) e compartilhar a dieta por link (`/d/:token`): feitos em out/2026.
- [x] Check-in do dia ("segui a dieta?": ✓ comi, ↔ comi a opção, ✗ furei), com sequência e adesão da semana: feito em out/2026 (card no Início). Adesão no ajuste pelo peso: feito em 20/10/2026 (abaixo de 80% não sugere mudar a meta). Próximos passos: lembrete por notificação, check-in também na aba Dieta.
- [x] Início da dieta + revisões de 15 e 30 dias (20/10/2026, `DietReviewCard`): ("Dia 18 · próxima revisão em 12 dias"), com o veredito e o ajuste em gramas de carbo. Usa a adesão do check-in no período ("o peso não caiu, mas você seguiu 60% das refeições").
- [ ] Cadastrar alimento pelo código de barras (Open Food Facts); versão Pro: foto do rótulo lida pela IA.
- [ ] Dia de treino × dia de descanso (duas versões da dieta): bom recurso Pro sem IA.
- [ ] Fotos de evolução (frente/lado/costas, comparação lado a lado): Pro, depois do VPS (armazenamento e LGPD).
- [x] Comemorações animadas ao cumprir metas (check-in, dia completo, marcos de sequência, pesagem, dieta na meta, fibra), com interruptor em Configurações: feito em out/2026.
- [x] Porções caseiras (colher, concha, fatia): feito em out/2026 (`household-measures.ts`); próximo passo: medidas nos alimentos próprios (campo no cadastro) e ampliar a lista.
- [x] Custo da dieta (preço de referência + preço do seu mercado): feito em out/2026 (lista de compras e Resumo da Dieta). Custo nas trocas (Substituir, Opções e Variar refeição): feito em 20/10/2026. Próximos passos: revisar os preços de referência todo mês, "dieta mais barata que bate as metas" no Pro.
- [ ] Menores: lembrete de pesagem e de check-in (push do PWA). Alertas de sódio e ferro: feitos em 20/10/2026.
- [x] Manchetes do blog Hipertrofia.org no Início (card "Para ler", só título/resumo/link pelos termos de uso deles, cliques no PostHog): feito em 20/10/2026. Próximo passo: proposta de parceria (imagens, artigos ao lado de cada recurso, link pro app nos artigos).
- [ ] Link da dieta compartilhada: interruptor "Mostrar meu nome" (desligado por padrão; "Montada por Vinicius Fernandes" ou só o primeiro nome), com linha na Política de privacidade.
- Depois: IA (Sálvia Pro, seção "IA no app") e infra + cobrança ([`plano-infra-e-planos.md`](plano-infra-e-planos.md)), que é o pré-requisito da IA.

## Aba Dieta — próximos passos

Feito (out/2026): grade de refeições, TACO + alimentos próprios, resumo estilo planilha, planejado × meta, arrastar e soltar, substituir alimento (com quantidade equivalente) e copiar pra outra refeição, modo Visualizar + PDF, resetar dieta.

- ~~Reordenar as próprias refeições arrastando~~: feito (20/10/2026) no painel "Reordenar refeições" do menu ⋮ (alça + setas).
- ~~Substituições ("ou 100 g de cuscuz" da planilha)~~: feito (out/2026) como opções do item. Próximos passos possíveis: opções nas dietas prontas, lista de compras somando as opções, sugerir opções automaticamente (mesmo grupo de alimento).
- ~~Celular: resumo e meta ocupam a primeira tela~~: feito (20/10/2026), faixa compacta com "Ver resumo completo".
- ~~Porções caseiras na TACO (1 fatia, 1 colher) além de gramas~~: feito (out/2026), `household-measures.ts`.
- Dados da TACO: leite integral e desnatado UHT vinham sem valores (0 kcal) e foram preenchidos com USDA em 20/10/2026 (`tacoMacros`); "Iogurte, sabor abacaxi" usa o de morango da TACO (20/10/2026).

## Posicionamento (decidido em 19/10/2026)

- **Público**: quem treina e quer a dieta no mesmo nível do treino, tanto quem monta a própria quanto quem tem dieta do nutricionista (o app organiza e acompanha; nunca substitui o profissional).
- **Mensagem**: tocar na dor real e no pertencimento. Origem: um amigo fitness, ao ver o app: "Tô precisando de um desse… perdi muito peso ultimamente, tá uma bagunça minha dieta". Título da landing: "Sua dieta tá uma bagunça? Bora colocar em ordem."
- **Evitar**: gíria de academia ("maromba", "marombeiro") e falar mal de nutricionista.
- **Parceria com nutricionistas**: canal futuro (o nutri indica o app aos pacientes), sem painel de nutri por enquanto; a importação de dieta com IA (`ideias-pro.md` nº 1) é a ponte.

## Negócio: monetização, custo e marketing

> Contas do negócio (custo mínimo, IA por assinante, ponto de equilíbrio): [`modelo-de-negocio.md`](modelo-de-negocio.md).

> Plano decidido em 18/10/2026 (VPS + Coolify em São Paulo, Stripe, Grátis × Sálvia Pro a R$ 9,90/mês ou R$ 79,90/ano, AdSense depois): [`plano-infra-e-planos.md`](plano-infra-e-planos.md). Ele substitui as opções de infra e cobrança listadas abaixo.

Análise de out/2026. Já feito: Termos de uso e Política de privacidade (LGPD) com exclusão de conta, aviso "ferramenta, não prescrição", calculadoras públicas (TMB, macros, proteína) que levam os números pro app, e assinatura "Feito com Sálvia" no PDF.

### Produto: motivo pra voltar (antes de cobrar)

O app resolve um evento único (montar a dieta). Assinatura precisa de valor recorrente, senão cancela no 2º mês.

- **Ajuste automático de metas** (principal motivo pra pagar): feito (out/2026), hoje grátis; candidato a recurso Pro.
- **Check-in semanal**: "você perdeu 0,4 kg, está no ritmo". Junto com os Insights contextuais.
- **Dietas prontas novas todo mês** (conteúdo que traz a pessoa de volta).
- **Lista de compras**: feita (out/2026). Próximos passos possíveis: preço estimado por item (custo da dieta por semana), lista de várias dietas somadas, unidades de venda (pacote de 1 kg, bandeja de 30 ovos).
- **Várias dietas** (dia de treino × descanso).

### Modelo de cobrança

- Freemium em vez de teste de 30 dias: o valor aparece em 5 minutos, então 30 dias grátis = pega a dieta e some. O grátis vira marketing (boca a boca na academia).
- Grátis: TMB, Meta, 1 dieta, usar dietas prontas, substituir/copiar alimentos. Pro: ajuste automático, todas as dietas prontas, PDF e lista de compras, histórico completo de medidas, várias dietas.
- Preço: ~R$ 9,90/mês ou ~R$ 59,90/ano, empurrando o anual (menos churn e uma taxa de gateway por ano). Âncora: consulta de nutricionista R$ 150–300.
- Lançamento: "Fundador vitalício" (~R$ 99) pros 100 primeiros.
- Se quiser teste: 7 dias de Pro com Pix Automático/cartão cadastrado, não 30 dias sem nada.
- Pagamento: gateway brasileiro com Pix e Pix Automático (Mercado Pago, Asaas, AbacatePay; comparar taxas). Com preço baixo, taxa fixa por transação pesa. Evitar lojas de app (PWA já instala, sem 15–30%).
- Implementação: webhook do gateway marca o usuário como Pro, bloqueio das funções pagas, página de planos.

### Custo de infra

- **Atenção:** Vercel Hobby não permite uso comercial. Ao cobrar: Vercel Pro (US$ 20/mês, ~R$ 110) ou sair da Vercel.
- Opção mais barata: VPS no Brasil (~R$ 25–40/mês) com Coolify + Postgres na mesma máquina (dados no Brasil, bom pra LGPD; backup por nossa conta).
- Alternativa: Cloudflare Workers (US$ 5/mês) via OpenNext; verificar suporte a Next 16 + Cache Components antes.
- Neon grátis aguenta bem no começo (dados pequenos). Domínio próprio `.com.br` ~R$ 40/ano (SEO e confiança; trocar `NEXT_PUBLIC_SITE_URL`).
- Plano: validar grátis na Hobby → ligar cobrança e migrar pra VPS juntos.

### Medição

- Feito (out/2026): Vercel Web Analytics pro tráfego + `user_activity` e `bun run metrics` pro funil (cadastro → TMB → Meta → dieta → pesou → voltou na 2ª semana). Também PostHog (eventos, funil, retenção e gravações com texto mascarado) e Microsoft Clarity (mapa de calor das páginas públicas), sem cookies. Falta: etapa "pagou" quando houver cobrança.

### Marketing de custo quase zero

- Calculadoras públicas (feito) + mais páginas de busca: "dieta de cutting barata", "quantas calorias pra secar", "proteína do ovo/frango".
- Reels/TikTok no tom do público: "montei a dieta de cutting em 3 minutos", "dieta de R$ 15/dia com 160 g de proteína", "troquei frango por ovo sem errar o macro" (o recurso de substituir é ótimo pra vídeo).
- Plano Personal (R$ 29–49/mês): personal trainers montam dietas dos alunos, que entram no grátis. Canal de aquisição que se paga.
- Indicação: 1 mês de Pro pra quem indica e pro indicado.
- Comunidades (grupos de academia, fóruns de maromba, Discords fitness) com conteúdo útil, não link solto.

### Pendências jurídicas

- Termos e privacidade foram escritos como modelo: revisar com advogado antes de cobrar.
- Confirmar com nutricionista/advogado o enquadramento das dietas prontas (hoje: modelos de exemplo recalculados pelas metas que a pessoa definiu, sem prescrição).
- ~~Exportação de dados (portabilidade) por e-mail~~: botão "Baixar meus dados" (JSON) em Configurações, feito em 20/10/2026.
