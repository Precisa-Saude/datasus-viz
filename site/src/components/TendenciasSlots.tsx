import { X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import type { ComboboxItem } from '@/components/ui/combobox';
import { Combobox } from '@/components/ui/combobox';

export interface SlotHandlers {
  add: () => void;
  change: (idx: number, value: string) => void;
  remove: (idx: number) => void;
}

/**
 * Geradora de handlers `change/add/remove` para um array de slots (até
 * `max`). Mantém os updates imutáveis e usa um callback de candidato
 * para escolher o próximo valor a ser adicionado.
 */
export function makeSlotHandlers(
  setter: Dispatch<SetStateAction<string[]>>,
  pickNext: () => string | undefined,
  max: number,
): SlotHandlers {
  return {
    add: () => {
      const candidate = pickNext();
      if (!candidate) return;
      setter((prev) => (prev.length >= max ? prev : [...prev, candidate]));
    },
    change: (idx, value) =>
      setter((prev) => {
        const next = [...prev];
        next[idx] = value;
        return next;
      }),
    remove: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  };
}

interface SlotRemoveButtonProps {
  ariaLabel: string;
  onClick: () => void;
}

function SlotRemoveButton({ ariaLabel, onClick }: SlotRemoveButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
      onClick={onClick}
      type="button"
    >
      <X className="size-4" />
    </button>
  );
}

function SlotBullet({ color }: { color: string }) {
  return (
    <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: color }} />
  );
}

export interface ComboboxSlotsProps {
  ariaPrefix: string;
  colors: string[];
  items: ComboboxItem[];
  removeLabel: string;
  searchPlaceholder: string;
  values: string[];
  onChange: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
}

/**
 * Linha de slots paralelos (até MAX_SERIES) — cada slot é um Combobox
 * com bullet colorido (que casa com a cor da série no gráfico) e
 * botão de remover quando há mais de um slot.
 */
export function ComboboxSlots({
  ariaPrefix,
  colors,
  items,
  onChange,
  onRemove,
  removeLabel,
  searchPlaceholder,
  values,
}: ComboboxSlotsProps) {
  return (
    <>
      {values.map((v, idx) => (
        <div className="flex items-center gap-2" key={`${ariaPrefix}-${idx}-${v}`}>
          <SlotBullet color={colors[idx] ?? '#6b7280'} />
          <div className="min-w-0 flex-1">
            <Combobox
              ariaLabel={`${ariaPrefix} ${idx + 1}`}
              items={items}
              onChange={(nv) => onChange(idx, nv)}
              searchPlaceholder={searchPlaceholder}
              value={v}
            />
          </div>
          {values.length > 1 ? (
            <SlotRemoveButton
              ariaLabel={`${removeLabel} ${idx + 1}`}
              onClick={() => onRemove(idx)}
            />
          ) : null}
        </div>
      ))}
    </>
  );
}
