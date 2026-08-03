import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "dd/MM/yyyy", { locale: es });
}
