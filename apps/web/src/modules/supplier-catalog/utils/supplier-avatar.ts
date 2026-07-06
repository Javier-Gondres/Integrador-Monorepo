const AVATAR_PALETTE = [
  "#3C50E0",
  "#0D9F5F",
  "#EA580C",
  "#9333EA",
  "#DC2626",
  "#CA8A04",
  "#0EA5E9",
  "#DB2777",
];

/** Iniciales (1-2 letras) a partir del nombre del proveedor, ignorando sufijos legales. */
export function supplierInitials(name: string): string {
  const words = name
    .replace(/\b(SA|SRL|EIRL|del|de|los|la)\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

/** Color determinístico para el avatar, derivado del id del proveedor. */
export function supplierAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] as string;
}
