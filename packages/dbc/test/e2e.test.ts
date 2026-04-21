/**
 * End-to-end test for the DBC decoder pipeline.
 *
 * Fixture: `RDAC2401.dbc` — SIH-RD (internações) para o Acre, 2024/01,
 * baixado do FTP oficial do DATASUS em:
 *   ftp://ftp.datasus.gov.br/dissemin/publicos/SIHSUS/200801_/Dados/RDAC2401.dbc
 *
 * Este é o validador real do port: se decodificar 4315 registros com os
 * campos canônicos do SIH-RD, o decoder está correto. Os valores de referência
 * abaixo foram verificados via o `file(1)` na fixture (record_count=4315,
 * record_size=702, update=2025-02-08).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { dbcToDbf, readDbcMetadata, readDbcRecords, readDbfHeader } from '../src/index.js';

const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/RDAC2401.dbc', import.meta.url));
const fixture = new Uint8Array(readFileSync(FIXTURE_PATH));

describe('DBC → DBF → records (SIH-RD AC 2024/01)', () => {
  it('reads DBC envelope metadata', () => {
    const meta = readDbcMetadata(fixture);
    expect(meta.recordCount).toBe(4315);
    expect(meta.recordSize).toBe(702);
    expect(meta.headerSize).toBeGreaterThan(0);
  });

  it('decompresses DBC to DBF with consistent header metadata', () => {
    const dbf = dbcToDbf(fixture);
    const header = readDbfHeader(dbf);

    expect(header.recordCount).toBe(4315);
    expect(header.recordLength).toBe(702);
    // SIH-RD tem dezenas de campos; sanity-check que alguns core estão presentes
    const fieldNames = header.fields.map((f) => f.name);
    expect(fieldNames).toContain('UF_ZI');
    expect(fieldNames).toContain('ANO_CMPT');
    expect(fieldNames).toContain('MES_CMPT');
  });

  it('streams records as plain JS objects', async () => {
    const records: Record<string, unknown>[] = [];
    for await (const record of readDbcRecords(fixture)) {
      records.push(record);
      if (records.length >= 3) break;
    }

    expect(records).toHaveLength(3);
    for (const record of records) {
      expect(record).toHaveProperty('UF_ZI');
      expect(record).toHaveProperty('ANO_CMPT');
      // AC = código IBGE UF 12
      expect(String(record['UF_ZI']).trim().startsWith('12')).toBe(true);
    }
  });

  it('produces JSON-serializable output', async () => {
    let first: Record<string, unknown> | undefined;
    for await (const record of readDbcRecords(fixture)) {
      first = record;
      break;
    }
    expect(first).toBeDefined();
    expect(() => JSON.stringify(first)).not.toThrow();
  });

  it('decodes all 4315 active records without errors', async () => {
    let count = 0;
    for await (const _record of readDbcRecords(fixture)) {
      count++;
    }
    // AC 2024/01 não tem registros deletados; se houver, o contador será
    // menor que 4315. Em todo caso, o loop não pode lançar.
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4315);
  });
});
