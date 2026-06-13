export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatElapsed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  }

  const hours = Math.floor(diffInMinutes / 60);
  const mins = diffInMinutes % 60;
  return `${hours}h ${mins}m`;
}
