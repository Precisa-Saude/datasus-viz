import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InfoTooltip } from '@/components/ui/info-tooltip';

function renderTooltip(width?: number) {
  return render(
    <InfoTooltip ariaLabel="Explicar" trigger={<span>i</span>} width={width}>
      <p>Conteúdo</p>
    </InfoTooltip>,
  );
}

describe('InfoTooltip', () => {
  it('abre no hover e fecha ao sair', () => {
    renderTooltip();
    const botao = screen.getByRole('button', { name: 'Explicar' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.mouseEnter(botao);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Conteúdo');
    fireEvent.mouseLeave(botao);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('abre no foco e associa via aria-describedby', () => {
    renderTooltip();
    const botao = screen.getByRole('button', { name: 'Explicar' });
    fireEvent.focus(botao);
    const tooltip = screen.getByRole('tooltip');
    expect(botao).toHaveAttribute('aria-describedby', tooltip.getAttribute('id'));
  });

  it('Escape fecha mesmo sem foco no botão', () => {
    // Aberto por hover, o botão não tem foco — um listener só no botão
    // não veria a tecla. O padrão de tooltip do WAI-ARIA APG pede que
    // Escape dispense em qualquer caso.
    renderTooltip();
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Explicar' }));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('respeita a largura customizada', () => {
    renderTooltip(200);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Explicar' }));
    expect(screen.getByRole('tooltip')).toHaveStyle({ width: '200px' });
  });

  it('usa 288px como largura default', () => {
    renderTooltip();
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Explicar' }));
    expect(screen.getByRole('tooltip')).toHaveStyle({ width: '288px' });
  });
});
