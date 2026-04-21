import { describe, expect, it } from 'vitest';

import { sihRdFtpPath } from '../src/datasets/sih/paths.js';

describe('sihRdFtpPath', () => {
  it('builds canonical path for AC 2024/01', () => {
    expect(sihRdFtpPath({ month: 1, uf: 'AC', year: 2024 })).toBe(
      '/dissemin/publicos/SIHSUS/200801_/Dados/RDAC2401.dbc',
    );
  });

  it('pads month and year correctly', () => {
    expect(sihRdFtpPath({ month: 3, uf: 'SP', year: 2024 })).toBe(
      '/dissemin/publicos/SIHSUS/200801_/Dados/RDSP2403.dbc',
    );
    expect(sihRdFtpPath({ month: 12, uf: 'RJ', year: 2008 })).toBe(
      '/dissemin/publicos/SIHSUS/200801_/Dados/RDRJ0812.dbc',
    );
  });

  it('accepts lowercase UF', () => {
    expect(sihRdFtpPath({ month: 1, uf: 'ac', year: 2024 })).toContain('RDAC');
  });

  it('rejects invalid UF', () => {
    expect(() => sihRdFtpPath({ month: 1, uf: 'XX', year: 2024 })).toThrow(/UF inválida/);
  });

  it('rejects invalid year', () => {
    expect(() => sihRdFtpPath({ month: 1, uf: 'AC', year: 2000 })).toThrow(/Ano inválido/);
  });

  it('rejects invalid month', () => {
    expect(() => sihRdFtpPath({ month: 0, uf: 'AC', year: 2024 })).toThrow(/Mês inválido/);
    expect(() => sihRdFtpPath({ month: 13, uf: 'AC', year: 2024 })).toThrow(/Mês inválido/);
  });
});
