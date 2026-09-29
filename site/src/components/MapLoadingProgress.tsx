import { cn } from '@precisa-saude/ui/utils';

const STEPS = ['Carregando índice…', 'Carregando agregados…', 'Desenhando o mapa…'] as const;

export interface MapLoadingProgressProps {
  /** Etapas concluídas, de 0 a 3: índice, agregados, primeira pintura. */
  completed: number;
  visible: boolean;
}

/**
 * Barra de progresso da primeira carga do mapa, no centro da tela.
 *
 * Avança por etapa real concluída, sem timer: o guia da marca (seção 7)
 * veta contador fictício e simulação que pareça requisição em andamento.
 * Cobre o mapa até a primeira pintura para não mostrar o fundo vazio
 * entre o fim dos agregados e o carregamento dos tiles. Fica abaixo dos
 * painéis (z-10), que aparecem assim que os próprios dados chegam.
 */
export function MapLoadingProgress({ completed, visible }: MapLoadingProgressProps) {
  const step = Math.min(completed, STEPS.length - 1);
  const label = STEPS[step] ?? STEPS[0];
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'bg-background absolute inset-0 z-[5] flex items-center justify-center transition-opacity duration-200',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="flex w-48 flex-col items-center gap-3">
        <div
          aria-label="Carregando o mapa"
          aria-valuemax={STEPS.length}
          aria-valuemin={0}
          aria-valuenow={completed}
          aria-valuetext={label}
          className="bg-border h-1 w-full overflow-hidden rounded-full"
          role="progressbar"
        >
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            // Uma fração mínima mantém a barra legível antes da primeira etapa.
            style={{ width: `${Math.max(completed / STEPS.length, 0.04) * 100}%` }}
          />
        </div>
        <p className="text-muted-foreground font-margem text-sm" aria-live="polite">
          {label}
        </p>
      </div>
    </div>
  );
}
