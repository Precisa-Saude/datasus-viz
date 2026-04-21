/**
 * Convenções de caminho no FTP DATASUS para SINAN (Sistema de Informação
 * de Agravos de Notificação).
 *
 * SINAN é distribuído **BR-wide anualmente** (não por UF). Cada agravo
 * tem seu próprio arquivo:
 *
 *   ftp://ftp.datasus.gov.br/dissemin/publicos/SINAN/DADOS/FINAIS/{AGRAVO}BR{YY}.dbc
 *
 * Para dados recém-notificados (<2 anos), usar DADOS/PRELIM/.
 *
 * Agravos suportados nesta fase (MVP patient-first): arboviroses
 * mais relevantes para contexto geográfico em UI.
 */

/**
 * Agravos SINAN suportados.
 * - DENG: dengue
 * - CHIK: chikungunya
 * - ZIKA: zika
 */
export type SinanAgravo = 'DENG' | 'CHIK' | 'ZIKA';

const SUPPORTED_AGRAVOS: readonly SinanAgravo[] = ['DENG', 'CHIK', 'ZIKA'];

export interface SinanPathParams {
  /** Código do agravo. */
  agravo: SinanAgravo;
  /**
   * Usar diretório `PRELIM` (preliminar) em vez de `FINAIS`. Default: false.
   * Dados preliminares são atualizados semanalmente; finais tipicamente
   * são publicados 2 anos após o fim do ano de notificação.
   */
  preliminar?: boolean;
  /** Ano completo (>= 2007, DATASUS mantém histórico SINAN desde ~2007). */
  year: number;
}

/**
 * Monta o caminho FTP canônico de um arquivo SINAN para um agravo e ano.
 */
export function sinanFtpPath({ agravo, preliminar = false, year }: SinanPathParams): string {
  if (!SUPPORTED_AGRAVOS.includes(agravo)) {
    throw new Error(`Agravo inválido: '${agravo}' (suportados: ${SUPPORTED_AGRAVOS.join(', ')})`);
  }
  if (!Number.isInteger(year) || year < 2007 || year > 2100) {
    throw new Error(`Ano inválido: ${year} (esperado entre 2007 e o presente)`);
  }
  const yy = String(year % 100).padStart(2, '0');
  const sub = preliminar ? 'PRELIM' : 'FINAIS';
  return `/dissemin/publicos/SINAN/DADOS/${sub}/${agravo}BR${yy}.dbc`;
}
