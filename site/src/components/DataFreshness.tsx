import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { AggregateIndex, CompetenciaRange } from '@/lib/aggregates';
import { formatCompetenciaRange } from '@/lib/format';
import { firstProvisionalCompetencia, provisionalOverlap } from '@/lib/provisional';

const GERADO_EM_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatGeradoEm(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : GERADO_EM_FMT.format(d);
}

interface DataFreshnessProps {
  manifest: AggregateIndex;
  range: CompetenciaRange;
}

/**
 * Quão atuais são os números exibidos: aviso de competências provisórias
 * (que o DATASUS ainda reescreve a cada publicação mensal) quando a faixa
 * selecionada as inclui, e a data em que os dados do site foram gerados.
 */
export function DataFreshness({ manifest, range }: DataFreshnessProps) {
  const firstProvisional = useMemo(
    () => firstProvisionalCompetencia(manifest.competencias),
    [manifest.competencias],
  );
  const overlap = provisionalOverlap(range, firstProvisional);
  return (
    <>
      {overlap ? (
        <p className="text-muted-foreground font-margem text-xs leading-snug">
          <span className="text-foreground font-medium">Provisório:</span>{' '}
          {formatCompetenciaRange(overlap)} ainda pode ser revisado pelo DATASUS.{' '}
          <Link className="underline" to="/sobre#revisoes">
            Saiba mais
          </Link>
        </p>
      ) : null}
      <p
        className="text-muted-foreground/80 font-margem text-[11px] leading-snug"
        title={`Anos cobertos: ${manifest.years.join(', ') || '—'} · ${manifest.competencias.length} competências`}
      >
        Atualizado em {formatGeradoEm(manifest.geradoEm)}
      </p>
    </>
  );
}
