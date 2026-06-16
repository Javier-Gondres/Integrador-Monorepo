const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value: number): string {
  return currencyFormatter.format(value);
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

const AVATAR_COLORS = [
  "#3C50E0",
  "#0D9F5F",
  "#EA580C",
  "#9333EA",
  "#DC2626",
  "#CA8A04",
  "#0EA5E9",
];

/** Color estable derivado de un texto (id/nombre) para los avatares. */
export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? "#3C50E0";
}
