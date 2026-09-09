import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnomalyBadge } from '@/components/AnomalyBadge';
import type { ResolvedFlag } from '@/lib/anomaly-flags';

const FLAGS: ResolvedFlag[] = [
  { competencia: '2022-06', kind: 'concentration', loincs: ['2498-4'] },
];
const BIOMARKERS = { '2093-3': 'Colesterol Total', '2498-4': 'Ferro' };

describe('AnomalyBadge', () => {
  it('não renderiza nada sem anomalias', () => {
    const { container } = render(<AnomalyBadge biomarkersByLoinc={BIOMARKERS} flags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o botão de alerta quando há anomalia', () => {
    render(<AnomalyBadge biomarkersByLoinc={BIOMARKERS} flags={FLAGS} />);
    expect(screen.getByRole('button', { name: /volume atípico/i })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('abre o tooltip no hover e fecha ao sair', () => {
    render(<AnomalyBadge biomarkersByLoinc={BIOMARKERS} flags={FLAGS} />);
    const botao = screen.getByRole('button', { name: /volume atípico/i });

    fireEvent.mouseEnter(botao);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Volume atípico');
    expect(tooltip).toHaveTextContent(/concentração incomum/i);
    expect(tooltip).toHaveTextContent('Ferro');
    expect(tooltip).toHaveTextContent(/como o DATASUS os publicou/i);

    fireEvent.mouseLeave(botao);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('abre no foco por teclado e fecha com Escape', () => {
    render(<AnomalyBadge biomarkersByLoinc={BIOMARKERS} flags={FLAGS} />);
    const botao = screen.getByRole('button', { name: /volume atípico/i });

    fireEvent.focus(botao);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(botao).toHaveAttribute('aria-describedby');

    fireEvent.keyDown(botao, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('nomeia os exames e agrega detectores distintos', () => {
    render(
      <AnomalyBadge
        biomarkersByLoinc={BIOMARKERS}
        flags={[
          { competencia: '2022-06', kind: 'concentration', loincs: ['2498-4'] },
          { competencia: '2022-06', kind: 'spike', loincs: ['2093-3'] },
        ]}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole('button', { name: /volume atípico/i }));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Ferro, Colesterol Total');
    expect(tooltip).toHaveTextContent(/concentração incomum .* e .*pico atípico/i);
  });

  it('trunca a lista de exames em três', () => {
    render(
      <AnomalyBadge
        biomarkersByLoinc={{ a: 'A', b: 'B', c: 'C', d: 'D' }}
        flags={[{ competencia: '2022-06', kind: 'spike', loincs: ['a', 'b', 'c', 'd'] }]}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole('button', { name: /volume atípico/i }));
    expect(screen.getByRole('tooltip')).toHaveTextContent('A, B, C e mais 1');
  });
});
