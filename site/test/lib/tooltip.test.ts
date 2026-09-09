import { describe, expect, it } from 'vitest';

import { buildOverviewTooltipHtml, formatBRL, formatInt, municipioSubtitle } from '@/lib/tooltip';

describe('formatInt', () => {
  it('arredonda e formata com separador pt-BR', () => {
    expect(formatInt(1234567)).toBe('1.234.567');
  });

  it('arredonda fracionários', () => {
    expect(formatInt(1500.7)).toBe('1.501');
  });

  it('cobre zero', () => {
    expect(formatInt(0)).toBe('0');
  });
});

describe('formatBRL', () => {
  it('formata como moeda brasileira', () => {
    const result = formatBRL(1234.5);
    expect(result).toContain('1.234,50');
    expect(result).toContain('R$');
  });

  it('zero em reais', () => {
    const result = formatBRL(0);
    expect(result).toContain('0,00');
    expect(result).toContain('R$');
  });
});

describe('buildOverviewTooltipHtml', () => {
  it('inclui nome, subtítulo, total e label', () => {
    const html = buildOverviewTooltipHtml({
      name: 'São Paulo',
      subtitle: '2024-01',
      totalLabel: 'exames',
      totalValue: 1234,
    });
    expect(html).toContain('São Paulo');
    expect(html).toContain('2024-01');
    expect(html).toContain('1.234');
    expect(html).toContain('exames');
  });

  it('arredonda totalValue via formatInt', () => {
    const html = buildOverviewTooltipHtml({
      name: 'Brasil',
      subtitle: 'Total',
      totalLabel: 'registros',
      totalValue: 999.9,
    });
    expect(html).toContain('1.000');
  });

  it('inclui rank/total quando ambos presentes', () => {
    const html = buildOverviewTooltipHtml({
      name: 'SP',
      rank: 1,
      rankTotal: 27,
      subtitle: '—',
      totalLabel: 'exames',
      totalValue: 100,
    });
    expect(html).toContain('Rank 1/27');
  });

  it('omite linha de rank quando rank ausente', () => {
    const html = buildOverviewTooltipHtml({
      name: 'SP',
      subtitle: '—',
      totalLabel: 'exames',
      totalValue: 100,
    });
    expect(html).not.toContain('Rank');
  });
});

describe('municipioSubtitle', () => {
  it('convida ao clique quando há dado na faixa', () => {
    expect(municipioSubtitle(true, true)).toMatch(/Clique para ver/);
  });

  it('fala em competência quando o município aparece na série mas não na faixa', () => {
    expect(municipioSubtitle(false, true)).toBe('Sem exames faturados nesta competência');
  });

  it('distingue quem nunca aparece na série', () => {
    // Município sem laboratório próprio: a coleta sai dali e a análise é
    // faturada no estabelecimento executor, então ele nunca entra no
    // agregado. Dizer "nesta competência" sugeria lacuna de um mês.
    const s = municipioSubtitle(false, false);
    expect(s).toMatch(/toda a série/);
    expect(s).toMatch(/outro município/);
    expect(s).not.toMatch(/nesta competência/);
  });

  it('o convite ao clique tem precedência sobre a série', () => {
    expect(municipioSubtitle(true, false)).toMatch(/Clique para ver/);
  });
});
