import { type ReactNode, useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

const VIEWPORT_MARGIN = 8;
const DEFAULT_WIDTH = 288;

export interface InfoTooltipProps {
  ariaLabel: string;
  /** Conteúdo do tooltip. */
  children: ReactNode;
  /** Classes do botão que dispara. */
  className?: string;
  /** Elemento visível — ícone, normalmente. */
  trigger: ReactNode;
  width?: number;
}

/**
 * Tooltip acionado por hover e por foco de teclado, fechado no Escape.
 *
 * Vai por portal no `body` com posição fixa clampada na viewport: os
 * painéis onde ele aparece são `overflow: hidden` e estreitos, então um
 * tooltip ancorado no ícone era cortado na borda.
 */
export function InfoTooltip({
  ariaLabel,
  children,
  className,
  trigger,
  width = DEFAULT_WIDTH,
}: InfoTooltipProps) {
  const [aberto, setAberto] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const botaoRef = useRef<HTMLButtonElement | null>(null);
  const tooltipId = useId();

  const posicionar = useCallback(() => {
    const rect = botaoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    setPos({
      left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)),
      top: rect.bottom + 6,
    });
  }, [width]);

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

  return (
    <span className="relative inline-flex align-middle">
      <button
        aria-describedby={aberto ? tooltipId : undefined}
        aria-label={ariaLabel}
        className={cn(
          'focus-visible:ring-ring inline-flex cursor-help items-center rounded-sm focus-visible:ring-2 focus-visible:outline-none',
          className,
        )}
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
        {trigger}
      </button>

      {aberto &&
        createPortal(
          <div
            className="border-border bg-card text-card-foreground fixed z-50 rounded-md border p-2.5 text-left font-sans text-xs leading-snug font-normal shadow-lg"
            id={tooltipId}
            role="tooltip"
            style={{ left: pos.left, top: pos.top, width }}
          >
            {children}
          </div>,
          document.body,
        )}
    </span>
  );
}
