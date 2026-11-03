import { describe, expect, it } from 'vitest';

import type { SeasonalMonth } from '@/lib/seasonal';
import {
  seasonalChartRows,
  seasonalSeriesOptions,
  symmetricPercentDomain,
} from '@/lib/seasonal-presentation';

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

describe('séries disponíveis no painel sazonal', () => {
  const labels: Record<string, string> = {
    '2160-0': 'Creatinina',
    '2345-7': 'Glicose',
    '718-7': 'Hemoglobina',
  };
  const options = seasonalSeriesOptions(
    [
      { color: '#f59e0b', id: '2345-7' },
      { color: '#7c3aed', id: '2160-0' },
    ],
    ['2160-0', '2345-7', '718-7'],
    (id) => labels[id] ?? id,
    '#999',
  );

  it('lista os slots primeiro, com a cor deles, e depois todas as demais séries', () => {
    expect(options.map((o) => o.id)).toEqual(['2345-7', '2160-0', '718-7']);
    expect(options.map((o) => o.color)).toEqual(['#f59e0b', '#7c3aed', '#999']);
  });

  it('rotula cada série e não duplica ids presentes nos dois lados', () => {
    expect(options.map((o) => o.label)).toEqual(['Glicose', 'Creatinina', 'Hemoglobina']);
    expect(new Set(options.map((o) => o.id)).size).toBe(options.length);
  });

  it('sem slots, oferece todas as séries com a cor de fallback', () => {
    const all = seasonalSeriesOptions([], ['SP', 'RJ'], (id) => id, '#999');
    expect(all).toEqual([
      { color: '#999', id: 'SP', label: 'SP' },
      { color: '#999', id: 'RJ', label: 'RJ' },
    ]);
  });
});
