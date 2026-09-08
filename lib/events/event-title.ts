const monthDayFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: "UTC",
  month: "long",
  day: "2-digit",
});

function slugifyCustomerName(customerName: string): string {
  return customerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/[\s-]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
    .join("-");
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventTitleDate(eventDate: string | null | undefined): string | null {
  const trimmed = eventDate?.trim();
  if (!trimmed) return null;

  const dateKey = trimmed.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (Number.isNaN(date.getTime())) return null;

  const parts = monthDayFormatter.formatToParts(date);
  const monthName = parts.find((part) => part.type === "month")?.value;
  const dayValue = parts.find((part) => part.type === "day")?.value;
  if (!monthName || !dayValue) return null;

  return `${capitalize(monthName)}${dayValue.padStart(2, "0")}`;
}

export function buildEventTitle(
  customerName: string,
  eventDate?: string | null,
): string {
  const slug = slugifyCustomerName(customerName);
  const datePart = formatEventTitleDate(eventDate);

  if (!slug) {
    return datePart ?? "Evento";
  }

  return datePart ? `${slug}-${datePart}` : slug;
}
