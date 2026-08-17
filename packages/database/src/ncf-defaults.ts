import { NcfType } from "./generated/prisma/enums.js";

/**
 * Secuencias NCF que toda empresa recibe al ser creada. Los prefijos siguen la
 * nomenclatura de la DGII: B01 crédito fiscal, B02 consumidor final y B04 nota
 * de crédito.
 *
 * En producción los rangos los autoriza la DGII por empresa; estos son los
 * valores por defecto para que ninguna empresa quede sin poder emitir
 * comprobantes desde su primera venta.
 */
export const DEFAULT_NCF_SEQUENCES = [
  { type: NcfType.CREDITO_FISCAL, prefix: "B01" },
  { type: NcfType.CONSUMIDOR_FINAL, prefix: "B02" },
  { type: NcfType.NOTA_DE_CREDITO, prefix: "B04" },
] as const;

export const DEFAULT_NCF_MAX_NUMBER = 9_999_999;
export const DEFAULT_NCF_VALIDITY_DAYS = 365;

export type DefaultNcfSequenceRow = {
  companyId: string;
  type: NcfType;
  prefix: string;
  currentNumber: number;
  maxNumber: number;
  expirationDate: Date;
  isActive: boolean;
};

/** Vencimiento por defecto de una secuencia recién provisionada. */
export function defaultNcfExpirationDate(from: Date = new Date()): Date {
  const expiration = new Date(from);
  expiration.setDate(expiration.getDate() + DEFAULT_NCF_VALIDITY_DAYS);
  return expiration;
}

/**
 * Filas `NcfSequence` por defecto de una empresa. `currentNumber` arranca en 0
 * para que el primer comprobante emitido sea `<prefix>00000001`.
 *
 * Función pura: quien la llame decide cómo persistirlas (la API al crear la
 * empresa, el script de backfill para las empresas ya existentes).
 */
export function buildDefaultNcfSequenceRows(
  companyId: string,
  expirationDate: Date = defaultNcfExpirationDate(),
): DefaultNcfSequenceRow[] {
  return DEFAULT_NCF_SEQUENCES.map(({ type, prefix }) => ({
    companyId,
    type,
    prefix,
    currentNumber: 0,
    maxNumber: DEFAULT_NCF_MAX_NUMBER,
    expirationDate,
    isActive: true,
  }));
}
