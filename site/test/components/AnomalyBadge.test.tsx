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
    expect(tooltip).toHaveTextContent(/Em Jun\. 2022, este município destoa do padrão em:/);
    expect(tooltip).toHaveTextContent(/como o DATASUS os publicou/i);

    // Sem travessão: o exame vem logo depois de "em".
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'concentração muito acima da proporção populacional em Ferro',
    );

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

  it('lista uma linha por anomalia quando há mais de uma', () => {
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
    const itens = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(itens).toEqual([
      '•concentração muito acima da proporção populacional em Ferro',
      '•pico atípico frente ao histórico do próprio município em Colesterol Total',
    ]);
  });

  it('prefixa a competência quando a faixa cobre mais de uma', () => {
    render(
      <AnomalyBadge
        biomarkersByLoinc={BIOMARKERS}
        flags={[
          { competencia: '2022-06', kind: 'concentration', loincs: ['2498-4'] },
          { competencia: '2023-01', kind: 'concentration', loincs: ['2093-3'] },
        ]}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole('button', { name: /volume atípico/i }));
    expect(screen.getByRole('tooltip')).toHaveTextContent(/destoam do padrão:/);
    const itens = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(itens[0]).toContain('Jun. 2022:');
    expect(itens[1]).toContain('Jan. 2023:');
  });

  it('trunca a lista de exames de um item em quatro', () => {
    render(
      <AnomalyBadge
        biomarkersByLoinc={{ a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' }}
        flags={[{ competencia: '2022-06', kind: 'spike', loincs: ['a', 'b', 'c', 'd', 'e'] }]}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole('button', { name: /volume atípico/i }));
    expect(screen.getByRole('listitem')).toHaveTextContent('A, B, C, D e mais 1');
  });

  it('agrega por detector quando passa de seis anomalias', () => {
    // Numa faixa larga, listar competência a competência vira uma
    // parede de linhas quase idênticas — o que importa é qual detector
    // disparou e com que frequência.
    const flags = [
      ...Array.from({ length: 8 }, (_, i) => ({
        competencia: `2022-0${String(i + 1)}`,
        kind: 'spike' as const,
        loincs: ['2498-4'],
      })),
      { competencia: '2022-01', kind: 'concentration' as const, loincs: ['2093-3'] },
    ];
    render(<AnomalyBadge biomarkersByLoinc={BIOMARKERS} flags={flags} />);
    fireEvent.mouseEnter(screen.getByRole('button', { name: /volume atípico/i }));
    const itens = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(itens).toEqual([
      '•pico atípico frente ao histórico do próprio município em 8 competências',
      '•concentração muito acima da proporção populacional em 1 competência',
    ]);
    expect(screen.getByRole('tooltip')).not.toHaveTextContent('e mais');
  });
});
