import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { DataFreshness, formatGeradoEm } from '@/components/DataFreshness';
import type { AggregateIndex } from '@/lib/aggregates';

function competencias(from: string, count: number): string[] {
  const [y, m] = from.split('-').map(Number) as [number, number];
  return Array.from({ length: count }, (_, i) => {
    const total = y * 12 + (m - 1) + i;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  });
}

const manifest = {
  availableUFs: ['AC'],
  biomarkers: [],
  competencias: competencias('2024-01', 31), // 2024-01 … 2026-07
  geradoEm: '2026-10-01T16:49:14.258Z',
  parquetOptVersion: 'v20261001T164914',
  years: [2024, 2025, 2026],
} as unknown as AggregateIndex;

function renderFreshness(from: string, to: string) {
  return render(
    <MemoryRouter>
      <DataFreshness manifest={manifest} range={{ from, to }} />
    </MemoryRouter>,
  );
}

describe('DataFreshness', () => {
  it('avisa o trecho provisório da faixa e linka para a explicação', () => {
    renderFreshness('2025-01', '2026-07');
    expect(screen.getByText('Provisório:')).toBeInTheDocument();
    expect(screen.getByText(/Jul\. 2025 – Jul\. 2026 ainda pode ser revisado/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saiba mais' })).toHaveAttribute(
      'href',
      '/sobre#revisoes',
    );
  });

  it('não avisa quando a faixa termina antes da janela revisável', () => {
    renderFreshness('2024-01', '2025-06');
    expect(screen.queryByText('Provisório:')).not.toBeInTheDocument();
  });

  it('sempre mostra a data de geração dos dados', () => {
    renderFreshness('2024-01', '2025-06');
    expect(screen.getByText('Atualizado em 01/10/2026')).toBeInTheDocument();
  });

  it('formata data inválida como travessão', () => {
    expect(formatGeradoEm('não é data')).toBe('—');
  });
});
