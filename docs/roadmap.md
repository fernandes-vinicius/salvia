# Roadmap / ideias futuras

## Calibração da meta pelo peso real

**Status:** mitigado em out/2026 trocando o FA único pelo método fatorial (NEAT + treinos por MET + digestão) na aba TMB. A calibração pelo peso continua útil como ajuste fino.

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

- Hoje a meta de proteína conta só a **animal** (escolha do usuário, igual à planilha). Prática comum: meta de proteína **total** (opcionalmente com peso menor pra vegetal, por qualidade/DIAAS).
- Opção na aba Meta: "Contar só proteína animal" (atual) × "Contar toda a proteína". O resumo da Dieta continua mostrando A e V separadas.

### Proteína pelo peso ajustado com IMC alto

- Com IMC alto, g/kg × peso total infla a proteína. Usar peso ajustado (ou massa magra, se houver % de gordura) a partir de um limiar de IMC, explicando na UI.

### Aviso de carboidrato baixo pro volume de treino

- Diretrizes de nutrição esportiva (ACSM): ~3–5 g/kg pra ~1 h de treino por dia; 5–7 g/kg pra volume alto.
- Com o volume de treino da aba TMB (dias × minutos de musculação + cardio), sugerir uma faixa e mostrar aviso suave quando o carboidrato ficar abaixo ("Pode faltar energia pro treino; se o rendimento cair, aumente o carbo") — sem bloquear, déficit com carbo baixo é comum.

### Insights contextuais (tirar dúvidas na hora de escolher)

Origem: ao definir a gordura na Meta (70 kg, querendo perder peso sem perder muito músculo), surgiu a dúvida "1 g/kg ou 0,8 g/kg?". Dúvidas assim, no momento da escolha, viram insights.

- Cartões curtos ("Por que isso importa?") ao lado de cada escolha da Meta e da TMB, escritos pra leigos, com a recomendação aplicada aos dados da pessoa (peso, objetivo, treino).
- Exemplo (gordura em déficit): faixa usual 0,6–1,0 g/kg, sem descer de ~0,5 g/kg nem de ~20% das kcal (saúde hormonal). Quem preserva o músculo é a proteína (1,6–2,2 g/kg) + musculação, não a gordura; baixar a gordura libera kcal pro carboidrato, o que ajuda o treino. Pra 70 kg em déficit e treinando, 0,8 g/kg (~56 g) costuma ser um bom meio-termo; 1,0 g/kg se a dieta ficar mais saciante assim.
- Gatilhos: valor escolhido fora da faixa recomendada, combinação estranha (ex.: carbo baixo + muito treino, ver item acima), mudança de objetivo.
- Formato: dica discreta na própria tela (não bloqueia), com link pra "Como calculamos". No futuro, um "Pergunte" com IA usando o contexto do usuário (perfil, meta, dieta).
- Sempre com referência e o aviso de que não substitui nutricionista.

### Transparência

- Página "Como calculamos" com as fórmulas e referências, e nota de que o app não substitui acompanhamento profissional.

## Aba Dieta — próximos passos

Feito (out/2026): grade de refeições, TACO + alimentos próprios, resumo estilo planilha, planejado × meta, arrastar e soltar, substituir alimento (com quantidade equivalente) e copiar pra outra refeição, modo Visualizar + PDF, resetar dieta.

- Reordenar as próprias refeições arrastando (hoje só os alimentos se movem).
- Substituições ("ou 100 g de cuscuz" da planilha): alternativas equivalentes por item.
- Celular: resumo e meta ocupam a primeira tela; avaliar versão compacta/recolhível pra grade aparecer antes (desktop já resolvido com coluna lateral).
- Porções caseiras na TACO (1 fatia, 1 colher) além de gramas.

## Negócio: monetização, custo e marketing

Análise de out/2026. Já feito: Termos de uso e Política de privacidade (LGPD) com exclusão de conta, aviso "ferramenta, não prescrição", calculadoras públicas (TMB, macros, proteína) que levam os números pro app, e assinatura "Feito com Sálvia" no PDF.

### Produto: motivo pra voltar (antes de cobrar)

O app resolve um evento único (montar a dieta). Assinatura precisa de valor recorrente, senão cancela no 2º mês.

- **Ajuste automático de metas** (principal motivo pra pagar): é a "Calibração da meta pelo peso real" acima, virando recurso Pro.
- **Check-in semanal**: "você perdeu 0,4 kg, está no ritmo". Junto com os Insights contextuais.
- **Dietas prontas novas todo mês** (conteúdo que traz a pessoa de volta).
- **Lista de compras da semana** gerada a partir da dieta.
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

- Analytics de funil: visita → cadastro → montou a dieta → voltou na semana 2 → pagou. Sem isso não dá pra saber onde se perde gente. Ao adicionar, atualizar a Política de privacidade (item cookies/terceiros).

### Marketing de custo quase zero

- Calculadoras públicas (feito) + mais páginas de busca: "dieta de cutting barata", "quantas calorias pra secar", "proteína do ovo/frango".
- Reels/TikTok no tom do público: "montei a dieta de cutting em 3 minutos", "dieta de R$ 15/dia com 160 g de proteína", "troquei frango por ovo sem errar o macro" (o recurso de substituir é ótimo pra vídeo).
- Plano Personal (R$ 29–49/mês): personal trainers montam dietas dos alunos, que entram no grátis. Canal de aquisição que se paga.
- Indicação: 1 mês de Pro pra quem indica e pro indicado.
- Comunidades (grupos de academia, fóruns de maromba, Discords fitness) com conteúdo útil, não link solto.

### Pendências jurídicas

- Termos e privacidade foram escritos como modelo: revisar com advogado antes de cobrar.
- Confirmar com nutricionista/advogado o enquadramento das dietas prontas (hoje: modelos de exemplo recalculados pelas metas que a pessoa definiu, sem prescrição).
- Exportação de dados (portabilidade) hoje é por e-mail; dá pra virar botão "Baixar meus dados" (JSON) em Configurações.
