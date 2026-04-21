/**
 * Teste end-to-end da composição: DBC decoder + agregações + labeling.
 *
 * Usa a fixture SIH-RD AC 2024/01 já commitada em `packages/dbc/test/fixtures/`.
 * Pula a camada FTP (consumidor típico teria os bytes de algum canal).
 * Valida que o pipeline completo produz JSON consumível.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { readDbcRecords } from '@precisa-saude/datasus-dbc';
import { describe, expect, it } from 'vitest';

import type { SihRdRecord } from '../src/index.js';
import { countBy, countByNested, findMunicipio, topN } from '../src/index.js';

const FIXTURE_PATH = fileURLToPath(
  new URL('../../dbc/test/fixtures/RDAC2401.dbc', import.meta.url),
);
const fixture = new Uint8Array(readFileSync(FIXTURE_PATH));

async function loadFixture(): Promise<SihRdRecord[]> {
  const records: SihRdRecord[] = [];
  for await (const record of readDbcRecords(fixture)) {
    records.push(record as SihRdRecord);
  }
  return records;
}

describe('SIH-RD AC 2024/01 — agregações', () => {
  it('produz top-10 de municípios por internações, enriquecido com nome IBGE', async () => {
    const records = await loadFixture();
    const byMunicipio = countBy(records, (r) => r.MUNIC_RES);
    const top = topN(byMunicipio, 10);

    expect(top).toHaveLength(10);

    const enriched = top.map(({ count, key }) => {
      const m = findMunicipio(key);
      return {
        internacoes: count,
        municipio_codigo: key,
        municipio_nome: m?.nome ?? null,
        uf: m?.uf ?? null,
      };
    });

    // Todos os registros AC — UF deve ser 'AC' nos municípios do top
    const ufs = new Set(enriched.map((e) => e.uf));
    expect(ufs.has('AC')).toBe(true);

    // Pipeline inteiro é JSON-serializável
    expect(() => JSON.stringify(enriched, null, 2)).not.toThrow();
  });

  it('agrega por município × CID principal', async () => {
    const records = await loadFixture();
    const byMunCid = countByNested(
      records,
      (r) => r.MUNIC_RES,
      (r) => r.DIAG_PRINC,
    );

    // Rio Branco (120040) deve ter o maior volume no AC
    const rioBranco = byMunCid['120040'];
    expect(rioBranco).toBeDefined();
    expect(Object.keys(rioBranco!).length).toBeGreaterThan(0);

    // Serializa sem erros
    const json = JSON.stringify(byMunCid);
    expect(JSON.parse(json)).toEqual(byMunCid);
  });
});
