const MESES_ABBR_PT = [
  'Jan.',
  'Fev.',
  'Mar.',
  'Abr.',
  'Mai.',
  'Jun.',
  'Jul.',
  'Ago.',
  'Set.',
  'Out.',
  'Nov.',
  'Dez.',
] as const;

export function formatCompetencia(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  const mi = Number(m) - 1;
  const label = MESES_ABBR_PT[mi];
  if (!y || !label) return yyyymm;
  return `${label} ${y}`;
}

import type { CompetenciaRange } from './aggregates';

export function formatCompetenciaRange(range: CompetenciaRange): string {
  if (range.from === range.to) return formatCompetencia(range.from);
  return `${formatCompetencia(range.from)} – ${formatCompetencia(range.to)}`;
}

const GERADO_EM_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Data de geração do manifesto (ISO) como `dd/mm/aaaa`; `—` se inválida. */
export function formatGeradoEm(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : GERADO_EM_FMT.format(d);
}
