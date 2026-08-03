const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value: number): string {
  return currencyFormatter.format(value);
}

/**
 * Convierte un día local (`YYYY-MM-DD` de un `<input type="date">`) en el
 * instante ISO del mediodía de ese día en la zona horaria del usuario. Usamos
 * el mediodía para que el día registrado no se desplace por el offset respecto
 * a UTC. Devuelve `undefined` si el valor no es un día válido.
 */
export function saleDayToIso(day: string): string | undefined {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return undefined;
  return new Date(year, month - 1, date, 12, 0, 0, 0).toISOString();
}

/** Día de hoy en formato `YYYY-MM-DD` (zona horaria local). */
export function localToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Muestra un día local (`YYYY-MM-DD`) como fecha corta es-DO (DD/MM/YYYY). */
export function formatSaleDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return day;
  return new Date(year, month - 1, date).toLocaleDateString("es-DO");
}

/** Iniciales (máx. 2) a partir de un nombre, para los avatares. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
