import { ERP_COLORS as C } from "@/constants/theme";

import type { TransferStatus } from "../types/transferencia.types";

export const ESTADO_LABELS: Record<TransferStatus, string> = {
  PENDING: "Pendiente",
  IN_TRANSIT: "En tránsito",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const ESTADO_COLORS: Record<TransferStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },      // amber
  IN_TRANSIT: { bg: "#e0e7ff", text: "#3730a3", dot: "#6366f1" },   // indigo
  COMPLETED: { bg: C.greenBg, text: C.greenText, dot: "#10b981" },
  CANCELLED: { bg: C.dangerBg, text: C.danger, dot: "#ef4444" },
};

export function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 24) {
    if (hours === 0) return "Hace un momento";
    return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }
  
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("es", { month: "short" });
  return `${day} ${month}`;
}
