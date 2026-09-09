import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CompetenciaBrush } from '@/components/CompetenciaBrush';

const COMPETENCIAS = ['2023-01', '2023-06', '2024-01', '2024-06', '2024-12'];

function makeVolume(): Map<string, number> {
  return new Map([
    ['2023-01', 100],
    ['2023-06', 200],
    ['2024-01', 150],
    ['2024-06', 50],
    ['2024-12', 300],
  ]);
}

describe('CompetenciaBrush', () => {
  it('renderiza rótulo com a faixa atual formatada', () => {
    render(
      <CompetenciaBrush
        competencias={COMPETENCIAS}
        onCommit={vi.fn()}
        onPreview={vi.fn()}
        onReset={vi.fn()}
        value={{ from: '2023-01', to: '2024-12' }}
        volumeByCompetencia={makeVolume()}
      />,
    );
    expect(screen.getByText('Competência')).toBeInTheDocument();
    expect(screen.getByText('Jan. 2023 – Dez. 2024')).toBeInTheDocument();
  });

  it('renderiza ticks de início de ano', () => {
    render(
      <CompetenciaBrush
        competencias={COMPETENCIAS}
        onCommit={vi.fn()}
        onPreview={vi.fn()}
        onReset={vi.fn()}
        value={{ from: '2023-01', to: '2024-12' }}
        volumeByCompetencia={makeVolume()}
      />,
    );
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('expõe handles como sliders ARIA com from/to', () => {
    render(
      <CompetenciaBrush
        competencias={COMPETENCIAS}
        onCommit={vi.fn()}
        onPreview={vi.fn()}
        onReset={vi.fn()}
        value={{ from: '2023-06', to: '2024-06' }}
        volumeByCompetencia={makeVolume()}
      />,
    );
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    const start = screen.getByLabelText('Início da faixa');
    const end = screen.getByLabelText('Fim da faixa');
    expect(start.getAttribute('aria-valuetext')).toBe('Jun. 2023');
    expect(end.getAttribute('aria-valuetext')).toBe('Jun. 2024');
  });

  it('teclado: → no handle de fim avança um mês', () => {
    const onChange = vi.fn();
    render(
      <CompetenciaBrush
        competencias={COMPETENCIAS}
        onCommit={onChange}
        onPreview={vi.fn()}
        onReset={vi.fn()}
        value={{ from: '2023-01', to: '2024-01' }}
        volumeByCompetencia={makeVolume()}
      />,
    );
    const end = screen.getByLabelText('Fim da faixa');
    fireEvent.keyDown(end, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith({ from: '2023-01', to: '2024-06' });
  });

  it('teclado: → no handle de início clampa em to - 1 (faixa mín. 2 meses)', () => {
    const onChange = vi.fn();
    render(
      <CompetenciaBrush
        competencias={COMPETENCIAS}
        onCommit={onChange}
        onPreview={vi.fn()}
        onReset={vi.fn()}
        value={{ from: '2023-01', to: '2024-06' }}
        volumeByCompetencia={makeVolume()}
      />,
    );
    const start = screen.getByLabelText('Início da faixa');
    // Shift+→ tenta avançar 12 meses; deve clampar em to - 1 = '2024-01'
    fireEvent.keyDown(start, { key: 'ArrowRight', shiftKey: true });
    expect(onChange).toHaveBeenCalledWith({ from: '2024-01', to: '2024-06' });
  });

  it('double-click no backdrop dispara onReset', () => {
    const onReset = vi.fn();
    const { container } = render(
      <CompetenciaBrush
        competencias={COMPETENCIAS}
        onCommit={vi.fn()}
        onPreview={vi.fn()}
        onReset={onReset}
        value={{ from: '2023-06', to: '2024-06' }}
        volumeByCompetencia={makeVolume()}
      />,
    );
    // O backdrop é o primeiro <rect> do <svg> (pintura por trás de
    // tudo, com onDoubleClick).
    const backdrop = container.querySelector('svg > rect');
    expect(backdrop).not.toBeNull();
    fireEvent.doubleClick(backdrop!);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  describe('double-click', () => {
    // jsdom não faz layout: getBoundingClientRect devolve zeros e o
    // ResizeObserver nunca dispara, então o brush fica na largura
    // default (640) e `xToIdx` é determinístico a partir do clientX.
    function renderBrush(onReset: (c: null | string) => void) {
      const { container } = render(
        <CompetenciaBrush
          competencias={COMPETENCIAS}
          onCommit={vi.fn()}
          onPreview={vi.fn()}
          onReset={onReset}
          value={{ from: '2023-01', to: '2024-12' }}
          volumeByCompetencia={makeVolume()}
        />,
      );
      return container.querySelector('svg') as SVGSVGElement;
    }

    it('colapsa na competência sob o cursor', () => {
      const onReset = vi.fn();
      const svg = renderBrush(onReset);
      const backdrop = svg.querySelector('rect') as SVGRectElement;
      // 640px / 5 competências = 128px por barra; x=320 cai na 3ª.
      fireEvent.doubleClick(backdrop, { clientX: 320 });
      expect(onReset).toHaveBeenCalledWith('2024-01');
    });

    it('resolve a primeira competência no início do histograma', () => {
      const onReset = vi.fn();
      const svg = renderBrush(onReset);
      fireEvent.doubleClick(svg.querySelector('rect') as SVGRectElement, { clientX: 0 });
      expect(onReset).toHaveBeenCalledWith('2023-01');
    });

    it('resolve a última competência no fim do histograma', () => {
      const onReset = vi.fn();
      const svg = renderBrush(onReset);
      fireEvent.doubleClick(svg.querySelector('rect') as SVGRectElement, { clientX: 640 });
      expect(onReset).toHaveBeenCalledWith('2024-12');
    });

    it('também dispara dentro da janela do brush, não só fora', () => {
      // A janela fica numa camada acima do backdrop; sem o handler nela
      // o meio do histograma viraria uma zona morta.
      const onReset = vi.fn();
      const svg = renderBrush(onReset);
      const janela = [...svg.querySelectorAll('rect')].find(
        (r) => r.getAttribute('stroke') === 'var(--primary)',
      ) as SVGRectElement;
      fireEvent.doubleClick(janela, { clientX: 320 });
      expect(onReset).toHaveBeenCalledWith('2024-01');
    });
  });
});
