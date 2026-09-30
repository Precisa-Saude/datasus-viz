import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AnomalyHitList } from '@/components/AnomalyHitList';
import type { AnomalyHit } from '@/lib/anomaly';

const HIT: AnomalyHit = {
  baseline: 38,
  competencia: '2018-10',
  details: {},
  kind: 'spike',
  loinc: '4537-7',
  municipioCode: '431060',
  municipioNome: 'Itaqui',
  observed: 902028,
  score: 9,
  ufSigla: 'RS',
};

function renderList(props: Partial<React.ComponentProps<typeof AnomalyHitList>> = {}) {
  return render(
    <MemoryRouter>
      <AnomalyHitList
        baselineLabel="baseline (mediana)"
        color="#7c3aed"
        formatValue={(v) => `v${v}`}
        hitKey={(h) => h.municipioCode}
        hits={[HIT]}
        labelForLoinc={(l) => `Exame ${l}`}
        urlFor={(h) => `/mun/${h.municipioCode}`}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('AnomalyHitList', () => {
  it('mostra lugar, mês, exame e observado × referência num link para o município', () => {
    renderList();
    const link = screen.getByText('Itaqui').closest('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/mun/431060');
    expect(screen.getByText(/· RS/)).toBeInTheDocument();
    expect(screen.getByText('Exame 4537-7')).toBeInTheDocument();
    expect(screen.getByText('v902028')).toBeInTheDocument();
    expect(screen.getByText(/v38 baseline \(mediana\)/)).toBeInTheDocument();
  });

  it('botão CNES dispara onHitSelect e reflete a seleção', () => {
    const onHitSelect = vi.fn();
    renderList({ onHitSelect, selectedHitKey: '431060' });
    const button = screen.getByRole('button', { name: /Itaqui/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(onHitSelect).toHaveBeenCalledWith(HIT);
  });

  it('sem onHitSelect não mostra o botão', () => {
    renderList();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
