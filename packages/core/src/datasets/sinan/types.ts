/**
 * Tipos comuns para registros SINAN (arboviroses).
 *
 * Os campos abaixo são o core estável entre DENG/CHIK/ZIKA. Demais colunas
 * permanecem acessíveis via index signature como `unknown`.
 */

/** Classificação final da notificação (campo CLASSI_FIN). */
export type SinanClassificacao =
  | '1' // Dengue
  | '2' // Dengue com sinais de alarme
  | '3' // Dengue grave
  | '4' // Chikungunya
  | '5' // Descartado
  | '8' // Inconclusivo
  | '10' // Dengue
  | '11' // Dengue com complicações
  | '12' // Febre hemorrágica da dengue
  | '13' // Síndrome do choque da dengue
  | string;

/**
 * Registro SINAN arbovirose tipado. Campos não listados ficam acessíveis
 * via index signature.
 */
export interface SinanArboviroseRecord {
  [key: string]: unknown;
  /** Classificação final da notificação. */
  CLASSI_FIN: string | null;
  /** Sexo: M, F, I (ignorado). */
  CS_SEXO: string | null;
  /** Data de notificação (YYYYMMDD). */
  DT_NOTIFIC: Date | null;
  /** Data dos primeiros sintomas (YYYYMMDD). */
  DT_SIN_PRI: Date | null;
  /** Código IBGE do município de notificação (6 dígitos). */
  ID_MUNICIP: string;
  /** Idade codificada (primeiro dígito=unidade: 4=ano, 3=mês, 2=dia, 1=hora). */
  NU_IDADE_N: number;
  /** UF de notificação (sigla). */
  SG_UF_NOT: string | null;
}
