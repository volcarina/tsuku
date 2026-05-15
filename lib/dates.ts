export function getMonthKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isInMonth(iso: string, monthKey: string) {
  return getMonthKey(new Date(iso)) === monthKey;
}

export function isCurrentMonth(iso: string) {
  return isInMonth(iso, getMonthKey());
}

export function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

export function startOfDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`);
}

export function endOfDay(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999`);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}
