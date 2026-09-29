import { act, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DocLayout, InlineToc, type TocItem } from '@/components/DocLayout';

const TOC: readonly TocItem[] = [
  { id: 'um', label: 'Primeira' },
  { id: 'dois', label: 'Segunda' },
  { id: 'tres', label: 'Terceira' },
];

/** Posiciona cada seção: `tops[id]` vira o topo devolvido por getBoundingClientRect. */
function placeSections(tops: Record<string, number>): void {
  for (const [id, top] of Object.entries(tops)) {
    const el = document.getElementById(id);
    if (el) el.getBoundingClientRect = () => ({ top }) as DOMRect;
  }
}

function setScroll({ height, y }: { height: number; y: number }): void {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: height,
  });
}

function renderPage() {
  return render(
    <DocLayout toc={TOC}>
      <InlineToc items={TOC} />
      {TOC.map((item) => (
        <section key={item.id} id={item.id}>
          <h2>{item.label}</h2>
        </section>
      ))}
    </DocLayout>,
  );
}

function rail(): HTMLElement {
  return screen.getByRole('complementary');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DocLayout', () => {
  it('renderiza o sumário lateral e o inline com os mesmos destinos', () => {
    renderPage();
    const navs = screen.getAllByRole('navigation', { name: 'Sumário desta página' });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      const hrefs = within(nav)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href'));
      expect(hrefs).toEqual(['#um', '#dois', '#tres']);
    }
  });

  it('marca como atual a última seção que cruzou a linha do cabeçalho', () => {
    setScroll({ height: 5000, y: 600 });
    renderPage();
    placeSections({ dois: 40, tres: 700, um: -400 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    const current = within(rail()).getByRole('link', { current: 'location' });
    expect(current).toHaveTextContent('Segunda');
  });

  it('não marca nada antes de a primeira seção chegar ao topo', () => {
    setScroll({ height: 5000, y: 0 });
    renderPage();
    placeSections({ dois: 900, tres: 1500, um: 300 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(within(rail()).queryByRole('link', { current: 'location' })).toBeNull();
  });

  it('marca a última seção no fim da página, mesmo sem ela chegar ao topo', () => {
    setScroll({ height: 1400, y: 600 });
    renderPage();
    placeSections({ dois: -100, tres: 400, um: -600 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(within(rail()).getByRole('link', { current: 'location' })).toHaveTextContent('Terceira');
  });

  it('recalcula ao redimensionar, sem depender de nova rolagem', () => {
    setScroll({ height: 5000, y: 0 });
    renderPage();
    placeSections({ dois: 900, tres: 1500, um: 300 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    placeSections({ dois: 900, tres: 1500, um: 50 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(within(rail()).getByRole('link', { current: 'location' })).toHaveTextContent('Primeira');
  });

  it('ignora itens do sumário sem seção correspondente no DOM', () => {
    setScroll({ height: 5000, y: 0 });
    render(
      <DocLayout toc={[{ id: 'ausente', label: 'Ausente' }]}>
        <p>Sem seções</p>
      </DocLayout>,
    );
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(within(rail()).queryByRole('link', { current: 'location' })).toBeNull();
  });

  it('remove os ouvintes ao desmontar', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderPage();
    unmount();
    const events = remove.mock.calls.map(([type]) => type);
    expect(events).toEqual(expect.arrayContaining(['scroll', 'resize']));
  });
});
