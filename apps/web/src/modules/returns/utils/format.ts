const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

/** Convierte una fecha `YYYY-MM-DD` al instante ISO del inicio de ese día. */
export function startOfDayIso(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}

/** Convierte una fecha `YYYY-MM-DD` al instante ISO del fin de ese día. */
export function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString();
}
