import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetMunicipioNamesCacheForTests,
  loadMunicipioNames,
  resolveMunicipioName,
} from '@/lib/municipios';

const fetchSpy = vi.spyOn(globalThis, 'fetch');

beforeEach(() => {
  __resetMunicipioNamesCacheForTests();
  fetchSpy.mockReset();
});
afterEach(() => fetchSpy.mockReset());

function okResponse(names: Record<string, string>): Response {
  return {
    json: () => Promise.resolve({ generatedAt: 'x', names, source: 'y' }),
    ok: true,
  } as unknown as Response;
}

describe('resolveMunicipioName', () => {
  const names = { '311360': 'Careaçu', '431171': 'Maçambará' };

  it('prefere o nome do feature-state quando existe', () => {
    expect(resolveMunicipioName('Do estado', names, '311360', 'fallback')).toBe('Do estado');
  });

  it('cai na tabela do IBGE quando não há feature-state', () => {
    // É o caso do município sem exames faturados na competência: o
    // agregado não o inclui, então o feature-state nunca é setado.
    expect(resolveMunicipioName(undefined, names, '431171', 'código 4311718')).toBe('Maçambará');
  });

  it('cai no fallback quando a tabela não tem o código', () => {
    expect(resolveMunicipioName(undefined, names, '999999', 'código 9999999')).toBe(
      'código 9999999',
    );
  });

  it('cai no fallback quando a tabela ainda não carregou', () => {
    expect(resolveMunicipioName(undefined, {}, '311360', 'código 3113602')).toBe('código 3113602');
  });
});

describe('loadMunicipioNames', () => {
  it('busca o JSON e devolve o mapa de nomes', async () => {
    fetchSpy.mockResolvedValue(okResponse({ '311360': 'Careaçu' }));
    await expect(loadMunicipioNames()).resolves.toEqual({ '311360': 'Careaçu' });
    expect(fetchSpy).toHaveBeenCalledWith('/data/municipios.json');
  });

  it('memoiza — chamadas concorrentes compartilham um fetch só', async () => {
    fetchSpy.mockResolvedValue(okResponse({ '311360': 'Careaçu' }));
    await Promise.all([loadMunicipioNames(), loadMunicipioNames(), loadMunicipioNames()]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('rejeita com status quando a resposta não é ok', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 404 } as unknown as Response);
    await expect(loadMunicipioNames()).rejects.toThrow(/404/);
  });
});
