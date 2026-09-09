/**
 * Gera `public/anomalies/flags.json` a partir dos quatro artefatos de
 * detectores já materializados em `public/anomalies/`.
 *
 * Separado do `compute-anomalies.ts` de propósito: aquele lê o
 * parquet-opt inteiro (27 UFs) e leva minutos; este só reindexa JSON
 * local, então dá pra regerar o índice sem recomputar detector nenhum.
 *
 * Uso:
 *   pnpm -F @datasus-viz/site anomaly-flags
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AnomalyHit, AnomalyKind } from '../src/lib/anomaly.ts';
import { type AnomalyFlagsPayload, buildAnomalyFlagIndex } from '../src/lib/anomaly-flags.ts';

const KINDS: AnomalyKind[] = ['concentration', 'spike', 'per-capita', 'price-ratio'];

function main(): void {
  const siteRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const dir = resolve(siteRoot, 'public/anomalies');

  const byKind: Record<string, AnomalyHit[]> = {};
  for (const kind of KINDS) {
    const path = resolve(dir, `${kind}.json`);
    const payload = JSON.parse(readFileSync(path, 'utf-8')) as { hits: AnomalyHit[] };
    byKind[kind] = payload.hits;
    process.stderr.write(`  ${kind}: ${payload.hits.length} hits\n`);
  }

  const flags = buildAnomalyFlagIndex(byKind);
  const out: AnomalyFlagsPayload = { flags, generatedAt: new Date().toISOString() };
  const outPath = resolve(dir, 'flags.json');
  writeFileSync(outPath, `${JSON.stringify(out)}\n`, 'utf-8');

  const bytes = readFileSync(outPath).byteLength;
  process.stderr.write(
    `✓ ${outPath} — ${Object.keys(flags).length} municípios, ${(bytes / 1024).toFixed(1)} KB\n`,
  );
}

main();
