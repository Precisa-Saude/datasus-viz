# Comparação sazonal

Na página **Tendências**, o painel **Observado vs. referência sazonal** utiliza
o mesmo exame do gráfico temporal. No modo comparar UFs, o seletor sazonal
oferece todas as UFs disponíveis no manifesto (26 estados e Distrito Federal),
independentemente das três UFs do overlay superior. Selecione uma série e um
ano observado. O gráfico mostra a produção aprovada mensal e a mediana
histórica; a tabela inclui a amplitude e o tamanho da amostra por mês.
UFs sem dados do exame permanecem selecionáveis, com estado vazio explícito.
Os controles continuam disponíveis para trocar de UF sem recarregar a página.

Em **Visualização sazonal**, escolha **Desvio percentual** para representar
`(observado − mediana histórica) / mediana histórica × 100`, com linha em zero e
eixo simétrico. Lacunas e mediana zero não recebem percentual.
Os controles ficam fora do card do gráfico; a tabela mensal tem seu próprio card.

## Cálculo

Para janeiro de 2025, por exemplo, a referência usa somente janeiros de
2020 a 2024 da mesma série. São necessários ao menos três anos com registro
nessa janela fixa de cinco anos. A mediana é a média dos dois valores centrais
quando a amostra tem tamanho par. A amplitude vai do mínimo ao máximo observado;
não é intervalo de previsão ou limite de normalidade.

A variação é `(observado − mediana) / mediana × 100`. Não há percentual quando
o observado está ausente, o histórico é insuficiente ou a mediana é zero.
Um zero explicitamente registrado é válido; ausência de linha não vira zero.
Meses sem registro continuam visíveis como lacunas, inclusive no gráfico.

## Interpretação e limites

- O alvo é `PA_QTDAPR`, produção aprovada, no local executor. Não são resultados
  laboratoriais, pacientes únicos, incidência ou demanda não atendida.
- A presença de uma linha não confirma publicação completa. No total Brasil,
  a composição de UFs pode mudar entre competências.
- Oferta de serviços, revisões do DATASUS e mudanças no mapeamento SIGTAP/LOINC
  podem alterar a série sem mudança epidemiológica.
- Os dados são do snapshot atual do site. O ano observado e anos futuros não
  entram na referência, mas revisões posteriores podem estar presentes no
  histórico. A comparação não reproduz os dados disponíveis em cada época.
- Meses futuros ou ausentes não recebem produção estimada. Uma referência
  histórica eventualmente exibida nesses meses não é uma previsão validada.

O painel informa a atualização do manifesto e reutiliza o aviso de competências
provisórias do site. Não mede completude nem ajusta atraso de publicação.

## Próximas fases

[PRE-539](https://linear.app/precisa-saude/issue/PRE-539) registra o roadmap de
calendário sazonal e pipeline separado de vigilância respiratória.
A implementação atual não detecta surtos e não utiliza Google
Popular Times ou movimento ao vivo.
