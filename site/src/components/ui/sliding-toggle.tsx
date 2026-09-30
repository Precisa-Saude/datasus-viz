import { cn } from '@/lib/utils';

export interface SlidingToggleItem<T extends string> {
  label: string;
  value: T;
}

/**
 * Pill com indicador deslizante animado, standalone (sem dependência de
 * Radix/base-ui Tabs) — uso direto com value/onChange. Cópia do padrão
 * usado em `medbench-brasil/site/src/components/ui/sliding-toggle.tsx`,
 * que escolheu `bg-primary` para o pill ativo (em vez do `bg-background`
 * do `SlidingTabs` compartilhado, que tem contraste insuficiente sobre
 * `bg-muted` no tema atual).
 */
export function SlidingToggle<T extends string>({
  className,
  items,
  onChange,
  value,
}: {
  className?: string;
  items: readonly SlidingToggleItem<T>[];
  onChange: (v: T) => void;
  value: T;
}) {
  const count = items.length;
  const activeIndex = items.findIndex((item) => item.value === value);

  return (
    <div
      className={cn(
        'relative inline-grid rounded-full bg-card p-1 font-sans ring-1 ring-border',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
    >
      {activeIndex >= 0 ? (
        <div
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-primary transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: `calc(4px + ${activeIndex} * ((100% - 8px) / ${count}))`,
            width: `calc((100% - 8px) / ${count})`,
          }}
        />
      ) : null}
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            className={cn(
              'relative z-10 flex cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-center text-sm font-medium whitespace-nowrap transition-colors duration-200 sm:px-5',
              isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            key={item.value}
            onClick={() => onChange(item.value)}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
