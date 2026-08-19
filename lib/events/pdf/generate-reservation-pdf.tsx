import { renderToBuffer } from "@react-pdf/renderer";
import { ReservationPdfDocument } from "@/lib/events/pdf/reservation-pdf-document";
import type { EventReservationPdfData } from "@/lib/events/pdf/types";

export async function generateReservationPdf(
  data: EventReservationPdfData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(<ReservationPdfDocument data={data} />);
  return Buffer.from(buffer);
}
