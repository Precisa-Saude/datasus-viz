import { TriangleAlert } from 'lucide-react';
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { KIND_LABEL, type ResolvedFlag } from '@/lib/anomaly-flags';
import { formatCompetencia } from '@/lib/format';

export interface AnomalyBadgeProps {
  biomarkersByLoinc: Record<string, string>;
  flags: ResolvedFlag[];
}

/** Nomes dos exames citados, sem repetir e limitados a três. */
function nomesExames(flags: ResolvedFlag[], byLoinc: Record<string, string>): string {
  const nomes: string[] = [];
  for (const f of flags) {
    for (const loinc of f.loincs) {
      const nome = byLoinc[loinc] ?? loinc;
      if (!nomes.includes(nome)) nomes.push(nome);
    }
  }
  if (nomes.length === 0) return '';
  if (nomes.length <= 3) return nomes.join(', ');
  return `${nomes.slice(0, 3).join(', ')} e mais ${String(nomes.length - 3)}`;
}

/**
 * Ícone de alerta ao lado do nome do município quando os detectores
 * marcaram alguma tupla (município × competência × exame) da faixa
 * selecionada.
 *
 * A redação é deliberadamente descritiva: o número exibido é o que o
 * DATASUS publicou, e o detector só aponta que ele destoa do padrão.
 * Não afirma erro nem irregularidade — a origem da divergência não é
 * observável a partir do dado agregado.
 */
const TOOLTIP_WIDTH = 288;
const VIEWPORT_MARGIN = 8;

export function AnomalyBadge({ biomarkersByLoinc, flags }: AnomalyBadgeProps) {
  const [aberto, setAberto] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const botaoRef = useRef<HTMLButtonElement | null>(null);
  const tooltipId = useId();

  // O painel de detalhe é `overflow: hidden` e tem ~354 px de largura,
  // dos quais sobram ~230 à direita do ícone — um tooltip de 288 px
  // ancorado no ícone era cortado na borda. Portal no `body` + posição
  // fixa calculada a partir do rect do botão tira o tooltip de dentro
  // do painel e o mantém dentro da viewport.
  const posicionar = useCallback(() => {
    const rect = botaoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN;
    setPos({
      left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)),
      top: rect.bottom + 6,
    });
  }, []);

  useLayoutEffect(() => {
    if (!aberto) return;
    posicionar();
    window.addEventListener('scroll', posicionar, true);
    window.addEventListener('resize', posicionar);
    return () => {
      window.removeEventListener('scroll', posicionar, true);
      window.removeEventListener('resize', posicionar);
    };
  }, [aberto, posicionar]);

  if (flags.length === 0) return null;

  const kinds = [...new Set(flags.map((f) => f.kind))];
  const competencias = [...new Set(flags.map((f) => f.competencia))];
  const exames = nomesExames(flags, biomarkersByLoinc);

  return (
    <span className="relative inline-flex align-middle">
      <button
        aria-describedby={aberto ? tooltipId : undefined}
        aria-label="Volume atípico detectado nesta competência"
        className="text-amber-600 hover:text-amber-700 focus-visible:ring-ring inline-flex cursor-help items-center rounded-sm focus-visible:ring-2 focus-visible:outline-none dark:text-amber-500"
        onBlur={() => setAberto(false)}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setAberto(false);
        }}
        onMouseEnter={() => setAberto(true)}
        onMouseLeave={() => setAberto(false)}
        ref={botaoRef}
        type="button"
      >
        <TriangleAlert aria-hidden="true" size={15} strokeWidth={2.25} />
      </button>

      {aberto &&
        createPortal(
          <span
            className="border-border bg-card text-card-foreground fixed z-50 rounded-md border p-3 text-left font-sans text-xs leading-relaxed font-normal shadow-lg"
            id={tooltipId}
            role="tooltip"
            style={{ left: pos.left, top: pos.top, width: TOOLTIP_WIDTH }}
          >
            <span className="text-foreground block font-semibold">Volume atípico</span>
            <span className="text-muted-foreground mt-1 block">
              {competencias.length === 1
                ? `Em ${formatCompetencia(competencias[0] as string)}, este`
                : 'Neste'}{' '}
              município destoa do padrão em {kinds.map((k) => KIND_LABEL[k]).join(' e ')}
              {exames ? ` — ${exames}.` : '.'}
            </span>
            <span className="text-muted-foreground mt-2 block">
              Os valores são exibidos exatamente como o DATASUS os publicou. A marcação vem dos
              detectores do próprio site e indica divergência estatística, não erro confirmado.
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}
