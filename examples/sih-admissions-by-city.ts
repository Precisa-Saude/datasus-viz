#!/usr/bin/env tsx
/**
 * Exemplo end-to-end: SIH-RD → top-10 municípios por internações → JSON.
 *
 * Baixa o arquivo SIH-RD para uma UF × ano × mês via FTP DATASUS (com
 * cache local), decodifica, agrega por município e emite JSON no stdout
 * pronto para consumo por web apps ou CLIs.
 *
 * Uso:
 *   pnpm exec tsx examples/sih-admissions-by-city.ts [UF] [YEAR] [MONTH]
 *
 * Default: AC 2024 1 (menor volume — ideal para verificação rápida).
 *
 * Exemplo:
 *   pnpm exec tsx examples/sih-admissions-by-city.ts SP 2024 3 \
 *     | jq '.[0]'
 */

import { countBy, findMunicipio, sih, topN } from '@precisa-saude/datasus';

const uf = process.argv[2] ?? 'AC';
const year = Number(process.argv[3] ?? '2024');
const month = Number(process.argv[4] ?? '1');

process.stderr.write(`Baixando SIH-RD ${uf}/${year}/${String(month).padStart(2, '0')}...\n`);
const records = await sih.load({ month, uf, year });
process.stderr.write(`Carregados ${records.length} registros.\n`);

const byMunicipio = countBy(records, (r) => r.MUNIC_RES);
const top = topN(byMunicipio, 10);

const enriched = top.map(({ count, key }) => {
  const m = findMunicipio(key);
  return {
    internacoes: count,
    municipio_codigo: key,
    municipio_nome: m?.nome ?? null,
    uf: m?.uf ?? null,
  };
});

process.stdout.write(`${JSON.stringify(enriched, null, 2)}\n`);
