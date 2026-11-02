# Referência sazonal de produção aprovada

## Objetivo

Implementar a comparação histórica descritiva de [PRE-539](https://linear.app/precisa-saude/issue/PRE-539)
na página Tendências, preservando a exploração de exames e UFs.

## Current status

- Worktree: `datasus-viz-feat-seasonal-expected-observed`.
- Branch: `feat/seasonal-expected-observed`.
- Gráfico de produção observada e mediana histórica; opção de desvio percentual.
- Seletor sazonal com todas as 27 UFs, independente do overlay superior.
- Controles `Combobox` e título externos ao card, usando a hierarquia editorial.
- Tabela mensal em card separado, com seis colunas: mês, observado, mediana,
  amplitude histórica, anos com registro e variação.
- Preview em `http://localhost:4332/tendencias`.
- Commit e push autorizados pelo usuário; entrega na branch de feature.
- Validação: 308 testes passando; lint, typecheck e build passando. As rotinas
  sazonais e os componentes alterados têm 100% de cobertura de linhas.

## Especificação

- Referência: mediana do mesmo mês nos cinco anos civis anteriores ao ano
  selecionado, exigindo pelo menos três observações anuais válidas.
- Não usar o próprio ano ou anos futuros na referência. A amplitude é mínimo
  a máximo histórico e permanece descritiva.
- Lacunas permanecem ausentes; zero explícito é válido. Não calcular percentual
  quando o observado está ausente ou a referência é zero/insuficiente.
- Eixo percentual simétrico em torno de zero, sem cortar valores extremos.
- Mostrar atualização do manifesto e avisos de revisões e cobertura.
- Consultar todas as UFs uma vez por exame; filtrar somente o overlay superior.
- Preservar seletores quando uma UF não tem dados e ignorar consultas atrasadas.
- Sem novas dependências ou mudanças no pipeline. JSON/JSONL por padrão.

## Next steps

1. Conferir visualmente desktop e mobile; controle de navegador indisponível.
2. Acompanhar CI e revisão da entrega pela branch de feature.

## Context

O pipeline soma `PA_QTDAPR` por competência, LOINC e local executor.
Produção registrada não mede resultados clínicos, pacientes únicos ou incidência.
Uma linha não comprova completude; a composição das UFs no total Brasil pode
mudar entre meses. O histórico revisado não reproduz a disponibilidade em cada
data de publicação. Documentação: `site/docs/seasonal-comparison.md`.
