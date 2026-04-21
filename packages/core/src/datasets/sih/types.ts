/**
 * Tipos para SIH-RD (Autorização de Internação Hospitalar — Reduzida).
 *
 * SIH-RD é distribuído mensalmente por UF no FTP DATASUS e contém as AIHs
 * processadas pelo SUS. As colunas variam entre vintages (2008, 2017, 2024
 * têm diferenças), mas os campos abaixo são estáveis o suficiente para
 * uso prático.
 *
 * Referência: Dicionário de Dados SIHSUS, publicado pelo DATASUS.
 * Tipagem aqui cobre o núcleo de campos patient-relevant; campos não
 * listados continuam acessíveis via index signature.
 */

/** Sexo conforme codificação DATASUS: 1=Masculino, 3=Feminino. */
export type SihSexo = 1 | 3 | null;

/**
 * Registro SIH-RD tipado. Campos não listados explicitamente ficam
 * acessíveis via index signature como `DbfValue`.
 */
export interface SihRdRecord {
  /** Demais colunas — tipo inferido pelo leitor DBF. */
  [key: string]: unknown;
  /** Ano de competência (processamento). */
  ANO_CMPT: number;
  /** CID-10 principal (4 caracteres, ex: 'E119'). */
  DIAG_PRINC: string;
  /** CID-10 secundário (opcional). */
  DIAG_SECUN: string | null;
  /** Data de internação (YYYYMMDD convertida para Date UTC). */
  DT_INTER: Date | null;
  /** Data da saída (YYYYMMDD convertida para Date UTC). */
  DT_SAIDA: Date | null;
  /** Idade (unidade varia por COD_IDADE: 3=ano, 2=mês, 1=dia). */
  IDADE: number;
  /** Mês de competência. */
  MES_CMPT: number;
  /** Indicador de óbito (1=óbito, 0=alta). */
  MORTE: number;
  /** Código IBGE de município de residência (6 dígitos). */
  MUNIC_RES: string;
  /** Procedimento realizado (código SIGTAP). */
  PROC_REA: string;
  /** Sexo. */
  SEXO: SihSexo;
  /** UF da Zona de Internação (6 dígitos — IBGE município + IES). */
  UF_ZI: string;
  /** Valor total da AIH (reais). */
  VAL_TOT: number;
}
