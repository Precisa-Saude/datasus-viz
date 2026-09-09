/**
 * Índice compacto de anomalias por município × competência.
 *
 * Os quatro artefatos de `public/anomalies/*.json` somam ~7,5 MB — cedo
 * demais para baixar só pra decidir se um ícone de alerta aparece ao
 * lado do nome de um município. Este índice guarda apenas o que a UI
 * precisa (município, competência, detector, LOINC) numa estrutura
 * aninhada que elimina a repetição das chaves.
 */
import type { AnomalyHit, AnomalyKind } from './anomaly';

/** `{ municipioCode6: { competencia: { kind: loinc[] } } }` */
export type AnomalyFlagIndex = Record<
  string,
  Record<string, Partial<Record<AnomalyKind, string[]>>>
>;

export interface AnomalyFlagsPayload {
  flags: AnomalyFlagIndex;
  generatedAt: string;
}

/** Uma anomalia já resolvida para exibição no painel. */
export interface ResolvedFlag {
  competencia: string;
  kind: AnomalyKind;
  loincs: string[];
}

export function buildAnomalyFlagIndex(byKind: Record<string, AnomalyHit[]>): AnomalyFlagIndex {
  const index: AnomalyFlagIndex = {};
  for (const [kind, hits] of Object.entries(byKind)) {
    for (const hit of hits) {
      const mun = hit.municipioCode.slice(0, 6);
      const porCompetencia = (index[mun] ??= {});
      const porKind = (porCompetencia[hit.competencia] ??= {});
      const loincs = (porKind[kind as AnomalyKind] ??= []);
      if (!loincs.includes(hit.loinc)) loincs.push(hit.loinc);
    }
  }
  return index;
}

/**
 * Anomalias de um município dentro de uma faixa fechada de
 * competências, ordenadas por competência.
 */
export function flagsForMunicipio(
  index: AnomalyFlagIndex,
  municipioCode: string,
  range: { from: string; to: string },
): ResolvedFlag[] {
  const porCompetencia = index[municipioCode.slice(0, 6)];
  if (!porCompetencia) return [];
  const out: ResolvedFlag[] = [];
  for (const [competencia, porKind] of Object.entries(porCompetencia)) {
    if (competencia < range.from || competencia > range.to) continue;
    for (const [kind, loincs] of Object.entries(porKind)) {
      out.push({ competencia, kind: kind as AnomalyKind, loincs: loincs ?? [] });
    }
  }
  return out.sort(
    (a, b) => a.competencia.localeCompare(b.competencia) || a.kind.localeCompare(b.kind),
  );
}

/** Rótulo curto de cada detector, para o tooltip. */
export const KIND_LABEL: Record<AnomalyKind, string> = {
  concentration: 'concentração incomum do volume nacional',
  'per-capita': 'volume por habitante fora do padrão',
  'price-ratio': 'valor por exame fora do padrão',
  spike: 'pico atípico frente ao histórico do próprio município',
};
