/**
 * Loader alto-nível para SINAN (arboviroses).
 */

import { readDbcRecords } from '@precisa-saude/datasus-dbc';

import type { DownloadOptions } from '../../ftp/index.js';
import { download } from '../../ftp/index.js';
import type { SinanPathParams } from './paths.js';
import { sinanFtpPath } from './paths.js';
import type { SinanArboviroseRecord } from './types.js';

export interface LoadOptions extends SinanPathParams {
  /** Opções de cache/FTP. */
  ftp?: Omit<DownloadOptions, 'path'>;
}

/**
 * Baixa e decodifica um arquivo SINAN (agravo × ano), retornando todos
 * os registros em memória. SINAN é BR-wide — arquivos de dengue podem
 * ter centenas de milhares de registros em anos de surto; prefira
 * `streamRecords` nesses casos.
 */
export async function load(options: LoadOptions): Promise<SinanArboviroseRecord[]> {
  const path = sinanFtpPath(options);
  const bytes = await download({ ...options.ftp, path });

  const records: SinanArboviroseRecord[] = [];
  for await (const record of readDbcRecords(bytes)) {
    records.push(record as SinanArboviroseRecord);
  }
  return records;
}

/** Versão streaming — recomendado para agravos de alto volume. */
export async function* streamRecords(options: LoadOptions): AsyncIterable<SinanArboviroseRecord> {
  const path = sinanFtpPath(options);
  const bytes = await download({ ...options.ftp, path });
  for await (const record of readDbcRecords(bytes)) {
    yield record as SinanArboviroseRecord;
  }
}
