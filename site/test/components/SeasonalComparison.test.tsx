import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SeasonalComparison } from '@/components/SeasonalComparison';
import type { TrendSeries } from '@/components/TrendChart';
import type { ComboboxProps } from '@/components/ui/combobox';
import type { AggregateIndex } from '@/lib/aggregates';
import type { TrendPoint } from '@/lib/queries';

vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({ ariaLabel, items, onChange, value }: ComboboxProps) => (
    <select
      aria-label={ariaLabel}
      disabled={items.length === 0}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('recharts', () => {
  const Container = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return {
    CartesianGrid: () => null,
    Legend: () => null,
    Line: () => null,
    LineChart: Container,
    ReferenceLine: () => null,
    ResponsiveContainer: Container,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
  };
});

const manifest: AggregateIndex = {
  availableUFs: ['SP'],
  biomarkers: [],
  competencias: ['2025-01'],
  geradoEm: '2025-02-01T00:00:00Z',
  years: [2025],
};
const series: TrendSeries[] = [
  { id: 'a', label: 'Exame A', color: '#7c3aed' },
  { id: 'b', label: 'Exame B', color: '#10b981' },
];
const point = (competencia: string, volumeExames: number, seriesId = 'a'): TrendPoint => ({
  competencia,
  volumeExames,
  seriesId,
  valorAprovadoBRL: 0,
});
const data = [
  point('2020-01', 10),
  point('2021-01', 20),
  point('2022-01', 30),
  point('2025-01', 40),
  point('2024-01', 0, 'b'),
];

function panel(rows = data, items = series) {
  return (
    <MemoryRouter>
      <SeasonalComparison data={rows} manifest={manifest} scope="SP" series={items} />
    </MemoryRouter>
  );
}

describe('SeasonalComparison', () => {
  it('mantém controles externos e tabela histórica em card separado', () => {
    render(panel());
    const plot = screen.getByLabelText('Comparação mensal; valores disponíveis na tabela abaixo');
    const table = screen.getByRole('table', { name: /Comparação mensal/ });
    const chartCard = screen.getByRole('region', { name: 'Observado vs. referência sazonal' });
    const tableCard = screen.getByRole('region', { name: 'Tabela de comparação sazonal' });
    const controls = screen.getByRole('group', { name: 'Controles da comparação sazonal' });
    expect(chartCard).not.toContainElement(controls);
    expect(chartCard).not.toContainElement(
      screen.getByRole('heading', { name: 'Observado vs. referência sazonal' }),
    );
    expect(within(controls).getAllByRole('combobox')).toHaveLength(3);
    expect(
      controls.compareDocumentPosition(chartCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(chartCard).toContainElement(plot);
    expect(chartCard).not.toContainElement(table);
    expect(tableCard).toContainElement(table);
    expect(plot.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual([
      'Mês',
      'Observado',
      'Mediana histórica',
      'Amplitude histórica',
      'Anos com registro',
      'Variação',
    ]);
  });

  it('permite alternar para desvio percentual sem alterar a referência da tabela', () => {
    render(panel());
    fireEvent.change(screen.getByRole('combobox', { name: 'Visualização sazonal' }), {
      target: { value: 'deviation' },
    });
    expect(screen.getByText(/Zero = referência histórica/)).toBeInTheDocument();
    expect(
      within(screen.getByRole('rowheader', { name: 'Jan' }).closest('tr')!).getByText('+100%'),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Visualização sazonal' }), {
      target: { value: 'volume' },
    });
    expect(screen.queryByText(/Zero = referência histórica/)).not.toBeInTheDocument();
  });

  it('exibe observado, referência, amplitude e tamanho da amostra com avisos', () => {
    render(panel());
    expect(
      screen.getByRole('heading', { name: 'Observado vs. referência sazonal' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Ano observado' })).toHaveValue('2025');
    const january = within(screen.getByRole('rowheader', { name: 'Jan' }).closest('tr')!);
    for (const text of ['40', '20', '10 a 30', '3/5', '+100%'])
      expect(january.getByText(text)).toBeInTheDocument();
    expect(screen.getByText(/Lacunas não são zeros/)).toBeInTheDocument();
    expect(screen.getByText(/não intervalo de previsão/)).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
    expect(screen.getByText(/ainda pode ser revisado/)).toBeInTheDocument();
  });

  it('troca ano e série sem misturar o histórico', () => {
    render(panel());
    fireEvent.change(screen.getByRole('combobox', { name: 'Ano observado' }), {
      target: { value: '2022' },
    });
    expect(screen.getByRole('status')).toHaveTextContent('Histórico insuficiente');
    fireEvent.change(screen.getByRole('combobox', { name: 'Série sazonal' }), {
      target: { value: 'b' },
    });
    expect(screen.getByRole('combobox', { name: 'Ano observado' })).toHaveValue('2024');
    const january = within(screen.getByRole('rowheader', { name: 'Jan' }).closest('tr')!);
    expect(january.getByText('0')).toBeInTheDocument();
    expect(january.getByText('0/5')).toBeInTheDocument();
    expect(screen.queryByText('+100%')).not.toBeInTheDocument();
  });

  it('reconcilia filtros quando a série selecionada é removida', () => {
    const { rerender } = render(panel());
    fireEvent.change(screen.getByRole('combobox', { name: 'Série sazonal' }), {
      target: { value: 'b' },
    });
    rerender(
      panel(
        data.filter((row) => row.seriesId === 'a'),
        [series[0]!],
      ),
    );
    expect(screen.getByRole('combobox', { name: 'Série sazonal' })).toHaveValue('a');
    expect(screen.getByRole('combobox', { name: 'Ano observado' })).toHaveValue('2025');
  });

  it('mostra referência zero e ausência de observado sem percentuais fabricados', () => {
    render(
      panel([point('2020-01', 0), point('2021-01', 0), point('2022-01', 0), point('2025-01', 5)]),
    );
    expect(screen.getByText('Referência zero')).toBeInTheDocument();
    expect(screen.getAllByText('Sem registro').length).toBeGreaterThan(0);
  });

  it('exibe estado vazio sem séries ou sem observações válidas', () => {
    const { rerender } = render(panel([], []));
    expect(screen.getByText('Sem dados para a comparação sazonal.')).toBeInTheDocument();
    rerender(panel([point('invalid', 2)]));
    expect(screen.getByText('Sem dados para a comparação sazonal.')).toBeInTheDocument();
  });
});
