const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** "14 jun 2026" + "3:42 p.m." a partir de una fecha ISO. */
export function formatDate(iso: string): { day: string; time: string } {
  const date = new Date(iso);
  let hours = date.getHours();
  const meridiem = hours >= 12 ? "p.m." : "a.m.";
  hours = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    day: `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
    time: `${hours}:${minutes} ${meridiem}`,
  };
}
