import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TrendPoint } from '@/lib/queries';
import {
  fetchTopLoincsByVolume,
  fetchTopUfsByVolume,
  fetchTrend,
  fetchTrendByUf,
} from '@/lib/queries';
import Tendencias from '@/pages/Tendencias';

vi.mock('@/lib/queries', () => ({
  fetchTopLoincsByVolume: vi.fn(),
  fetchTopUfsByVolume: vi.fn(),
  fetchTrend: vi.fn(),
  fetchTrendByUf: vi.fn(),
}));
vi.mock('@/lib/data-source', () => ({
  MANIFEST_URL: '/manifest.json',
  setParquetOptVersion: vi.fn(),
}));
vi.mock('@/components/TrendChart', () => ({
  TrendChart: ({ data, series }: { data: TrendPoint[]; series: { id: string }[] }) => (
    <div data-testid="overlay-data">{JSON.stringify({ data, series })}</div>
  ),
}));
vi.mock('@/components/TendenciasSlots', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/components/TendenciasSlots')>()),
  ComboboxSlots: () => null,
}));
vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({
    ariaLabel,
    items,
    onChange,
    value,
  }: {
    ariaLabel: string;
    items: { label: string; value: string }[];
    onChange: (value: string) => void;
    value: string;
  }) => (
    <select
      aria-label={ariaLabel}
      disabled={items.length === 0}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('@/components/ui/sliding-toggle', () => ({
  SlidingToggle: ({
    items,
    onChange,
  }: {
    items: { label: string; value: string }[];
    onChange: (value: string) => void;
  }) => (
    <div>
      {items.map((item) => (
        <button key={item.value} onClick={() => onChange(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
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

function rows(seriesId = 'a', volume = 40): TrendPoint[] {
  return [2020, 2021, 2022, 2025].map((year, index) => ({
    competencia: `${year}-01`,
    seriesId,
    valorAprovadoBRL: 0,
    volumeExames: index === 3 ? volume : 20,
  }));
}

function deferred() {
  let resolve!: (value: TrendPoint[]) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<TrendPoint[]>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, reject, resolve };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Tendencias />
    </MemoryRouter>,
  );
}

function january() {
  return within(screen.getByRole('rowheader', { name: 'Jan' }).closest('tr')!);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        availableUFs: ['SP', 'RJ'],
        biomarkers: [{ loinc: 'a', display: 'Exame A', code: 'a' }],
        competencias: ['2025-01'],
        geradoEm: '2025-02-01T00:00:00Z',
        years: [2025],
      }),
    }),
  );
  vi.mocked(fetchTopLoincsByVolume).mockResolvedValue(['a']);
  vi.mocked(fetchTopUfsByVolume).mockResolvedValue(['SP']);
  vi.mocked(fetchTrend).mockResolvedValue(rows());
  vi.mocked(fetchTrendByUf).mockResolvedValue(rows('SP', 80));
});

describe('Tendências com referência sazonal', () => {
  it('oferece todas as 27 UFs no painel sazonal sem ampliar o overlay nem refazer consulta', async () => {
    const ufs = [
      'AC',
      'AL',
      'AM',
      'AP',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MG',
      'MS',
      'MT',
      'PA',
      'PB',
      'PE',
      'PI',
      'PR',
      'RJ',
      'RN',
      'RO',
      'RR',
      'RS',
      'SC',
      'SE',
      'SP',
      'TO',
    ];
    const manifest = {
      availableUFs: ufs,
      biomarkers: [{ loinc: 'a', display: 'Exame A', code: 'a' }],
      competencias: ['2025-01'],
      geradoEm: '2025-02-01T00:00:00Z',
      years: [2025],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));
    vi.mocked(fetchTopUfsByVolume).mockResolvedValue(['SP', 'RJ', 'MG']);
    vi.mocked(fetchTrendByUf).mockResolvedValue(
      ufs.filter((uf) => uf !== 'TO').flatMap((uf, index) => rows(uf, 100 + index)),
    );
    renderPage();
    await screen.findByRole('table', { name: /Comparação mensal/ });
    fireEvent.click(screen.getByRole('button', { name: 'Comparar UFs' }));
    await waitFor(() => expect(fetchTrendByUf).toHaveBeenCalledWith('a', ufs));
    const selector = await screen.findByRole('combobox', { name: 'Série sazonal' });
    await waitFor(() => expect(within(selector).getAllByRole('option')).toHaveLength(27));
    fireEvent.change(selector, { target: { value: 'DF' } });
    expect(january().getByText('106')).toBeInTheDocument();
    const overlay = JSON.parse(screen.getByTestId('overlay-data').textContent!);
    expect(overlay.series.map((item: { id: string }) => item.id)).toEqual(['SP', 'RJ', 'MG']);
    expect(
      overlay.data.every((point: TrendPoint) => ['SP', 'RJ', 'MG'].includes(point.seriesId)),
    ).toBe(true);
    fireEvent.change(selector, { target: { value: 'TO' } });
    expect(screen.getByText('Sem dados para a comparação sazonal.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Ano observado' })).toBeDisabled();
    fireEvent.change(selector, { target: { value: 'AC' } });
    expect(january().getByText('100')).toBeInTheDocument();
    expect(fetchTrendByUf).toHaveBeenCalledTimes(1);
  });

  it('oferece todos os exames no painel sazonal sem ampliar o overlay nem refazer consulta', async () => {
    const biomarkers = ['a', 'b', 'c', 'd'].map((loinc) => ({
      code: loinc,
      display: `Exame ${loinc.toUpperCase()}`,
      loinc,
    }));
    const manifest = {
      availableUFs: ['SP', 'RJ'],
      biomarkers,
      competencias: ['2025-01'],
      geradoEm: '2025-02-01T00:00:00Z',
      years: [2025],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));
    vi.mocked(fetchTopLoincsByVolume).mockResolvedValue(['a', 'b', 'c']);
    vi.mocked(fetchTrend).mockResolvedValue(
      ['a', 'b', 'c', 'd'].flatMap((loinc, index) => rows(loinc, 100 + index)),
    );
    renderPage();
    await screen.findByRole('table', { name: /Comparação mensal/ });
    expect(fetchTrend).toHaveBeenCalledWith(['a', 'b', 'c', 'd'], null);
    const selector = screen.getByRole('combobox', { name: 'Série sazonal' });
    expect(
      within(selector)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Exame A', 'Exame B', 'Exame C', 'Exame D']);
    fireEvent.change(selector, { target: { value: 'd' } });
    expect(january().getByText('103')).toBeInTheDocument();
    const overlay = JSON.parse(screen.getByTestId('overlay-data').textContent!);
    expect(overlay.series.map((item: { id: string }) => item.id)).toEqual(['a', 'b', 'c']);
    expect(
      overlay.data.every((point: TrendPoint) => ['a', 'b', 'c'].includes(point.seriesId)),
    ).toBe(true);
    expect(fetchTrend).toHaveBeenCalledTimes(1);
  });

  it('reutiliza dados e filtros nos modos de exame e UF', async () => {
    renderPage();
    await screen.findByRole('table', { name: /Comparação mensal/ });
    expect(fetchTrend).toHaveBeenCalledWith(['a'], null);
    expect(january().getByText('+100%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Comparar UFs' }));
    await waitFor(() => expect(fetchTrendByUf).toHaveBeenCalledWith('a', ['SP', 'RJ']));
    await waitFor(() => expect(january().getByText('80')).toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Série sazonal' })).toHaveValue('SP');
  });

  it('ignora resposta atrasada de um escopo anterior', async () => {
    const old = deferred();
    const current = deferred();
    vi.mocked(fetchTrend).mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    renderPage();
    const scope = await screen.findByRole('combobox', { name: 'Selecionar escopo geográfico' });
    fireEvent.change(scope, { target: { value: 'SP' } });
    await act(async () => current.resolve(rows('a', 80)));
    expect(january().getByText('80')).toBeInTheDocument();
    await act(async () => old.resolve(rows('a', 999)));
    expect(january().getByText('80')).toBeInTheDocument();
    expect(screen.queryByText('999')).not.toBeInTheDocument();
  });

  it('ignora erro atrasado de um escopo anterior', async () => {
    const old = deferred();
    vi.mocked(fetchTrend).mockReturnValueOnce(old.promise).mockResolvedValue(rows());
    renderPage();
    fireEvent.change(
      await screen.findByRole('combobox', { name: 'Selecionar escopo geográfico' }),
      { target: { value: 'SP' } },
    );
    await screen.findByRole('table', { name: /Comparação mensal/ });
    await act(async () => old.reject(new Error('Falha antiga')));
    expect(screen.queryByText('Falha antiga')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Comparação mensal/ })).toBeInTheDocument();
  });

  it('não apresenta comparação quando a consulta falha', async () => {
    vi.mocked(fetchTrend).mockRejectedValue(new Error('Falha de consulta'));
    renderPage();
    await screen.findByText('Falha de consulta');
    expect(
      screen.queryByRole('heading', { name: 'Observado vs. referência sazonal' }),
    ).not.toBeInTheDocument();
  });
});
