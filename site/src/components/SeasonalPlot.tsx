import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { SeasonalMonth } from '@/lib/seasonal';
import type { SeasonalView } from '@/lib/seasonal-presentation';
import { seasonalChartRows, symmetricPercentDomain } from '@/lib/seasonal-presentation';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const NUMBER = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const COMPACT = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

export function SeasonalPlot({
  color,
  rows,
  view,
}: {
  color: string;
  rows: SeasonalMonth[];
  view: SeasonalView;
}) {
  const data = seasonalChartRows(rows, view);
  const percent = view === 'deviation';
  const format = (value: number) => `${NUMBER.format(value)}${percent ? '%' : ''}`;
  return (
    <div aria-label="Comparação mensal; valores disponíveis na tabela abaixo" className="font-sans">
      {percent ? (
        <p className="text-muted-foreground mb-2 text-xs">
          Desvio em relação à mediana histórica do mesmo mês. Zero = referência histórica; lacunas e
          referência zero não têm percentual.
        </p>
      ) : null}
      <ResponsiveContainer height={300} width="100%">
        <LineChart data={data} margin={{ bottom: 8, left: 8, right: 16, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="competencia"
            tickFormatter={(value: string) => MONTHS[Number(value.slice(5)) - 1] ?? value}
          />
          <YAxis
            domain={percent ? symmetricPercentDomain : undefined}
            width={72}
            tickFormatter={(value: number) => (percent ? format(value) : COMPACT.format(value))}
          />
          {percent ? <ReferenceLine y={0} stroke="#71717a" strokeDasharray="4 4" /> : null}
          <Tooltip
            formatter={(value) => format(Number(value))}
            contentStyle={{ background: 'var(--card)', borderRadius: 6 }}
          />
          <Legend />
          <Line
            dataKey="observed"
            name={percent ? 'Desvio da produção observada' : 'Produção observada'}
            stroke={color}
            connectNulls={false}
            type="linear"
            isAnimationActive={false}
          />
          {!percent ? (
            <Line
              dataKey="reference"
              name="Mediana histórica"
              stroke="#71717a"
              strokeDasharray="5 5"
              connectNulls={false}
              type="linear"
              isAnimationActive={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
