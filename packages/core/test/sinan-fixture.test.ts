/**
 * E2E contra fixture real SINAN ZIKA BR 2020.
 * Baixada de ftp.datasus.gov.br/dissemin/publicos/SINAN/DADOS/FINAIS/ZIKABR20.dbc
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { readDbcRecords } from '@precisa-saude/datasus-dbc';
import { describe, expect, it } from 'vitest';

import type { SinanArboviroseRecord } from '../src/index.js';
import { countBy, topN } from '../src/index.js';

const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/ZIKABR20.dbc', import.meta.url));
const fixture = new Uint8Array(readFileSync(FIXTURE_PATH));

describe('SINAN ZIKA BR 2020 — fixture', () => {
  it('decodifica registros com campos core do SINAN', async () => {
    const records: SinanArboviroseRecord[] = [];
    for await (const record of readDbcRecords(fixture)) {
      records.push(record as SinanArboviroseRecord);
      if (records.length >= 5) break;
    }

    expect(records).toHaveLength(5);
    for (const record of records) {
      expect(record).toHaveProperty('DT_NOTIFIC');
      expect(record).toHaveProperty('ID_MUNICIP');
      expect(record).toHaveProperty('CLASSI_FIN');
    }
  });

  it('agrega top-10 UFs por notificação de zika (JSON-ready)', async () => {
    const records: SinanArboviroseRecord[] = [];
    for await (const record of readDbcRecords(fixture)) {
      records.push(record as SinanArboviroseRecord);
    }

    expect(records.length).toBeGreaterThan(0);

    const byUf = countBy(records, (r) => r.SG_UF_NOT);
    const top = topN(byUf, 10);

    expect(top.length).toBeGreaterThan(0);
    expect(() => JSON.stringify(top)).not.toThrow();
  });
});
