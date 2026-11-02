import { describe, expect, it } from 'vitest';

import type { SeasonalMonth } from '@/lib/seasonal';
import { seasonalChartRows, symmetricPercentDomain } from '@/lib/seasonal-presentation';

const row: SeasonalMonth = {
  competencia: '2024-01',
  differencePercent: 20,
  observed: 120,
  reference: 100,
  historicalMin: 80,
  historicalMax: 130,
  sampleSize: 5,
};

describe('dados da apresentação sazonal', () => {
  it('preserva produção e referência histórica na vista de volume', () => {
    expect(seasonalChartRows([row], 'volume')[0]).toEqual({
      competencia: '2024-01',
      observed: 120,
      reference: 100,
    });
  });

  it('converte observado em percentual relativo à referência histórica', () => {
    const result = seasonalChartRows([row], 'deviation')[0]!;
    expect(result.observed).toBe(20);
    expect(result.reference).toBeNull();
    expect(seasonalChartRows([{ ...row, observed: 0 }], 'deviation')[0]?.observed).toBe(-100);
  });

  it('não fabrica desvio quando referência é ausente/zero ou observado está ausente', () => {
    for (const reference of [0, null]) {
      expect(seasonalChartRows([{ ...row, reference }], 'deviation')[0]).toEqual({
        competencia: '2024-01',
        observed: null,
        reference: null,
      });
    }
    expect(seasonalChartRows([{ ...row, observed: null }], 'deviation')[0]?.observed).toBeNull();
  });

  it('centraliza o eixo em zero sem eliminar valores extremos', () => {
    expect(symmetricPercentDomain([-20, 50])).toEqual([-50, 50]);
    expect(symmetricPercentDomain([-200, 5])).toEqual([-200, 200]);
    expect(symmetricPercentDomain([0, 0])).toEqual([-1, 1]);
    expect(symmetricPercentDomain([Infinity, -Infinity])).toEqual([-1, 1]);
    expect(symmetricPercentDomain([NaN, NaN])).toEqual([-1, 1]);
  });
});
