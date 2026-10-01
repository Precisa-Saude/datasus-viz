import type { CompetenciaRange } from './aggregates';

/**
 * Quantas competências o DATASUS ainda reescreve a cada publicação mensal:
 * a mais recente e as 12 anteriores. Padrão observado nas datas dos
 * arquivos do FTP, não regra publicada — ver a seção "Atualizações e
 * revisões" da página Sobre.
 */
export const REVISION_WINDOW = 13;

/**
 * Primeira competência ainda sujeita a revisão, dada a lista do manifesto.
 * `null` quando não há competências.
 */
export function firstProvisionalCompetencia(competencias: readonly string[]): null | string {
  if (competencias.length === 0) return null;
  const sorted = [...competencias].sort();
  return sorted[Math.max(0, sorted.length - REVISION_WINDOW)] ?? null;
}

/**
 * Trecho da faixa selecionada que cai na janela revisável, ou `null` se a
 * faixa termina antes dela. Competências `YYYY-MM` comparam
 * lexicograficamente.
 */
export function provisionalOverlap(
  range: CompetenciaRange,
  firstProvisional: null | string,
): CompetenciaRange | null {
  if (firstProvisional === null || range.to < firstProvisional) return null;
  return { from: range.from > firstProvisional ? range.from : firstProvisional, to: range.to };
}
