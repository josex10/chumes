import Link from "next/link";
import { CalendarDays, Eye } from "lucide-react";
import { LostFilters } from "@/components/reports/lost-filters";
import { ReportesPagination } from "@/components/reports/reportes-pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEventDate } from "@/lib/events/format-dates";
import { COSTA_RICA_TIMEZONE } from "@/lib/follow-ups/calendar";
import {
  REPORTS_TAB,
  type LostDateFieldParam,
} from "@/lib/reports/constants";
import {
  LOST_DATE_FIELD_LABEL,
  formatLostPeriodRange,
} from "@/lib/reports/period";
import type { LostPipelineReport } from "@/lib/reports/queries";
import { buildReportesHref } from "@/lib/reports/url";
import { formatCurrency } from "@/lib/quotes/format";

type LostTabProps = {
  report: LostPipelineReport;
  dateFrom?: string;
  dateTo?: string;
  dateField: LostDateFieldParam;
};

function formatArchivedDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CR", {
    timeZone: COSTA_RICA_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LostTab({
  report,
  dateFrom,
  dateTo,
  dateField,
}: LostTabProps) {
  const periodRange = formatLostPeriodRange(dateFrom, dateTo);
  const fieldLabel = LOST_DATE_FIELD_LABEL[dateField];

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Período
        </p>
        <p className="mt-1 text-base font-medium tracking-tight">{periodRange}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Filtrado por {fieldLabel}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="border-t-2 border-t-rose-500 shadow-none ring-1 ring-border/60">
          <CardContent className="pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Pipeline de pérdidas
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {formatCurrency(report.totalAmount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cotizaciones cerradas perdidas · {periodRange}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none ring-1 ring-border/60">
          <CardContent className="pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Cotizaciones perdidas
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {report.totalCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Eventos en Cerrado Perdido · por {fieldLabel}
            </p>
          </CardContent>
        </Card>
      </section>

      <LostFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        dateField={dateField}
      />

      {report.totalCount === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            No hay cotizaciones cerradas perdidas para este período (
            {periodRange}, por {fieldLabel}).
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Cotizaciones cerradas perdidas · {periodRange}
          </h2>
          <div className="rounded-lg border ring-1 ring-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha del evento</TableHead>
                  <TableHead>Fecha de pérdida</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.eventId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/events/${row.eventId}`}
                        className="hover:underline"
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-muted-foreground" />
                        {formatEventDate(row.eventDate) ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>{formatArchivedDate(row.archivedAt)}</TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-2">
                        {row.lostReason?.trim() || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.amount > 0 ? formatCurrency(row.amount) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/events/${row.eventId}`}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Ver evento"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ReportesPagination
            page={report.page}
            totalCount={report.totalCount}
            pageSize={report.pageSize}
            hrefFor={(nextPage) =>
              buildReportesHref({
                tab: REPORTS_TAB.LOST,
                dateFrom,
                dateTo,
                dateField,
                page: nextPage,
              })
            }
          />
        </section>
      )}
    </div>
  );
}
