import { buildDefaultNcfSequenceRows } from '@repo/db';

import type { ExtendedTransactionClient } from './ncf-sequence.helper';

/**
 * Provisiona las secuencias NCF por defecto de una empresa recién creada.
 *
 * Sin esto la empresa no tiene de dónde consumir consecutivos y `generateNcf`
 * no puede emitir comprobantes, así que debe ejecutarse dentro de la misma
 * transacción que crea la empresa.
 *
 * Es idempotente: `@@unique([companyId, type, prefix])` más `skipDuplicates`
 * hacen que repetirla no duplique ni falle.
 */
export async function createDefaultNcfSequences(
  tx: ExtendedTransactionClient,
  companyId: string,
): Promise<void> {
  await tx.ncfSequence.createMany({
    data: buildDefaultNcfSequenceRows(companyId),
    skipDuplicates: true,
  });
}
