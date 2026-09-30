import { useMemo } from 'react';

import type { AnomalyHit } from '@/lib/anomaly';
import type { PeriodFilter as PeriodFilterState } from '@/lib/use-period-filter';

import { CompetenciaBrush } from './CompetenciaBrush';

/**
 * Recorte de período do Explorar: o mesmo brush do mapa, mas com as barras
 * contando achados por mês (com UF, município, exame e detector já
 * aplicados) em vez do volume nacional de exames.
 */
export function PeriodFilter({
  competencias,
  hits,
  period,
}: {
  competencias: string[];
  /** Achados com os demais filtros aplicados, antes do recorte de período. */
  hits: AnomalyHit[];
  period: PeriodFilterState;
}) {
  const hitsByCompetencia = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of hits) counts.set(h.competencia, (counts.get(h.competencia) ?? 0) + 1);
    return counts;
  }, [hits]);

  if (!period.display) return null;

  return (
    <div className="col-span-full">
      <div className="border-border bg-card rounded-lg border px-4 pt-2 pb-3 shadow-sm">
        <CompetenciaBrush
          competencias={competencias}
          onCommit={period.commit}
          onPreview={period.preview}
          onReset={period.reset}
          value={period.display}
          volumeByCompetencia={hitsByCompetencia}
        />
      </div>
      <p className="text-muted-foreground mt-1.5 font-sans text-[11px]">
        Barras: achados por mês com os filtros acima. Arraste as alças para recortar o período
        {period.committed ? '.' : '; duplo clique volta à série inteira.'}
        {period.committed ? (
          <>
            {' '}
            <button
              className="text-primary font-medium underline-offset-2 hover:underline"
              onClick={period.reset}
              type="button"
            >
              Ver série inteira
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
