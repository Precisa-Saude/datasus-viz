/**
 * Labels pt-BR para agravos SINAN suportados.
 */

import type { SinanAgravo } from './paths.js';

const AGRAVO_LABELS: Record<SinanAgravo, string> = {
  CHIK: 'Chikungunya',
  DENG: 'Dengue',
  ZIKA: 'Zika',
};

export function labelAgravo(agravo: SinanAgravo): string {
  return AGRAVO_LABELS[agravo];
}
