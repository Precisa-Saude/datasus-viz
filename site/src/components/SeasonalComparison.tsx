import { useMemo, useState } from 'react';

import type { AggregateIndex } from '@/lib/aggregates';
import type { TrendPoint } from '@/lib/queries';
import type { SeasonalMonth } from '@/lib/seasonal';
import {
  isSeasonalObservation,
  SEASONAL_LOOKBACK,
  SEASONAL_MIN_YEARS,
  seasonalComparison,
} from '@/lib/seasonal';
import type { SeasonalView } from '@/lib/seasonal-presentation';
import { TYPE } from '@/lib/typography';

import { DataFreshness } from './DataFreshness';
import { SeasonalPlot } from './SeasonalPlot';
import type { TrendSeries } from './TrendChart';
import { Combobox } from './ui/combobox';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const NUMBER = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const PERCENT = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

function comparisonLabel(row: SeasonalMonth): string {
  if (row.observed === null) return 'Sem registro';
  if (row.reference === null) return 'Histórico insuficiente';
  if (row.differencePercent === null) return 'Referência zero';
  return `${PERCENT.format(row.differencePercent)}%`;
}

interface SeasonalComparisonProps {
  data: TrendPoint[];
  /** Série mostrada antes de o usuário escolher (ex.: o primeiro slot do overlay). */
  defaultSeriesId?: string;
  manifest: AggregateIndex;
  scope: string;
  /** Em ordem alfabética de rótulo; a seleção inicial vem de `defaultSeriesId`. */
  series: TrendSeries[];
}

export function SeasonalComparison({
  data,
  defaultSeriesId,
  manifest,
  scope,
  series,
}: SeasonalComparisonProps) {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [view, setView] = useState<SeasonalView>('volume');
  const activeSeries =
    series.find((item) => item.id === selectedSeries) ??
    series.find((item) => item.id === defaultSeriesId) ??
    series[0];
  const years = useMemo(
    () =>
      [
        ...new Set(
          data
            .filter((point) => point.seriesId === activeSeries?.id && isSeasonalObservation(point))
            .map((point) => point.competencia.slice(0, 4)),
        ),
      ]
        .sort()
        .reverse(),
    [data, activeSeries?.id],
  );
  const year = years.includes(selectedYear) ? selectedYear : years[0];
  const rows = useMemo(
    () => (activeSeries && year ? seasonalComparison(data, activeSeries.id, Number(year)) : []),
    [data, activeSeries, year],
  );
  const hasReference = rows.some((row) => row.reference !== null);

  return (
    <>
      <header className="col-span-full mt-8 space-y-3">
        <h2 className={TYPE.h2} id="seasonal-heading">
          Observado vs. referência sazonal
        </h2>
        <p className={`max-w-3xl ${TYPE.meta}`}>
          Produção aprovada de exames: compare cada mês com a mediana do mesmo mês nos{' '}
          {SEASONAL_LOOKBACK} anos anteriores. Não é previsão de demanda nem detecção de surtos.
        </p>
      </header>
      {activeSeries ? (
        <div
          aria-label="Controles da comparação sazonal"
          className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-3"
          role="group"
        >
          <label className="flex min-w-0 max-w-full flex-col gap-1">
            <span className={TYPE.label}>Série sazonal</span>
            <Combobox
              ariaLabel="Série sazonal"
              items={series.map((item) => ({ label: item.label, value: item.id }))}
              searchPlaceholder="Buscar série…"
              value={activeSeries.id}
              onChange={setSelectedSeries}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={TYPE.label}>Visualização sazonal</span>
            <Combobox
              ariaLabel="Visualização sazonal"
              items={[
                { label: 'Volume de exames', value: 'volume' },
                { label: 'Desvio percentual', value: 'deviation' },
              ]}
              value={view}
              onChange={(value) => setView(value === 'deviation' ? 'deviation' : 'volume')}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={TYPE.label}>Ano observado</span>
            <Combobox
              ariaLabel="Ano observado"
              items={years.map((item) => ({ label: item, value: item }))}
              searchPlaceholder="Buscar ano…"
              value={year ?? ''}
              onChange={setSelectedYear}
            />
          </label>
        </div>
      ) : null}
      <section
        aria-labelledby="seasonal-heading"
        className="border-border bg-card col-span-full mt-2 min-w-0 rounded-lg border p-4 shadow-sm sm:p-6"
      >
        {!activeSeries || !year ? (
          <p className="mt-4 font-sans text-sm">Sem dados para a comparação sazonal.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className={TYPE.label}>
                {scope} · {activeSeries.label}
              </p>
              <p className={TYPE.meta}>
                Referência: {Number(year) - SEASONAL_LOOKBACK} a {Number(year) - 1}
              </p>
            </div>
            {!hasReference ? (
              <p className="my-3 font-sans text-sm" role="status">
                Histórico insuficiente: são necessários ao menos {SEASONAL_MIN_YEARS} anos com
                registro para o mesmo mês.
              </p>
            ) : null}
            <SeasonalPlot color={activeSeries.color} rows={rows} view={view} />
          </>
        )}
      </section>
      {activeSeries && year ? (
        <section
          aria-label="Tabela de comparação sazonal"
          className="border-border bg-card col-span-full min-w-0 rounded-lg border p-4 shadow-sm sm:p-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <caption className="text-muted-foreground mb-2 text-left text-xs">
                Comparação mensal de {year}. Amplitude histórica é mínimo a máximo, não intervalo de
                previsão.
              </caption>
              <thead>
                <tr>
                  {[
                    'Mês',
                    'Observado',
                    'Mediana histórica',
                    'Amplitude histórica',
                    'Anos com registro',
                    'Variação',
                  ].map((label) => (
                    <th className="px-3 py-2" key={label} scope="col">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr className="border-border border-t" key={row.competencia}>
                    <th className="px-3 py-2" scope="row">
                      {MONTHS[index]}
                    </th>
                    <td className="px-3 py-2">
                      {row.observed === null ? 'Sem registro' : NUMBER.format(row.observed)}
                    </td>
                    <td className="px-3 py-2">
                      {row.reference === null
                        ? 'Histórico insuficiente'
                        : NUMBER.format(row.reference)}
                    </td>
                    <td className="px-3 py-2">
                      {row.historicalMin === null || row.historicalMax === null
                        ? 'Não disponível'
                        : `${NUMBER.format(row.historicalMin)} a ${NUMBER.format(row.historicalMax)}`}
                    </td>
                    <td className="px-3 py-2">
                      {row.sampleSize}/{SEASONAL_LOOKBACK}
                    </td>
                    <td className="px-3 py-2">{comparisonLabel(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2">
            <DataFreshness manifest={manifest} range={{ from: `${year}-01`, to: `${year}-12` }} />
          </div>
        </section>
      ) : null}
      <p className={`col-span-full max-w-[70ch] ${TYPE.meta}`}>
        Referência descritiva com mínimo de {SEASONAL_MIN_YEARS} anos por mês. Lacunas não são
        zeros. A presença de registros não comprova cobertura completa; o total Brasil pode reunir
        UFs diferentes a cada mês. Revisões, mudanças de oferta e de mapeamento SIGTAP/LOINC afetam
        a comparação. Os volumes são do local executor, não medem pacientes únicos, resultados
        clínicos ou incidência. O histórico revisado não reproduz os dados disponíveis em cada data
        de publicação.
      </p>
    </>
  );
}
