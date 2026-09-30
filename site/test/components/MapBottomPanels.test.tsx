import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MapBottomPanels } from '@/components/MapBottomPanels';

function renderPanels(props: Partial<React.ComponentProps<typeof MapBottomPanels>> = {}) {
  return render(
    <MapBottomPanels
      brush={<p>brush</p>}
      range={{ from: '2016-05', to: '2024-05' }}
      selectedMun={null}
      selectedUf="SP"
      table={<p>tabela</p>}
      {...props}
    />,
  );
}

describe('MapBottomPanels', () => {
  it('minimiza cada painel numa barra com o conteúdo guardado, e reabre', () => {
    renderPanels();
    fireEvent.click(screen.getByRole('button', { name: 'Minimizar: SP — municípios' }));
    const bar = screen.getByRole('button', { name: /SP — municípios/ });
    expect(bar).toHaveAttribute('aria-expanded', 'false');
    // O brush continua aberto: cada painel tem o próprio controle.
    expect(
      screen.getByRole('button', { name: /Minimizar: Competência · Mai\. 2016/ }),
    ).toBeInTheDocument();
    fireEvent.click(bar);
    expect(screen.getByRole('button', { name: 'Minimizar: SP — municípios' })).toBeInTheDocument();
  });

  it('rotula a tabela pelo recorte: Brasil, UF ou município', () => {
    renderPanels({ selectedUf: null });
    expect(
      screen.getByRole('button', { name: 'Minimizar: Brasil — visão nacional' }),
    ).toBeInTheDocument();
  });

  it('com município selecionado, a barra traz o nome e a UF', () => {
    renderPanels({ selectedMun: { codigo: '350950', nome: 'Campinas', ufSigla: 'SP' } });
    expect(screen.getByRole('button', { name: 'Minimizar: Campinas — SP' })).toBeInTheDocument();
  });

  it('não renderiza painéis que ainda não carregaram', () => {
    renderPanels({ brush: null, range: null, table: null });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
