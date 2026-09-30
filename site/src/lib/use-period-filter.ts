import { useMemo, useState } from 'react';

import type { CompetenciaRange } from './aggregates';

/**
 * Filtro de período do Explorar. Diferente do mapa, o padrão é a série
 * inteira: os achados são poucos (top-N por detector) e espalhados por
 * quase duas décadas, então abrir já recortado em 12 meses esconderia a
 * maior parte deles. `?from=YYYY-MM&to=YYYY-MM` restringe; fora da série
 * ou invertido, o parâmetro é ignorado.
 */
export interface PeriodFilter {
  commit: (range: CompetenciaRange) => void;
  /** Faixa confirmada, ou `null` para a série inteira (fica fora da URL). */
  committed: CompetenciaRange | null;
  /** Faixa desenhada no brush: a confirmada ou a série inteira. */
  display: CompetenciaRange | null;
  /** Faixa aplicada aos achados: a do arraste em curso, senão a confirmada. */
  effective: CompetenciaRange | null;
  preview: (range: CompetenciaRange) => void;
  reset: () => void;
}

function parseRange(
  competencias: readonly string[],
  from: null | string,
  to: null | string,
): CompetenciaRange | null {
  if (!from || !to || from > to) return null;
  if (!competencias.includes(from) || !competencias.includes(to)) return null;
  return { from, to };
}

export function usePeriodFilter(
  competencias: readonly string[] | undefined,
  searchParams: URLSearchParams,
): PeriodFilter {
  const initialFrom = searchParams.get('from');
  const initialTo = searchParams.get('to');
  const [picked, setPicked] = useState<CompetenciaRange | null>(null);
  const [touched, setTouched] = useState(false);
  const [previewRange, setPreviewRange] = useState<CompetenciaRange | null>(null);

  const full = useMemo<CompetenciaRange | null>(() => {
    const first = competencias?.[0];
    const last = competencias?.[competencias.length - 1];
    return first && last ? { from: first, to: last } : null;
  }, [competencias]);

  // Antes de qualquer interação vale a URL; depois, o que o usuário escolheu.
  const committed = useMemo<CompetenciaRange | null>(() => {
    if (touched) return picked;
    return competencias ? parseRange(competencias, initialFrom, initialTo) : null;
  }, [touched, picked, competencias, initialFrom, initialTo]);

  const isFull = (r: CompetenciaRange): boolean =>
    full !== null && r.from === full.from && r.to === full.to;

  return {
    commit: (range) => {
      setTouched(true);
      setPicked(isFull(range) ? null : range);
      setPreviewRange(null);
    },
    committed,
    display: committed ?? full,
    effective: previewRange ?? committed,
    preview: setPreviewRange,
    reset: () => {
      setTouched(true);
      setPicked(null);
      setPreviewRange(null);
    },
  };
}

/** A competência `YYYY-MM` está dentro da faixa (inclusiva)? `null` = sem filtro. */
export function inPeriod(competencia: string, range: CompetenciaRange | null): boolean {
  return range === null || (competencia >= range.from && competencia <= range.to);
}
