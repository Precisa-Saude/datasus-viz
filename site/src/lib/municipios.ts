/**
 * Nomes de município por código IBGE de 6 dígitos.
 *
 * As geometrias vêm da API de malhas do IBGE, que devolve apenas
 * `codarea` — sem nome. Até aqui o nome só chegava ao mapa pelo
 * feature-state, que é populado a partir do agregado do SIA; município
 * sem exames faturados na competência selecionada ficava sem nome e o
 * tooltip caía no rótulo cru "código 4311718".
 *
 * Carregado sob demanda e memoizado: só quem entra num drill-down paga
 * os ~44 KB (gzip). Falha é não-fatal — sem a tabela, o mapa volta ao
 * comportamento anterior.
 */

import { normalizeText } from './search';

const MUNICIPIOS_URL = '/data/municipios.json';

interface MunicipiosPayload {
  generatedAt: string;
  names: Record<string, string>;
  source: string;
}

let cache: null | Promise<Record<string, string>> = null;

export function loadMunicipioNames(): Promise<Record<string, string>> {
  cache ??= fetch(MUNICIPIOS_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Falha ao carregar municípios (${res.status}).`);
      return res.json() as Promise<MunicipiosPayload>;
    })
    .then((payload) => payload.names);
  return cache;
}

/**
 * Ordem de resolução do nome: feature-state (só existe pra município
 * com dado na faixa selecionada), tabela do IBGE, e por último o código
 * cru — que agora só aparece se a tabela não tiver carregado.
 */
export function resolveMunicipioName(
  stateName: string | undefined,
  names: Record<string, string>,
  key6: string,
  fallback: string,
): string {
  return stateName ?? names[key6] ?? fallback;
}

/**
 * Prefixo de 2 dígitos do código IBGE → sigla da UF. Deriva a UF sem
 * guardá-la no JSON: os dois primeiros dígitos do código municipal são
 * o código da UF, então repetir a sigla em 5.571 entradas só inflaria o
 * arquivo. Mesma tabela que o `build-geo-tiles.sh` usa.
 */
const UF_POR_PREFIXO: Record<string, string> = {
  '11': 'RO',
  '12': 'AC',
  '13': 'AM',
  '14': 'RR',
  '15': 'PA',
  '16': 'AP',
  '17': 'TO',
  '21': 'MA',
  '22': 'PI',
  '23': 'CE',
  '24': 'RN',
  '25': 'PB',
  '26': 'PE',
  '27': 'AL',
  '28': 'SE',
  '29': 'BA',
  '31': 'MG',
  '32': 'ES',
  '33': 'RJ',
  '35': 'SP',
  '41': 'PR',
  '42': 'SC',
  '43': 'RS',
  '50': 'MS',
  '51': 'MT',
  '52': 'GO',
  '53': 'DF',
};

export function ufFromCodigo(codigo: string): string | undefined {
  return UF_POR_PREFIXO[codigo.slice(0, 2)];
}

export interface MunicipioEntry {
  /** Código IBGE de 6 dígitos. */
  codigo: string;
  nome: string;
  /** Nome normalizado (minúsculo, sem acento) para casar na busca. */
  nomeBusca: string;
  uf: string;
}

/**
 * Lista pesquisável, ordenada por nome. Construída uma vez a partir do
 * mapa de nomes — a busca roda sobre 5.571 entradas em memória, sem ida
 * à rede a cada tecla.
 */
export function buildMunicipioIndex(names: Record<string, string>): MunicipioEntry[] {
  const out: MunicipioEntry[] = [];
  for (const [codigo, nome] of Object.entries(names)) {
    const uf = ufFromCodigo(codigo);
    if (uf === undefined) continue;
    out.push({ codigo, nome, nomeBusca: normalizeText(nome), uf });
  }
  return out.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Hook de teste — limpa o cache singleton entre testes. */
export function __resetMunicipioNamesCacheForTests(): void {
  cache = null;
}
