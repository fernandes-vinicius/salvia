# Ideias de recursos pagos (Sálvia Pro)

Lista viva das ideias de recursos pagos. O grátis continua com tudo o que existe hoje; o Pro (R$ 9,90/mês ou R$ 79,90/ano, ver [`plano-infra-e-planos.md`](plano-infra-e-planos.md)) reúne o que tem custo (IA) ou valor extra. Cada ideia nova entra aqui com o problema, como funcionaria e os cuidados. Custos de IA por assinante e ponto de equilíbrio em [`modelo-de-negocio.md`](modelo-de-negocio.md).

---

## 1. Importar dieta do nutricionista (PDF ou foto) com IA

**Registrada em:** 19/10/2026 · **Status:** em beta fechado desde 19/10/2026 (`/dieta/importar`, só `BETA_EMAILS`, Gemini grátis). Falta antes de abrir: IA paga + Política de privacidade, limite mensal por pessoa, importar somando à dieta atual (hoje substitui).

**Problema:** muita gente já tem uma dieta feita por nutricionista, em PDF, foto do papel ou print do WhatsApp. Passar isso pro app à mão (buscar alimento por alimento, ajustar gramas) é a parte que mais desanima no começo.

**Como funcionaria:**
1. Na aba Dieta (e no "Começo rápido" do Início): "Importar dieta" → enviar PDF, foto ou print (pode ser mais de uma imagem).
2. A IA lê o documento e devolve, em formato estruturado (schema Zod), as refeições com horário, os alimentos, as quantidades e as **opções/substituições** que o nutri costuma listar ("ou 100 g de cuscuz").
3. Cada alimento é casado com a TACO (ou com os alimentos da pessoa) pela busca que já existe; medidas caseiras viram gramas com a tabela de `household-measures.ts` ("4 colheres de arroz" → 100 g).
4. Tela de **revisão antes de salvar**: a pessoa vê refeição por refeição, o que foi reconhecido e o que ficou em dúvida (marcado em destaque), corrige com o mesmo painel de busca/substituir e confirma. Nada entra na dieta sem essa confirmação.
5. Ao confirmar, substitui ou soma à dieta atual (como as dietas prontas, numa transação), já com as opções do item.

**Por que vale pagar:** economiza o trabalho chato de digitar a dieta, que é a maior barreira de entrada, e combina com o público que já tem nutri mas quer acompanhar macros, custo, lista de compras e check-in no app.

**Cuidados:**
- **Revisão obrigatória**: a IA pode errar quantidade ou alimento; mostrar o grau de confiança e nunca salvar direto.
- **Privacidade**: o documento pode ter nome, dados de saúde e do profissional. Enviar só a imagem/texto pro modelo, não guardar o arquivo depois de importar (ou guardar só se a pessoa pedir), e citar o fornecedor de IA na Política de privacidade.
- **Direitos**: a dieta é da pessoa; o app só lê pra ela. Não usar os documentos pra treinar nada.
- **Custo**: imagem/PDF custa mais tokens que texto; limitar por mês no Pro (ex.: 5 importações) e reaproveitar a base de IA (AI Gateway, limite por usuário) do roadmap.
- **Linguagem**: continua sendo a dieta do nutricionista; o app não altera nem "corrige" a prescrição, só organiza.
- **Grátis como degustação**: talvez 1 importação grátis pra mostrar o valor (decidir quando lançar).

---

## 2. Receita da refeição com IA

**Registrada em:** 19/10/2026 · **Status:** em beta fechado desde 19/10/2026 (menu ⋮ da refeição; plano em [`plano-receita-da-refeicao.md`](plano-receita-da-refeicao.md)). Receitas salvas em "Minhas receitas" ([`plano-receitas-salvas.md`](plano-receitas-salvas.md)). Falta antes de abrir: IA paga + Política de privacidade (citar Google/Gemini e Unsplash, que recebe o IP ao carregar a foto).

**Problema:** enjoar da mesma refeição ("com exatamente isso aqui, dá pra fazer algo diferente?") e acabar furando a dieta.

**Como funcionaria:** no menu ⋮ da refeição, "Sugerir receita": a IA monta uma receita prática usando **só os alimentos e as quantidades da refeição** (whey + banana + leite + aveia → shake proteico). Liberados só extras que não mudam os macros (temperos, ervas, folhas, legumes, água, gelo, café sem açúcar, adoçante). "Outra receita" gera outra, sem repetir, até achar uma boa.

**Por que vale pagar:** ataca o motivo nº 1 de largar a dieta (monotonia) sem mexer nos macros; uso frequente, custo baixo (só texto).

**Cuidados:** os ingredientes mostrados vêm da própria dieta, não do texto da IA; filtro de extras calóricos no servidor; linguagem simples, sem falar de saúde.

**Custo (estimado em 19/10/2026):** ~1,5 mil tokens por receita (≈ 1 mil de entrada, 400–500 de saída) num modelo barato (Gemini Flash-Lite / Haiku) ≈ R$ 0,002 por receita. Mil receitas ≈ R$ 2; quem gera 10 por dia (300/mês) custa ≈ R$ 0,60/mês. O risco não é o uso normal, é abuso (script gerando sem parar): pôr limite diário por pessoa (ex.: 20/dia) e contar o uso no banco (também serve pra medir custo real do Pro).

**Foto da receita (Unsplash, feito em 19/10/2026 no beta; limite de 20 receitas/dia também):** a IA devolve também um termo de busca em inglês ("banana pancake"); o servidor busca 1 foto na API do Unsplash (grátis; 50 req/h em demo, 5 mil/h depois de aprovado) e mostra acima do título, direto do link do Unsplash (sem guardar imagem; na receita salva fica só a URL e o autor). Regras do Unsplash: crédito "Foto de X no Unsplash" com links e avisar o download quando a foto for usada. Marcar como "foto ilustrativa" (a foto pode ter coisas que não estão na refeição). Gerar a imagem com IA sairia ~R$ 0,15–0,25 cada (50–100× o texto): não compensa.
