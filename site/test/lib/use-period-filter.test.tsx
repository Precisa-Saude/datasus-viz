import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { inPeriod, usePeriodFilter } from '@/lib/use-period-filter';

const COMPETENCIAS = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05'];

function setup(query = '', competencias: string[] | undefined = COMPETENCIAS) {
  return renderHook(() => usePeriodFilter(competencias, new URLSearchParams(query)));
}

describe('inPeriod', () => {
  it('aceita tudo sem faixa e respeita os dois extremos com faixa', () => {
    expect(inPeriod('2010-01', null)).toBe(true);
    const range = { from: '2023-02', to: '2023-04' };
    expect(inPeriod('2023-01', range)).toBe(false);
    expect(inPeriod('2023-02', range)).toBe(true);
    expect(inPeriod('2023-04', range)).toBe(true);
    expect(inPeriod('2023-05', range)).toBe(false);
  });
});

describe('usePeriodFilter', () => {
  it('começa na série inteira, fora da URL', () => {
    const { result } = setup();
    expect(result.current.committed).toBeNull();
    expect(result.current.effective).toBeNull();
    expect(result.current.display).toEqual({ from: '2023-01', to: '2023-05' });
  });

  it('lê uma faixa válida da URL', () => {
    const { result } = setup('from=2023-02&to=2023-03');
    expect(result.current.committed).toEqual({ from: '2023-02', to: '2023-03' });
    expect(result.current.display).toEqual({ from: '2023-02', to: '2023-03' });
  });

  it('ignora faixa invertida ou fora da série', () => {
    expect(setup('from=2023-04&to=2023-02').result.current.committed).toBeNull();
    expect(setup('from=2020-01&to=2023-02').result.current.committed).toBeNull();
    expect(setup('from=2023-01').result.current.committed).toBeNull();
  });

  it('sem competências não desenha o brush', () => {
    expect(setup('', []).result.current.display).toBeNull();
  });

  it('prévia vale durante o arraste e some ao confirmar', () => {
    const { result } = setup();
    act(() => result.current.preview({ from: '2023-02', to: '2023-03' }));
    expect(result.current.effective).toEqual({ from: '2023-02', to: '2023-03' });
    expect(result.current.committed).toBeNull();
    act(() => result.current.commit({ from: '2023-03', to: '2023-04' }));
    expect(result.current.committed).toEqual({ from: '2023-03', to: '2023-04' });
    expect(result.current.effective).toEqual({ from: '2023-03', to: '2023-04' });
  });

  it('confirmar a série inteira equivale a limpar o filtro', () => {
    const { result } = setup('from=2023-02&to=2023-03');
    act(() => result.current.commit({ from: '2023-01', to: '2023-05' }));
    expect(result.current.committed).toBeNull();
  });

  it('reset volta à série inteira, mesmo com faixa na URL', () => {
    const { result } = setup('from=2023-02&to=2023-03');
    act(() => result.current.reset());
    expect(result.current.committed).toBeNull();
    expect(result.current.display).toEqual({ from: '2023-01', to: '2023-05' });
  });
});
