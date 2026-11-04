import { renderToBuffer } from "@react-pdf/renderer";
import { WeekReportPdfDocument } from "@/lib/dashboard/pdf/week-report-pdf";
import type { WeekReport } from "@/lib/dashboard/week-report";

export function getWeekReportPdfFilename(weekKey: string): string {
  return `chumes-resumen-${weekKey}.pdf`;
}

export async function generateWeekReportPdf(report: WeekReport): Promise<Buffer> {
  const buffer = await renderToBuffer(<WeekReportPdfDocument report={report} />);
  return Buffer.from(buffer);
}
