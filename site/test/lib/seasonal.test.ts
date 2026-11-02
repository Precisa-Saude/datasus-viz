import { describe, expect, it } from 'vitest';

import type { TrendPoint } from '@/lib/queries';
import { isSeasonalObservation, seasonalComparison } from '@/lib/seasonal';

function point(competencia: string, volumeExames: number, seriesId = 'a'): TrendPoint {
  return { competencia, seriesId, valorAprovadoBRL: 0, volumeExames };
}

describe('seasonalComparison', () => {
  it('usa somente o mesmo mês nos cinco anos anteriores, com mediana ímpar', () => {
    const data = [
      point('2018-01', 999),
      point('2021-01', 30),
      point('2022-01', 10),
      point('2023-01', 20),
      point('2024-02', 999),
      point('2025-01', 40),
      point('2026-01', 9999),
      point('2023-01', 999, 'b'),
    ];
    const snapshot = [...data];
    const rows = seasonalComparison(data, 'a', 2025);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toEqual({
      competencia: '2025-01',
      differencePercent: 100,
      historicalMax: 30,
      historicalMin: 10,
      observed: 40,
      reference: 20,
      sampleSize: 3,
    });
    expect(data).toEqual(snapshot);
    expect(rows[1]?.reference).toBeNull();
  });

  it('calcula mediana par sem arredondar', () => {
    const data = [
      point('2020-01', 2),
      point('2021-01', 5),
      point('2022-01', 8),
      point('2023-01', 20),
    ];
    expect(seasonalComparison(data, 'a', 2025)[0]?.reference).toBe(6.5);
  });

  it('preserva ausência e não busca anos fora da janela para completar amostra', () => {
    const rows = seasonalComparison(
      [point('2019-01', 2), point('2021-01', 4), point('2024-01', 6)],
      'a',
      2025,
    );
    expect(rows[0]).toMatchObject({
      observed: null,
      reference: null,
      sampleSize: 2,
      historicalMin: null,
      historicalMax: null,
      differencePercent: null,
    });
    expect(rows[11]).toMatchObject({
      competencia: '2025-12',
      observed: null,
      reference: null,
      sampleSize: 0,
    });
    expect(seasonalComparison([], 'a', 2025).every((row) => row.observed === null)).toBe(true);
  });

  it('aceita zero explícito e evita divisão por referência zero', () => {
    const zeros = [point('2020-01', 0), point('2021-01', 0), point('2022-01', 0)];
    expect(seasonalComparison([...zeros, point('2025-01', 5)], 'a', 2025)[0]).toMatchObject({
      reference: 0,
      historicalMin: 0,
      historicalMax: 0,
      observed: 5,
      differencePercent: null,
    });
    const history = [point('2020-01', 10), point('2021-01', 20), point('2022-01', 30)];
    expect(seasonalComparison([...history, point('2025-01', 0)], 'a', 2025)[0]).toMatchObject({
      observed: 0,
      differencePercent: -100,
    });
    expect(seasonalComparison(history, 'a', 2025)[0]).toMatchObject({
      observed: null,
      reference: 20,
      differencePercent: null,
    });
  });

  it('ignora datas e volumes inválidos', () => {
    for (const row of [
      point('2024-13', 1),
      point('2024-00', 1),
      point('2024-1', 1),
      point('bad', 1),
      point('2024-01', -1),
      point('2024-01', NaN),
      point('2024-01', Infinity),
    ]) {
      expect(isSeasonalObservation(row)).toBe(false);
      expect(seasonalComparison([row], 'a', 2025).every((month) => month.sampleSize === 0)).toBe(
        true,
      );
    }
  });
});
