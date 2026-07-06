import { NcfType, prisma } from '@repo/db';

const NCF_NUMBER_PADDING = 8;

/**
 * Cliente de transacción del cliente Prisma extendido (con la extensión de
 * soft-delete). Se deriva del callback de `$transaction` para que coincida con
 * el `tx` que reciben los repositorios y evitar el tipo base
 * `Prisma.TransactionClient`, incompatible con el cliente extendido.
 */
export type ExtendedTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export type GeneratedNcf = {
  ncf: string;
  ncfType: NcfType;
  ncfSequenceId: string;
};

/**
 * Reserva el siguiente NCF de una secuencia DGII activa y lo formatea
 * (`prefix` + número con padding, ej. `B0400000001`). Incrementa
 * `currentNumber` dentro de la transacción recibida para evitar duplicados.
 *
 * Debe ejecutarse con un `Prisma.TransactionClient` para que el consumo del
 * consecutivo viva en la misma transacción que el documento fiscal.
 *
 * Devuelve `null` si no hay una secuencia utilizable (inexistente, inactiva,
 * vencida o agotada), permitiendo al llamador decidir si continúa sin NCF.
 */
export async function generateNcf(
  tx: ExtendedTransactionClient,
  companyId: string,
  ncfType: NcfType,
): Promise<GeneratedNcf | null> {
  const sequence = await tx.ncfSequence.findFirst({
    where: {
      companyId,
      type: ncfType,
      isActive: true,
      expirationDate: { gte: new Date() },
    },
    select: { id: true, prefix: true, currentNumber: true, maxNumber: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!sequence) {
    return null;
  }

  const nextNumber = sequence.currentNumber + 1;
  if (nextNumber > sequence.maxNumber) {
    return null;
  }

  await tx.ncfSequence.update({
    where: { id: sequence.id },
    data: { currentNumber: nextNumber },
  });

  const ncf = `${sequence.prefix}${String(nextNumber).padStart(
    NCF_NUMBER_PADDING,
    '0',
  )}`;

  return { ncf, ncfType, ncfSequenceId: sequence.id };
}
