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

export interface SeasonalSeriesOption {
  color: string;
  id: string;
  label: string;
}

/**
 * Séries que o painel sazonal pode explorar: os slots do overlay primeiro
 * (com a cor deles), depois todas as demais do escopo — todos os exames
 * ou todas as UFs — com a cor de fallback. Sem duplicatas.
 */
export function seasonalSeriesOptions(
  slotSeries: readonly Pick<SeasonalSeriesOption, 'color' | 'id'>[],
  allIds: readonly string[],
  labelOf: (id: string) => string,
  fallbackColor: string,
): SeasonalSeriesOption[] {
  const slotColor = new Map(slotSeries.map((s) => [s.id, s.color]));
  return [...new Set([...slotColor.keys(), ...allIds])].map((id) => ({
    color: slotColor.get(id) ?? fallbackColor,
    id,
    label: labelOf(id),
  }));
}

export function symmetricPercentDomain([minimum, maximum]: readonly [number, number]): [
  number,
  number,
] {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return [-1, 1];
  const extent = Math.max(Math.abs(minimum), Math.abs(maximum), 1);
  return [-extent, extent];
}
