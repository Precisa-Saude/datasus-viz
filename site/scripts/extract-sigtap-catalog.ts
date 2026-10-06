#!/usr/bin/env tsx
/**
 * Extrai um catálogo mínimo (LOINC → SIGTAPs[]) do
 * `@precisa-saude/datasus-sdk` e escreve em
 * `src/lib/loinc-sigtap-catalog.generated.json`.
 *
 * O SDK agrega FTP/DBC/fs no bundle e não roda no browser. Em vez de
 * stubar essas dependências, extraímos apenas o subset que o site
 * precisa (terminologia) num arquivo estático committed e mantemos o
 * SDK fora do bundle de browser.
 *
 * Re-rodar quando o `@precisa-saude/datasus-sdk` for atualizado:
 *
 *   pnpm -F @datasus-viz/site exec tsx scripts/extract-sigtap-catalog.ts
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listBiomarkers } from '@precisa-saude/datasus-sdk';

const OUT_PATH = resolve(
  fileURLToPath(import.meta.url),
  '../../src/lib/loinc-sigtap-catalog.generated.json',
);

const byLoinc = new Map<string, Set<string>>();

// Só os representantes reversos entram: é o que `sigtapToLoinc` devolve
// na agregação, logo é o que aparece no manifesto e nas queries do site.
// Biomarcadores que mapeiam para um SIGTAP compartilhado sem representá-lo
// (glicose na urina → "Dosagem de glicose") ficam de fora para o catálogo
// não sugerir um LOINC que nenhum agregado usa. `sigtapAlso` cobre os
// casos em que um biomarcador tem mais de um código SUS (PCR genérica +
// quantitativa).
for (const mapping of listBiomarkers()) {
  if (mapping.loinc == null || mapping.sigtap == null || !mapping.reversePrimary) continue;
  const set = byLoinc.get(mapping.loinc) ?? new Set<string>();
  set.add(mapping.sigtap);
  for (const extra of mapping.sigtapAlso) set.add(extra);
  byLoinc.set(mapping.loinc, set);
}

const catalog: Record<string, string[]> = {};
for (const [loinc, sigtaps] of byLoinc) {
  catalog[loinc] = Array.from(sigtaps).sort();
}

const sortedKeys = Object.keys(catalog).sort();
const sorted: Record<string, string[]> = {};
for (const k of sortedKeys) sorted[k] = catalog[k]!;

writeFileSync(OUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf-8');
process.stderr.write(`✓ ${OUT_PATH} (${sortedKeys.length} LOINCs)\n`);
