#!/usr/bin/env tsx
/**
 * Exemplo: SINAN dengue → top-10 UFs por notificação → JSON.
 *
 * Uso:
 *   pnpm exec tsx examples/sinan-dengue-by-uf.ts [AGRAVO] [YEAR]
 *
 * AGRAVO ∈ {DENG, CHIK, ZIKA}. Default: DENG 2023.
 *
 * Arquivos SINAN são BR-wide. Dengue em anos de surto pode ter
 * centenas de milhares de registros — considere usar sinan.streamRecords
 * em produção.
 */

import { countBy, labelAgravo, sinan, topN } from '@precisa-saude/datasus';
import type { SinanAgravo } from '@precisa-saude/datasus/datasets/sinan';

const agravo = ((process.argv[2] ?? 'DENG') as string).toUpperCase() as SinanAgravo;
const year = Number(process.argv[3] ?? '2023');

process.stderr.write(`Baixando SINAN ${labelAgravo(agravo)} ${year}...\n`);
const records = await sinan.load({ agravo, year });
process.stderr.write(`Carregados ${records.length} registros.\n`);

const byUf = countBy(records, (r) => r.SG_UF_NOT);
const top = topN(byUf, 10);

process.stdout.write(`${JSON.stringify(top, null, 2)}\n`);
