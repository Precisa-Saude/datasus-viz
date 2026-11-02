import type { TrendPoint } from './queries';

export const SEASONAL_LOOKBACK = 5;
export const SEASONAL_MIN_YEARS = 3;

export interface SeasonalMonth {
  competencia: string;
  differencePercent: null | number;
  historicalMax: null | number;
  historicalMin: null | number;
  observed: null | number;
  reference: null | number;
  sampleSize: number;
}

export function isSeasonalObservation(point: TrendPoint): boolean {
  return (
    /^\d{4}-(0[1-9]|1[0-2])$/.test(point.competencia) &&
    Number.isFinite(point.volumeExames) &&
    point.volumeExames >= 0
  );
}

/** Referência descritiva; anos ausentes não são substituídos por zeros. */
export function seasonalComparison(
  data: readonly TrendPoint[],
  seriesId: string,
  year: number,
): SeasonalMonth[] {
  const observations = new Map(
    data
      .filter((point) => point.seriesId === seriesId && isSeasonalObservation(point))
      .map((point) => [point.competencia, point.volumeExames]),
  );

  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    const competencia = `${year}-${month}`;
    const observed = observations.get(competencia) ?? null;
    const history: number[] = [];
    for (let previous = year - SEASONAL_LOOKBACK; previous < year; previous++) {
      const volume = observations.get(`${previous}-${month}`);
      if (volume !== undefined) history.push(volume);
    }
    history.sort((a, b) => a - b);
    const sufficient = history.length >= SEASONAL_MIN_YEARS;
    const middle = Math.floor(history.length / 2);
    const reference = sufficient
      ? ((history[middle] ?? 0) + (history[Math.ceil(history.length / 2) - 1] ?? 0)) / 2
      : null;

    return {
      competencia,
      differencePercent:
        observed !== null && reference !== null && reference > 0
          ? ((observed - reference) / reference) * 100
          : null,
      historicalMax: sufficient ? (history[history.length - 1] ?? null) : null,
      historicalMin: sufficient ? (history[0] ?? null) : null,
      observed,
      reference,
      sampleSize: history.length,
    };
  });
}
