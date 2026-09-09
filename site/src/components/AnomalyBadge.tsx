import { TriangleAlert } from 'lucide-react';
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { AnomalyKind } from '@/lib/anomaly';
import { KIND_LABEL, type ResolvedFlag } from '@/lib/anomaly-flags';
import { formatCompetencia } from '@/lib/format';

export interface AnomalyBadgeProps {
  biomarkersByLoinc: Record<string, string>;
  flags: ResolvedFlag[];
}

/** Quantos itens a lista mostra antes de resumir o resto. */
const MAX_ITENS = 6;
/** Quantos exames cada item nomeia antes de resumir o resto. */
const MAX_EXAMES = 4;

function listar(nomes: string[], max: number): string {
  if (nomes.length <= max) return nomes.join(', ');
  return `${nomes.slice(0, max).join(', ')} e mais ${String(nomes.length - max)}`;
}

/**
 * Uma linha por anomalia detectada. Um município pode acumular vários
 * detectores e várias competências dentro da faixa selecionada — antes
 * isso virava uma frase só, encadeada com "e", que ficava ilegível
 * assim que passava de duas.
 */
function itensDetalhados(
  flags: ResolvedFlag[],
  byLoinc: Record<string, string>,
  mostrarCompetencia: boolean,
): string[] {
  return flags.map((f) => {
    const exames = listar(
      f.loincs.map((loinc) => byLoinc[loinc] ?? loinc),
      MAX_EXAMES,
    );
    const base = exames === '' ? KIND_LABEL[f.kind] : `${KIND_LABEL[f.kind]} em ${exames}`;
    return mostrarCompetencia ? `${formatCompetencia(f.competencia)}: ${base}` : base;
  });
}

/**
 * Resumo por detector, para faixas largas. Listar competência a
 * competência é útil pra um punhado de meses; numa faixa de 18 anos
 * vira uma parede de linhas quase idênticas e o "e mais 185" esconde
 * justamente a informação que importa — quais detectores dispararam e
 * com que frequência.
 */
function itensAgregados(flags: ResolvedFlag[]): string[] {
  const porKind = new Map<AnomalyKind, Set<string>>();
  for (const f of flags) {
    const set = porKind.get(f.kind) ?? new Set<string>();
    set.add(f.competencia);
    porKind.set(f.kind, set);
  }
  return [...porKind.entries()].map(([kind, competencias]) => {
    const n = competencias.size;
    return `${KIND_LABEL[kind]} em ${String(n)} ${n === 1 ? 'competência' : 'competências'}`;
  });
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

  const competencias = [...new Set(flags.map((f) => f.competencia))];
  const umaCompetencia = competencias.length === 1;
  const detalhados = itensDetalhados(flags, biomarkersByLoinc, !umaCompetencia);
  const agregado = detalhados.length > MAX_ITENS;
  const itens = agregado ? itensAgregados(flags) : detalhados;

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
          <div
            className="border-border bg-card text-card-foreground fixed z-50 rounded-md border p-2.5 text-left font-sans text-[10.5px] leading-snug font-normal shadow-lg"
            id={tooltipId}
            role="tooltip"
            style={{ left: pos.left, top: pos.top, width: TOOLTIP_WIDTH }}
          >
            <p className="text-foreground font-semibold">Volume atípico</p>
            <p className="text-muted-foreground mt-1">
              {umaCompetencia
                ? `Em ${formatCompetencia(competencias[0] as string)}, este município destoa do padrão em:`
                : 'Neste município, dentro da faixa selecionada, destoam do padrão:'}
            </p>
            <ul className="text-muted-foreground mt-1 space-y-0.5">
              {itens.map((item) => (
                <li className="flex gap-1.5" key={item}>
                  <span aria-hidden="true" className="text-muted-foreground/60">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-2">
              Os valores são exibidos exatamente como o DATASUS os publicou. A marcação vem dos
              detectores do próprio site e indica divergência estatística, não erro confirmado.
            </p>
          </div>,
          document.body,
        )}
    </span>
  );
}
