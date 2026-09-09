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

/** Hook de teste — limpa o cache singleton entre testes. */
export function __resetMunicipioNamesCacheForTests(): void {
  cache = null;
}
