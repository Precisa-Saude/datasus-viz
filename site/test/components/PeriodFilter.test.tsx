import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PeriodFilter } from '@/components/PeriodFilter';
import type { PeriodFilter as PeriodFilterState } from '@/lib/use-period-filter';

const COMPETENCIAS = ['2023-01', '2023-02', '2023-03'];

function state(overrides: Partial<PeriodFilterState> = {}): PeriodFilterState {
  return {
    commit: vi.fn(),
    committed: null,
    display: { from: '2023-01', to: '2023-03' },
    effective: null,
    preview: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

describe('PeriodFilter', () => {
  it('não renderiza sem faixa para desenhar', () => {
    const { container } = render(
      <PeriodFilter competencias={[]} hits={[]} period={state({ display: null })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('na série inteira explica o duplo clique e não oferece limpar', () => {
    render(<PeriodFilter competencias={COMPETENCIAS} hits={[]} period={state()} />);
    expect(screen.getByText(/duplo clique volta à série inteira/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver série inteira' })).not.toBeInTheDocument();
  });

  it('com recorte ativo oferece voltar à série inteira', () => {
    const period = state({ committed: { from: '2023-02', to: '2023-03' } });
    render(<PeriodFilter competencias={COMPETENCIAS} hits={[]} period={period} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver série inteira' }));
    expect(period.reset).toHaveBeenCalled();
  });
});
