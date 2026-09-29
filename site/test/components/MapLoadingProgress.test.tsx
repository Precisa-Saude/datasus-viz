import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MapLoadingProgress } from '@/components/MapLoadingProgress';

function bar(): HTMLElement {
  return screen.getByRole('progressbar', { hidden: true });
}

describe('MapLoadingProgress', () => {
  it('começa na primeira etapa com uma fração mínima visível', () => {
    render(<MapLoadingProgress completed={0} visible />);
    expect(bar()).toHaveAttribute('aria-valuenow', '0');
    expect(bar()).toHaveAttribute('aria-valuetext', 'Carregando índice…');
    expect((bar().firstElementChild as HTMLElement).style.width).toBe('4%');
  });

  it('avança um terço por etapa concluída', () => {
    render(<MapLoadingProgress completed={2} visible />);
    expect(bar()).toHaveAttribute('aria-valuetext', 'Desenhando o mapa…');
    expect((bar().firstElementChild as HTMLElement).style.width).toMatch(/^66\.66/);
  });

  it('mantém o rótulo da última etapa quando todas terminam', () => {
    render(<MapLoadingProgress completed={3} visible />);
    expect(bar()).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByText('Desenhando o mapa…')).toBeInTheDocument();
  });

  it('some da árvore de acessibilidade e deixa de capturar cliques quando oculto', () => {
    const { container } = render(<MapLoadingProgress completed={3} visible={false} />);
    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay.className).toContain('pointer-events-none');
    expect(overlay.className).toContain('opacity-0');
  });
});
