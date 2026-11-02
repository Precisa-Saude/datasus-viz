import type { SeasonalMonth } from './seasonal';

export type SeasonalView = 'volume' | 'deviation';

/** Apresentação descritiva da produção e de sua referência histórica. */
export function seasonalChartRows(rows: SeasonalMonth[], view: SeasonalView) {
  return rows.map((row) => {
    const display = (value: null | number): null | number => {
      if (view === 'volume') return value;
      if (value === null || row.reference === null || row.reference <= 0) return null;
      return ((value - row.reference) / row.reference) * 100;
    };
    return {
      competencia: row.competencia,
      observed: display(row.observed),
      reference: view === 'volume' ? row.reference : null,
    };
  });
}

export function symmetricPercentDomain([minimum, maximum]: readonly [number, number]): [
  number,
  number,
] {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return [-1, 1];
  const extent = Math.max(Math.abs(minimum), Math.abs(maximum), 1);
  return [-extent, extent];
}
