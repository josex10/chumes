import { COSTA_RICA_TIMEZONE } from "@/lib/follow-ups/calendar";

export function formatPdfCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Helvetica in react-pdf does not render the colón symbol (₡) correctly.
  return `CRC ${formatted}`;
}

export function formatPdfDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-CR", {
    timeZone: value.includes("T") ? COSTA_RICA_TIMEZONE : "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPdfTaxRate(rate: number): string {
  if (rate <= 0) return "Exento";
  return `${Math.round(rate * 10000) / 100}%`;
}

export function formatPdfDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("es-CR", {
    timeZone: COSTA_RICA_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatPdfEventDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-CR", {
    timeZone: value.includes("T") ? COSTA_RICA_TIMEZONE : "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
