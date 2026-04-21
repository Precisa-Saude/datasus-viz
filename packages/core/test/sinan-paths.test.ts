import { describe, expect, it } from 'vitest';

import { labelAgravo, sinanFtpPath } from '../src/datasets/sinan/index.js';

describe('sinanFtpPath', () => {
  it('builds canonical DENG path (final, 2024)', () => {
    expect(sinanFtpPath({ agravo: 'DENG', year: 2024 })).toBe(
      '/dissemin/publicos/SINAN/DADOS/FINAIS/DENGBR24.dbc',
    );
  });

  it('uses PRELIM directory when preliminar=true', () => {
    expect(sinanFtpPath({ agravo: 'CHIK', preliminar: true, year: 2024 })).toBe(
      '/dissemin/publicos/SINAN/DADOS/PRELIM/CHIKBR24.dbc',
    );
  });

  it('pads year as 2-digit', () => {
    expect(sinanFtpPath({ agravo: 'ZIKA', year: 2008 })).toBe(
      '/dissemin/publicos/SINAN/DADOS/FINAIS/ZIKABR08.dbc',
    );
  });

  it('rejects unsupported agravo', () => {
    // @ts-expect-error — passing invalid agravo on purpose
    expect(() => sinanFtpPath({ agravo: 'MALAR', year: 2024 })).toThrow(/Agravo inválido/);
  });

  it('rejects invalid year', () => {
    expect(() => sinanFtpPath({ agravo: 'DENG', year: 2005 })).toThrow(/Ano inválido/);
  });
});

describe('labelAgravo', () => {
  it('returns pt-BR label', () => {
    expect(labelAgravo('DENG')).toBe('Dengue');
    expect(labelAgravo('CHIK')).toBe('Chikungunya');
    expect(labelAgravo('ZIKA')).toBe('Zika');
  });
});
