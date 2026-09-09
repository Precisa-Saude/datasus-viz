import type maplibregl from 'maplibre-gl';
import { describe, expect, it, vi } from 'vitest';

import type { BinTotals } from '@/lib/data-cube';
import { buildPercentileScale, pushUfState } from '@/lib/map-layers';

interface FeatureKey {
  id: number | string;
  source: string;
  sourceLayer: string;
}

function fakeMap(): {
  map: maplibregl.Map;
  states: Map<number | string, Record<string, unknown>>;
} {
  const states = new Map<number | string, Record<string, unknown>>();
  const map = {
    removeFeatureState: vi.fn(),
    setFeatureState: vi.fn((key: FeatureKey, state: Record<string, unknown>) => {
      states.set(key.id, state);
    }),
  } as unknown as maplibregl.Map;
  return { map, states };
}

function totals(volume: number, valor = volume * 10): BinTotals {
  return { bin: 'X', label: 'X', valor, volume };
}

describe('pushUfState', () => {
  it('aplica escala de percentil: maior no topo, menor na base, meio no meio', () => {
    const { map, states } = fakeMap();
    const byUf = new Map<string, BinTotals>([
      ['SP', totals(300_000_000)],
      ['MG', totals(80_000_000)],
      ['RR', totals(1_000_000)],
    ]);

    pushUfState(map, byUf);

    const sp = states.get('SP') as { normalizado: number; rank: number };
    const mg = states.get('MG') as { normalizado: number };
    const rr = states.get('RR') as { normalizado: number };

    // A cor passou a refletir posição relativa, não razão com o máximo:
    // com três UFs, a do meio fica exatamente em 0.5 independentemente
    // de SP ter 3,75× o volume de MG. Ver `buildPercentileScale`.
    expect(sp.normalizado).toBeCloseTo(1, 5);
    expect(mg.normalizado).toBeCloseTo(0.5, 5);
    expect(rr.normalizado).toBeCloseTo(0, 5);
    expect(rr.normalizado).toBeLessThan(mg.normalizado);
  });

  it('um outlier extremo não empurra as demais UFs pro extremo pálido', () => {
    const { map, states } = fakeMap();
    const byUf = new Map<string, BinTotals>([
      ['SP', totals(300_000_000)],
      ['MG', totals(80_000_000)],
      ['XX', totals(50_000_000_000)],
    ]);

    pushUfState(map, byUf);

    // Na escala antiga (`sqrt(v/max)`), SP cairia pra ~0.077 — faixa
    // mais clara do ramp — só porque XX existe.
    expect((states.get('SP') as { normalizado: number }).normalizado).toBeCloseTo(0.5, 5);
    expect((states.get('XX') as { normalizado: number }).normalizado).toBeCloseTo(1, 5);
  });

  it('persiste rank competition-style + rankTotal no feature state', () => {
    const { map, states } = fakeMap();
    const byUf = new Map<string, BinTotals>([
      ['SP', totals(300)],
      ['MG', totals(80)],
      ['RJ', totals(80)], // empate com MG
      ['RR', totals(1)],
    ]);

    pushUfState(map, byUf);

    expect((states.get('SP') as { rank: number }).rank).toBe(1);
    expect((states.get('MG') as { rank: number }).rank).toBe(2);
    expect((states.get('RJ') as { rank: number }).rank).toBe(2);
    // Empate em 2/2 → próxima posição pula pra 4 (competition rank).
    expect((states.get('RR') as { rank: number }).rank).toBe(4);
    expect((states.get('SP') as { rankTotal: number }).rankTotal).toBe(4);
  });

  it('lida com byUf vazio sem explodir', () => {
    const { map } = fakeMap();
    expect(() => pushUfState(map, new Map())).not.toThrow();
  });
});

describe('buildPercentileScale', () => {
  it('mapeia o menor para 0 e o maior para 1', () => {
    const scale = buildPercentileScale([10, 20, 30]);
    expect(scale(10)).toBe(0);
    expect(scale(30)).toBe(1);
    expect(scale(20)).toBeCloseTo(0.5);
  });

  it('dá a mesma cor para valores empatados', () => {
    const scale = buildPercentileScale([5, 5, 5, 100]);
    expect(scale(5)).toBe(0);
    expect(scale(100)).toBe(1);
  });

  it('é imune a outlier — a posição dos demais não muda', () => {
    // Regressão do caso Careaçu-MG: um registro de 223.415 exames num
    // município de ~6.800 habitantes empurrava o resto do estado pro
    // branco na escala antiga (`sqrt(v / max)`).
    const base = [1, 2, 3, 4];
    const semOutlier = buildPercentileScale(base);
    const comOutlier = buildPercentileScale([...base, 223_415]);
    expect(comOutlier(1)).toBe(semOutlier(1));
    expect(comOutlier(3)).toBeCloseTo(0.5);
    expect(comOutlier(223_415)).toBe(1);
  });

  it('espalha uma distribuição de cauda longa pelas quatro faixas', () => {
    // Com `sqrt(v/max)` esta distribuição colocaria quase tudo na faixa
    // mais clara; por percentil, cada quartil recebe uma faixa.
    const valores = [1, 2, 3, 5, 8, 13, 100, 5_000, 1_268_476];
    const scale = buildPercentileScale(valores);
    const faixas = valores.map((v) => Math.min(3, Math.floor(scale(v) * 4)));
    expect(new Set(faixas).size).toBe(4);
  });

  it('devolve 1 para lista de um elemento e 0 para lista vazia', () => {
    expect(buildPercentileScale([42])(42)).toBe(1);
    expect(buildPercentileScale([])(0)).toBe(0);
  });

  it('não muta o array recebido', () => {
    const valores = [30, 10, 20];
    buildPercentileScale(valores);
    expect(valores).toEqual([30, 10, 20]);
  });
});
