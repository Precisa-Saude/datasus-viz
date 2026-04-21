/**
 * Loader alto-nível para SIH-RD.
 *
 * Compõe FTP client + decoder DBC + tipagem para entregar registros
 * prontos ao consumidor. Cache via camada FTP — a segunda chamada com
 * os mesmos parâmetros retorna imediatamente do disco.
 */

import { readDbcRecords } from '@precisa-saude/datasus-dbc';

import type { DownloadOptions } from '../../ftp/index.js';
import { download } from '../../ftp/index.js';
import type { SihPathParams } from './paths.js';
import { sihRdFtpPath } from './paths.js';
import type { SihRdRecord } from './types.js';

export interface LoadOptions extends SihPathParams {
  /** Opções de cache/FTP. */
  ftp?: Omit<DownloadOptions, 'path'>;
}

/**
 * Baixa (com cache) e decodifica um arquivo SIH-RD UF/ano/mês, retornando
 * todos os registros em memória como um array.
 *
 * Para arquivos grandes (SP, RJ, MG), prefira `streamRecords` — este
 * método carrega tudo em memória.
 */
export async function load(options: LoadOptions): Promise<SihRdRecord[]> {
  const path = sihRdFtpPath(options);
  const bytes = await download({ ...options.ftp, path });

  const records: SihRdRecord[] = [];
  for await (const record of readDbcRecords(bytes)) {
    records.push(record as SihRdRecord);
  }
  return records;
}

/**
 * Versão streaming — retorna um async iterable de registros. Preferir esta
 * API para datasets grandes ou processamento single-pass.
 */
export async function* streamRecords(options: LoadOptions): AsyncIterable<SihRdRecord> {
  const path = sihRdFtpPath(options);
  const bytes = await download({ ...options.ftp, path });
  for await (const record of readDbcRecords(bytes)) {
    yield record as SihRdRecord;
  }
}
