/**
 * Helpers de consumo de streams de registros com limite opcional e
 * emissão JSONL incremental pro modo `--raw`.
 */

import type { ParsedArgs } from './args.js';
import { optInt, UsageError } from './args.js';
import type { OutputFormat } from './output.js';
import { parseFormat } from './output.js';

export interface StreamOptions {
  format: OutputFormat;
  /** null = sem limite. */
  limit: null | number;
  raw: boolean;
}

export function parseStreamOptions(args: ParsedArgs): StreamOptions {
  const rawLimit = args.opts.get('limit');
  const limit = rawLimit === undefined ? null : optInt(args, 'limit', 0);
  if (limit !== null && limit <= 0) {
    throw new UsageError("--limit deve ser inteiro positivo (ex: '--limit 100').");
  }
  const raw = args.bools.has('raw');
  // `--raw` sem `--format` defaulta pra jsonl (streaming-friendly).
  const formatRaw = args.opts.get('format') ?? (raw ? 'jsonl' : undefined);
  return { format: parseFormat(formatRaw), limit, raw };
}

/**
 * Consome um async iterable com limite opcional, invocando o callback
 * `onRecord` por registro. Retorna o total de registros consumidos.
 */
export async function consumeStream<T>(
  source: AsyncIterable<T>,
  limit: null | number,
  onRecord: (record: T) => void,
): Promise<number> {
  let n = 0;
  for await (const record of source) {
    onRecord(record);
    n++;
    if (limit !== null && n >= limit) break;
  }
  return n;
}

/**
 * Emite um registro como linha JSONL no stdout. Usado no modo `--raw
 * --format jsonl` (default do `--raw`) para saída de memória constante.
 */
export function emitJsonlRecord(record: unknown): void {
  process.stdout.write(`${JSON.stringify(record)}\n`);
}
