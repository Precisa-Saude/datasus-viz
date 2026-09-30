import { Link } from 'react-router-dom';

import type { AnomalyHit } from '@/lib/anomaly';
import { formatCompetencia } from '@/lib/format';

/**
 * Versão em lista do `AnomalyDetectorTable` para telas estreitas: a grade
 * de seis colunas com o dumbbell precisa de ~820 px e, num celular, só
 * mostrava município, UF e mês. Aqui cada achado vira um cartão com os
 * mesmos dados (lugar, mês, exame, observado × referência) e as mesmas
 * duas ações: abrir o município e ver o detalhamento por CNES.
 */
export interface AnomalyHitListProps {
  baselineLabel: string;
  color: string;
  formatValue: (v: number) => string;
  hitKey: (hit: AnomalyHit) => string;
  hits: AnomalyHit[];
  labelForLoinc: (loinc: string) => string;
  selectedHitKey?: null | string;
  urlFor: (hit: AnomalyHit) => string;
  onHitSelect?: (hit: AnomalyHit) => void;
}

export function AnomalyHitList({
  baselineLabel,
  color,
  formatValue,
  hitKey,
  hits,
  labelForLoinc,
  onHitSelect,
  selectedHitKey,
  urlFor,
}: AnomalyHitListProps) {
  return (
    <ul className="divide-border/60 divide-y font-sans">
      {hits.map((hit) => {
        const key = hitKey(hit);
        return (
          <li key={key} className="flex items-start gap-3 py-3">
            <Link className="min-w-0 flex-1 space-y-1" to={urlFor(hit)}>
              <p className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground truncate font-medium">
                  {hit.municipioNome}
                  <span className="text-muted-foreground font-normal"> · {hit.ufSigla}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {formatCompetencia(hit.competencia)}
                </span>
              </p>
              <p className="text-muted-foreground truncate text-xs">{labelForLoinc(hit.loinc)}</p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground font-medium">{formatValue(hit.observed)}</span>
                </span>
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <span className="bg-muted-foreground inline-block size-2 rounded-full" />
                  {formatValue(hit.baseline)} {baselineLabel}
                </span>
              </p>
            </Link>
            {onHitSelect ? (
              <button
                aria-label={`Ver detalhamento por estabelecimento — ${hit.municipioNome}, ${formatCompetencia(hit.competencia)}`}
                aria-pressed={selectedHitKey === key}
                className="text-primary border-border hover:bg-primary/10 shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                onClick={() => onHitSelect(hit)}
                type="button"
              >
                CNES
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
