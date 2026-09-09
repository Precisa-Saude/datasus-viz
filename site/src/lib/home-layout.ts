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

export const DETAIL_STYLE = {
  height: 'calc((100vh - 7rem) / 2)',
  right: 'max((100vw - var(--grid-max-w)) / 2, 1rem)',
  top: PANEL_TOP,
  width: 'calc(var(--col-w) * 4 + 3rem)',
} as const;

/** Busca fica entre os dois painéis do topo, centrada. */
export const SEARCH_STYLE = { top: PANEL_TOP } as const;
