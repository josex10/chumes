import { formatEventDate } from "@/lib/events/format-dates";
import { formatCurrency } from "@/lib/quotes/format";

export type FollowUpTemplateVars = {
  nombre: string;
  evento: string;
  fecha: string;
  ubicacion: string;
  monto: string;
};

export function buildFollowUpTemplateVars(input: {
  customerName: string;
  eventTitle: string;
  eventDate: string | null | undefined;
  location: string | null | undefined;
  quoteTotal: number | null | undefined;
}): FollowUpTemplateVars {
  const eventDateValue = input.eventDate
    ? input.eventDate.includes("T")
      ? input.eventDate
      : `${input.eventDate}T12:00:00`
    : null;
  const fecha = formatEventDate(eventDateValue);
  const ubicacion = input.location?.trim();
  const monto =
    input.quoteTotal != null && Number.isFinite(input.quoteTotal)
      ? formatCurrency(input.quoteTotal)
      : null;

  return {
    nombre: input.customerName.trim() || "cliente",
    evento: input.eventTitle.trim() || "tu evento",
    fecha: fecha ? `Fecha del evento: ${fecha}` : "",
    ubicacion: ubicacion ? `Lugar: ${ubicacion}` : "",
    monto: monto ? `Cotización: ${monto}` : "",
  };
}

export function renderFollowUpTemplate(
  body: string,
  vars: FollowUpTemplateVars,
): string {
  const rendered = body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    if (key in vars) {
      return vars[key as keyof FollowUpTemplateVars];
    }
    return "";
  });

  return rendered
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
