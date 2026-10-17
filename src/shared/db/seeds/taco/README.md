# TACO — Tabela Brasileira de Composição de Alimentos

- Fonte dos dados: TACO 4ª edição revisada e ampliada (2011), NEPA/UNICAMP — http://www.nepa.unicamp.br/taco/tabela.php
- CSVs normalizados obtidos de https://github.com/raulfdm/taco-api (`references/csv/`, licença MIT), baixados em 2026-10-17.
  Tratamento feito lá: "Tr" (traço) → 0; "NA"/"*" → vazio.
- Valores por 100 g de parte comestível. Importados com `bun run db:seed:taco` (idempotente).
