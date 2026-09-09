#!/usr/bin/env tsx
/**
 * Extrai o mapa `código IBGE (6 díg.) → nome do município` do
 * `@precisa-saude/datasus-sdk` e escreve em
 * `public/data/municipios.json`.
 *
 * Existe porque as geometrias vêm da API de malhas do IBGE, que
 * devolve só `codarea` — nenhuma propriedade de nome. Sem esta tabela,
 * um município sem exames faturados na competência selecionada não tem
 * de onde tirar o nome (o feature-state só cobre quem está no agregado)
 * e o mapa cai no rótulo cru "código 4311718".
 *
 * Vai para `public/` e não para `src/lib/` — 131 KB no bundle inicial
 * penalizaria quem nunca abre um drill-down, enquanto o
 * `loinc-sigtap-catalog.generated.json`, com 2 KB, cabe embutido.
 *
 * Re-rodar quando o `@precisa-saude/datasus-sdk` for atualizado:
 *
 *   pnpm -F @datasus-viz/site municipio-names
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allMunicipios } from '@precisa-saude/datasus-sdk';

const OUT_PATH = resolve(fileURLToPath(import.meta.url), '../../public/data/municipios.json');

function main(): void {
  const municipios = typeof allMunicipios === 'function' ? allMunicipios() : allMunicipios;
  const names: Record<string, string> = {};
  for (const m of municipios) {
    // O SIA usa o código de 6 dígitos (sem o dígito verificador), que é
    // também a chave canônica do resto do projeto.
    names[String(m.id).slice(0, 6)] = m.nome;
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    names,
    source: 'IBGE via @precisa-saude/datasus-sdk (allMunicipios)',
  };
  writeFileSync(OUT_PATH, `${JSON.stringify(payload)}\n`, 'utf-8');
  process.stderr.write(`✓ ${OUT_PATH} — ${Object.keys(names).length} municípios\n`);
}

main();
