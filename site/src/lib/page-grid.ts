/**
 * Grade das páginas de ferramenta (Explorar, Tendências): 12 colunas na
 * largura das 12 colunas úteis do grid da marca a partir de `md`. Abaixo
 * disso a página ocupa a tela toda com 16 px de respiro; a fórmula da
 * largura máxima, calculada sobre o grid de 14 colunas, encolhia o
 * conteúdo para ~320 px num celular e deixava margens de mais de 40 px.
 */
export const PAGE_GRID_CLASS =
  'mx-auto grid w-full gap-4 px-4 pt-24 pb-16 md:max-w-[calc(var(--col-w)*12+11rem)] md:px-0 lg:pt-32';

/** `minmax(0, 1fr)`: filhos largos (tabelas, gráficos) não esticam a grade. */
export const PAGE_GRID_STYLE = { gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' } as const;
