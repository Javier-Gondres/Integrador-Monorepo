/** Etiqueta legible del tipo de Comprobante Fiscal (NCF) para la factura impresa. */
const NCF_TYPE_LABELS: Record<string, string> = {
  CONSUMIDOR_FINAL: "Factura de Consumo",
  CREDITO_FISCAL: "Factura de Crédito Fiscal",
  GUBERNAMENTAL: "Comprobante Gubernamental",
  REGIMEN_ESPECIAL: "Régimen Especial",
  EXPORTACION: "Comprobante de Exportación",
  NOTA_DE_CREDITO: "Nota de Crédito",
};

export function ncfTypeLabel(ncfType: string | null): string {
  if (!ncfType) return "Comprobante";
  return NCF_TYPE_LABELS[ncfType] ?? ncfType;
}
