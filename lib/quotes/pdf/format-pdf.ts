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
    : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPdfTaxRate(rate: number): string {
  if (rate <= 0) return "Exento";
  return `${Math.round(rate * 10000) / 100}%`;
}
