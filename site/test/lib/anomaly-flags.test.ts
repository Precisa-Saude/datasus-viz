import { describe, expect, it } from 'vitest';

import type { AnomalyHit } from '@/lib/anomaly';
import { buildAnomalyFlagIndex, flagsForMunicipio, KIND_LABEL } from '@/lib/anomaly-flags';

function hit(over: Partial<AnomalyHit>): AnomalyHit {
  return {
    baseline: 0,
    competencia: '2022-06',
    details: {},
    kind: 'concentration',
    loinc: '2498-4',
    municipioCode: '311360',
    municipioNome: 'Careaçu',
    observed: 0,
    score: 1,
    ufSigla: 'MG',
    ...over,
  };
}

describe('buildAnomalyFlagIndex', () => {
  it('agrupa por município → competência → detector', () => {
    const index = buildAnomalyFlagIndex({ concentration: [hit({})] });
    expect(index['311360']?.['2022-06']?.concentration).toEqual(['2498-4']);
  });

  it('normaliza o código para 6 dígitos', () => {
    const index = buildAnomalyFlagIndex({ concentration: [hit({ municipioCode: '3113602' })] });
    expect(Object.keys(index)).toEqual(['311360']);
  });

  it('não duplica o mesmo LOINC repetido no mesmo bucket', () => {
    const index = buildAnomalyFlagIndex({ concentration: [hit({}), hit({})] });
    expect(index['311360']?.['2022-06']?.concentration).toEqual(['2498-4']);
  });

  it('acumula LOINCs distintos e detectores distintos', () => {
    const index = buildAnomalyFlagIndex({
      concentration: [hit({}), hit({ loinc: '2093-3' })],
      spike: [hit({ kind: 'spike' })],
    });
    expect(index['311360']?.['2022-06']?.concentration).toEqual(['2498-4', '2093-3']);
    expect(index['311360']?.['2022-06']?.spike).toEqual(['2498-4']);
  });

  it('devolve índice vazio sem hits', () => {
    expect(buildAnomalyFlagIndex({ concentration: [] })).toEqual({});
  });
});

describe('flagsForMunicipio', () => {
  const index = buildAnomalyFlagIndex({
    concentration: [hit({}), hit({ competencia: '2024-01' })],
    spike: [hit({ competencia: '2019-05', kind: 'spike' })],
  });

  it('filtra pela faixa fechada de competências', () => {
    const r = flagsForMunicipio(index, '311360', { from: '2022-01', to: '2022-12' });
    expect(r).toEqual([{ competencia: '2022-06', kind: 'concentration', loincs: ['2498-4'] }]);
  });

  it('inclui os extremos da faixa', () => {
    expect(flagsForMunicipio(index, '311360', { from: '2022-06', to: '2022-06' })).toHaveLength(1);
  });

  it('ordena por competência', () => {
    const r = flagsForMunicipio(index, '311360', { from: '2008-01', to: '2026-12' });
    expect(r.map((f) => f.competencia)).toEqual(['2019-05', '2022-06', '2024-01']);
  });

  it('aceita código de 7 dígitos', () => {
    expect(flagsForMunicipio(index, '3113602', { from: '2022-06', to: '2022-06' })).toHaveLength(1);
  });

  it('devolve vazio para município sem anomalia', () => {
    expect(flagsForMunicipio(index, '355030', { from: '2008-01', to: '2026-12' })).toEqual([]);
  });

  it('devolve vazio quando a faixa não cobre nenhuma competência', () => {
    expect(flagsForMunicipio(index, '311360', { from: '2023-01', to: '2023-12' })).toEqual([]);
  });
});

describe('KIND_LABEL', () => {
  it('tem rótulo para todos os detectores', () => {
    expect(Object.keys(KIND_LABEL).sort()).toEqual([
      'concentration',
      'per-capita',
      'price-ratio',
      'spike',
    ]);
  });
});
