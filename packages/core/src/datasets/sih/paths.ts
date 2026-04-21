/**
 * Convenções de caminho no FTP DATASUS para SIH-RD.
 *
 * Estrutura (verificada no FTP oficial):
 *   ftp://ftp.datasus.gov.br/dissemin/publicos/SIHSUS/200801_/Dados/RD{UF}{YYMM}.dbc
 *
 * UF: sigla de 2 letras (AC, AL, AM, ...).
 * YY: últimos 2 dígitos do ano (08..24).
 * MM: mês 01..12.
 */

const UF_CODES = new Set([
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
]);

export interface SihPathParams {
  /** Mês 1..12. */
  month: number;
  /** Sigla UF (2 letras, maiúsculo). */
  uf: string;
  /** Ano completo (>= 2008, DATASUS mantém histórico desde 2008). */
  year: number;
}

/**
 * Monta o caminho FTP canônico de um arquivo SIH-RD.
 * Lança erro se UF, ano ou mês são inválidos.
 */
export function sihRdFtpPath({ month, uf, year }: SihPathParams): string {
  const ufUpper = uf.toUpperCase();
  if (!UF_CODES.has(ufUpper)) {
    throw new Error(`UF inválida: '${uf}' (esperado: AC, AL, AM, ...)`);
  }
  if (!Number.isInteger(year) || year < 2008 || year > 2100) {
    throw new Error(`Ano inválido: ${year} (esperado entre 2008 e o presente)`);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Mês inválido: ${month} (esperado entre 1 e 12)`);
  }
  const yy = String(year % 100).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `/dissemin/publicos/SIHSUS/200801_/Dados/RD${ufUpper}${yy}${mm}.dbc`;
}
