/**
 * Posicionamento dos painéis flutuantes do mapa.
 *
 * Fora do componente porque são constantes de layout, não estado — e
 * porque o `Home` esbarra no limite de linhas do ESLint.
 */

/** Altura do header (h-16 = 4rem) + respiro de 1.5rem. */
export const PANEL_TOP = 'calc(4rem + 1.5rem)';

export const PANEL_STYLE = {
  left: 'max((100vw - var(--grid-max-w)) / 2, 1rem)',
  top: PANEL_TOP,
  width: 'calc(var(--col-w) * 3 + 2rem)',
} as const;

/**
 * Painéis de baixo do mapa (tabela de UFs/municípios e brush de período).
 * Abaixo de `lg` ficam empilhados numa faixa no rodapé, a tabela com um
 * terço da tela e o brush em largura total: as larguras em colunas do grid
 * (`--col-w`) e o `100vw - 18rem` do brush colapsavam para ~70–90 px num
 * celular. A partir de `lg` a faixa vira `contents` e cada painel volta à
 * posição flutuante de sempre.
 */
export const BOTTOM_STACK_CLASS =
  'pointer-events-none absolute inset-x-4 bottom-4 z-10 flex flex-col gap-2 lg:contents';

export const DETAIL_CLASS =
  'pointer-events-auto h-[34svh] lg:absolute lg:top-[calc(4rem_+_1.5rem)] lg:right-[max((100vw_-_var(--grid-max-w))/2,1rem)] lg:z-10 lg:h-[calc((100vh_-_7rem)/2)] lg:w-[calc(var(--col-w)*4_+_3rem)]';

export const BRUSH_CLASS =
  'border-border bg-card/95 pointer-events-auto rounded-lg border px-4 pt-2 pb-3 shadow-lg backdrop-blur-md lg:absolute lg:right-4 lg:bottom-6 lg:z-10 lg:w-[min(960px,calc(100vw_-_18rem))]';

/** Busca fica entre os dois painéis do topo, centrada. */
export const SEARCH_STYLE = { top: PANEL_TOP } as const;
