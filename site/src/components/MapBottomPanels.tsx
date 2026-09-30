import { cn } from '@precisa-saude/ui/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import type { CompetenciaRange } from '@/lib/aggregates';
import { formatCompetenciaRange } from '@/lib/format';
import { BOTTOM_STACK_CLASS, BRUSH_CLASS, DETAIL_CLASS } from '@/lib/home-layout';

import type { SelectedMunicipio } from './BrasilMap';

/**
 * Painel que, abaixo de `lg`, pode ser minimizado para uma barra de uma
 * linha: empilhados no rodapé, tabela e brush cobrem boa parte do mapa num
 * celular. Aberto, uma aba no meio da borda de cima minimiza (sem disputar
 * o canto com o botão de fechar da tabela); minimizado, a barra mostra o que
 * está guardado e reabre ao toque. A partir de `lg` os painéis flutuam nas
 * laterais e o controle some.
 */
function MinimizablePanel({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className: string;
  label: string;
}) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={cn('relative', className, minimized && 'max-lg:h-auto')}>
      {minimized ? (
        <button
          aria-expanded={false}
          className="border-border bg-card/95 flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left font-margem text-sm shadow-lg backdrop-blur-md lg:hidden"
          onClick={() => setMinimized(false)}
          type="button"
        >
          <span className="truncate font-medium">{label}</span>
          <ChevronUp aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
        </button>
      ) : (
        <button
          aria-expanded
          aria-label={`Minimizar: ${label}`}
          className="border-border bg-card text-muted-foreground hover:text-foreground absolute -top-2.5 left-1/2 z-20 flex h-5 w-10 -translate-x-1/2 items-center justify-center rounded-full border shadow-sm lg:hidden"
          onClick={() => setMinimized(true)}
          type="button"
        >
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </button>
      )}
      <div className={cn('h-full', minimized && 'max-lg:hidden')}>{children}</div>
    </div>
  );
}

export interface MapBottomPanelsProps {
  /** Brush de período (já com os dados); `null` enquanto carrega. */
  brush: ReactNode;
  /** Faixa em exibição, para a barra do brush minimizado. */
  range: CompetenciaRange | null;
  selectedMun: null | SelectedMunicipio;
  selectedUf: null | string;
  /** Tabela de UFs/municípios ou detalhe do município; `null` enquanto carrega. */
  table: ReactNode;
}

/**
 * Faixa de baixo do mapa: tabela e brush. Empilhados no celular, cada um
 * minimizável; no desktop, `contents`, e cada painel volta à posição
 * flutuante de sempre (ver `home-layout.ts`).
 */
export function MapBottomPanels({
  brush,
  range,
  selectedMun,
  selectedUf,
  table,
}: MapBottomPanelsProps) {
  const tableLabel = selectedMun
    ? `${selectedMun.nome} — ${selectedMun.ufSigla}`
    : selectedUf
      ? `${selectedUf} — municípios`
      : 'Brasil — visão nacional';
  const brushLabel = range ? `Competência · ${formatCompetenciaRange(range)}` : 'Competência';

  return (
    <div className={BOTTOM_STACK_CLASS}>
      {table ? (
        <MinimizablePanel className={DETAIL_CLASS} label={tableLabel}>
          {table}
        </MinimizablePanel>
      ) : null}
      {brush ? (
        <MinimizablePanel className={BRUSH_CLASS} label={brushLabel}>
          <div className="border-border bg-card/95 rounded-lg border px-4 pt-2 pb-3 shadow-lg backdrop-blur-md">
            {brush}
          </div>
        </MinimizablePanel>
      ) : null}
    </div>
  );
}
