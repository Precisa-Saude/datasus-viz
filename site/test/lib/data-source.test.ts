import { describe, expect, it } from 'vitest';

import {
  DATA_BASE_URL,
  MANIFEST_URL,
  PMTILES_URL,
  rawSiaPaUrl,
  setParquetOptVersion,
  ufPartitionUrl,
  ufTotalsUrl,
} from '@/lib/data-source';

describe('data-source URLs', () => {
  it('DATA_BASE_URL cai no CloudFront quando VITE_DATA_BASE_URL não é setado', () => {
    // No ambiente de teste (jsdom), VITE_DATA_BASE_URL tipicamente
    // não é injetado, então o fallback do CloudFront vale.
    expect(DATA_BASE_URL).toMatch(/^https?:\/\/|^\//);
  });

  it('PMTILES_URL aponta pra geo/brasil.pmtiles', () => {
    expect(PMTILES_URL).toBe(`${DATA_BASE_URL}/geo/brasil.pmtiles`);
  });

  it('MANIFEST_URL aponta pro index.json', () => {
    expect(MANIFEST_URL).toBe(`${DATA_BASE_URL}/manifest/index.json`);
  });

  it('ufTotalsUrl lança quando a versão ainda não foi definida', () => {
    // O prefixo legado sem versão responde 403 no bucket — emitir essa
    // URL só produzia falha silenciosa rio abaixo.
    setParquetOptVersion(undefined);
    expect(() => ufTotalsUrl()).toThrow(/parquetOptVersion não definida/);
  });

  it('ufTotalsUrl insere prefixo de versão quando setado', () => {
    setParquetOptVersion('v20260518T215851');
    expect(ufTotalsUrl()).toBe(`${DATA_BASE_URL}/parquet-opt/v20260518T215851/uf-totals.parquet`);
    setParquetOptVersion(undefined);
  });
});

describe('ufPartitionUrl', () => {
  it('lança quando a versão ainda não foi definida', () => {
    setParquetOptVersion(undefined);
    expect(() => ufPartitionUrl('AC')).toThrow(/parquetOptVersion não definida/);
  });

  it('insere prefixo de versão quando setado', () => {
    setParquetOptVersion('v20260518T215851');
    expect(ufPartitionUrl('SP')).toBe(
      `${DATA_BASE_URL}/parquet-opt/v20260518T215851/uf=SP/part.parquet`,
    );
    setParquetOptVersion(undefined);
  });

  it('preserva o case da sigla', () => {
    setParquetOptVersion('v20260518T215851');
    expect(ufPartitionUrl('SP')).toContain('uf=SP/');
    setParquetOptVersion(undefined);
  });
});

describe('rawSiaPaUrl', () => {
  it('monta URL no layout Hive ano=YYYY/uf=XX/mes=MM no prefixo /sia-pa', () => {
    expect(rawSiaPaUrl(2018, 'RS', 9)).toBe(
      `${DATA_BASE_URL}/sia-pa/ano=2018/uf=RS/mes=09/part.parquet`,
    );
  });

  it('zero-pad para o mês de um dígito', () => {
    expect(rawSiaPaUrl(2024, 'SP', 1)).toContain('mes=01/');
    expect(rawSiaPaUrl(2024, 'SP', 12)).toContain('mes=12/');
  });
});
