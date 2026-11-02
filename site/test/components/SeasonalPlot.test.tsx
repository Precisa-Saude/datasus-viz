import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SeasonalPlot } from '@/components/SeasonalPlot';
import type { SeasonalMonth } from '@/lib/seasonal';

vi.mock('recharts', () => {
  const Container = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return {
    CartesianGrid: () => null,
    LineChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
      <div data-testid="chart" data-rows={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Legend: () => null,
    Line: ({ name }: { name: string }) => <span data-testid="series-line">{name}</span>,
    ReferenceLine: ({ y }: { y: number }) => <span data-testid="zero-line">{y}</span>,
    ResponsiveContainer: Container,
    Tooltip: ({ formatter }: { formatter: (value: number) => string }) => (
      <span data-testid="tooltip">{formatter(10)}</span>
    ),
    XAxis: ({ tickFormatter }: { tickFormatter: (value: string) => string }) => (
      <span>
        {tickFormatter('2024-01')} {tickFormatter('bad')}
      </span>
    ),
    YAxis: ({
      domain,
      tickFormatter,
    }: {
      domain?: (range: [number, number]) => [number, number];
      tickFormatter: (value: number) => string;
    }) => (
      <span data-testid="axis" data-domain={JSON.stringify(domain?.([-5, 15]))}>
        {tickFormatter(25)}
      </span>
    ),
  };
});

const rows: SeasonalMonth[] = [
  {
    competencia: '2024-01',
    differencePercent: 20,
    observed: 120,
    reference: 100,
    historicalMin: 80,
    historicalMax: 130,
    sampleSize: 5,
  },
];
describe('SeasonalPlot', () => {
  it('desenha somente a produção observada e a mediana histórica', () => {
    render(<SeasonalPlot color="#7c3aed" rows={rows} view="volume" />);
    expect(screen.getByText('Produção observada')).toBeInTheDocument();
    expect(screen.getByText('Mediana histórica')).toBeInTheDocument();
    expect(screen.getAllByTestId('series-line')).toHaveLength(2);
    expect(JSON.parse(screen.getByTestId('chart').dataset.rows!)[0]).toEqual({
      competencia: '2024-01',
      observed: 120,
      reference: 100,
    });
    expect(screen.getByTestId('tooltip')).toHaveTextContent('10');
    expect(screen.queryByTestId('zero-line')).not.toBeInTheDocument();
  });

  it('mostra desvio percentual com zero e eixo simétrico', () => {
    render(<SeasonalPlot color="#7c3aed" rows={rows} view="deviation" />);
    expect(screen.getByTestId('zero-line')).toHaveTextContent('0');
    expect(screen.getByTestId('axis')).toHaveAttribute('data-domain', '[-15,15]');
    expect(screen.getByTestId('axis')).toHaveTextContent('25%');
    expect(screen.getByTestId('tooltip')).toHaveTextContent('10%');
    expect(screen.getByText('Desvio da produção observada')).toBeInTheDocument();
    expect(screen.queryByText('Mediana histórica')).not.toBeInTheDocument();
  });
});
