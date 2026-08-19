import path from "node:path";

export const CHUMES_COMPANY = {
  name: "Chumes Todo en Mantelería",
  phone: "",
  email: "",
  tagline: "Alquiler y venta de mantelería para eventos",
} as const;

export const QUOTE_PDF_FOOTER =
  "Esta cotización es una propuesta comercial. No reserva inventario ni garantiza disponibilidad hasta confirmar el evento.";

export const RESERVATION_PDF_FOOTER =
  "Esta confirmación respalda su reserva de inventario. Para cambios o consultas, contáctenos con el número de cotización indicado.";

export const CHUMES_LOGO_PATH = path.join(
  process.cwd(),
  "public",
  "chumes-logo.png",
);
