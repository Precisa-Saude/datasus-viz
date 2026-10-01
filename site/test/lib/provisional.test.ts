import { describe, expect, it } from 'vitest';

import {
  firstProvisionalCompetencia,
  provisionalOverlap,
  REVISION_WINDOW,
} from '@/lib/provisional';

function months(from: string, count: number): string[] {
  const [y, m] = from.split('-').map(Number) as [number, number];
  return Array.from({ length: count }, (_, i) => {
    const total = y * 12 + (m - 1) + i;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  });
}

describe('firstProvisionalCompetencia', () => {
  it('é a 13ª competência a partir da mais recente', () => {
    const comps = months('2008-01', 223); // 2008-01 … 2026-07
    expect(comps.at(-1)).toBe('2026-07');
    expect(firstProvisionalCompetencia(comps)).toBe('2025-07');
  });

  it('não depende da ordem da lista', () => {
    const comps = months('2025-01', 20).reverse();
    expect(firstProvisionalCompetencia(comps)).toBe('2025-08');
  });

  it('com menos competências que a janela, todas são provisórias', () => {
    expect(firstProvisionalCompetencia(months('2026-01', 5))).toBe('2026-01');
    expect(REVISION_WINDOW).toBe(13);
  });

  it('devolve null sem competências', () => {
    expect(firstProvisionalCompetencia([])).toBeNull();
  });
});

describe('provisionalOverlap', () => {
  const first = '2025-07';

  it('recorta a faixa à janela revisável', () => {
    expect(provisionalOverlap({ from: '2025-01', to: '2026-07' }, first)).toEqual({
      from: '2025-07',
      to: '2026-07',
    });
  });

  it('mantém a faixa inteira quando ela já está dentro da janela', () => {
    expect(provisionalOverlap({ from: '2026-01', to: '2026-07' }, first)).toEqual({
      from: '2026-01',
      to: '2026-07',
    });
  });

  it('devolve null quando a faixa termina antes da janela', () => {
    expect(provisionalOverlap({ from: '2020-01', to: '2025-06' }, first)).toBeNull();
  });

  it('inclui a faixa que termina exatamente no início da janela', () => {
    expect(provisionalOverlap({ from: '2025-01', to: '2025-07' }, first)).toEqual({
      from: '2025-07',
      to: '2025-07',
    });
  });

  it('devolve null sem janela conhecida', () => {
    expect(provisionalOverlap({ from: '2025-01', to: '2026-07' }, null)).toBeNull();
  });
});
