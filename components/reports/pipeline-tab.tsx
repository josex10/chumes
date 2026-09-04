import Link from "next/link";
import { CalendarDays, Eye } from "lucide-react";
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
import { formatDateKey } from "@/lib/follow-ups/calendar";
import {
  PIPELINE_BUCKET_LABEL,
  PIPELINE_HORIZON_DAYS,
  REPORTS_PAGE_SIZE,
  REPORTS_TAB,
  type PipelineBucket,
} from "@/lib/reports/constants";
import type { PipelineReport } from "@/lib/reports/pipeline";
import { buildReportesHref } from "@/lib/reports/url";
import { formatCurrency } from "@/lib/quotes/format";
import { cn } from "@/lib/utils";

type PipelineTabProps = {
  report: PipelineReport;
  page: number;
};

const BUCKET_CLASS: Record<PipelineBucket, string> = {
  near: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  future: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  undated: "bg-muted text-muted-foreground",
  overdue: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
};

export function PipelineTab({ report, page }: PipelineTabProps) {
  const supportCards = [
    {
      label: "Sin fecha",
      value: formatCurrency(report.undatedAmount),
      hint: "Cotizaciones comerciales sin fecha de evento",
    },
    {
      label: "Vencido",
      value: formatCurrency(report.overdueAmount),
      hint: "Fecha de evento ya pasó y siguen abiertas",
    },
    {
      label: "Cotizaciones abiertas",
      value: String(report.quoteCount),
      hint:
        report.withoutQuoteCount > 0
          ? `${report.withoutQuoteCount} evento${report.withoutQuoteCount === 1 ? "" : "s"} comercial${report.withoutQuoteCount === 1 ? "" : "es"} sin cotización`
          : "Eventos comerciales con cotización vinculada",
    },
  ];

  const totalPages = Math.max(
    1,
    Math.ceil(report.rows.length / REPORTS_PAGE_SIZE),
  );
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedRows = report.rows.slice(
    (safePage - 1) * REPORTS_PAGE_SIZE,
    safePage * REPORTS_PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Pipeline total"
          value={formatCurrency(report.totalAmount)}
          hint="Todas las cotizaciones comerciales abiertas"
          accent="total"
        />
        <KpiCard
          label="Pipeline próximo"
          value={formatCurrency(report.nearAmount)}
          hint={`Eventos del ${formatDateKey(report.todayKey)} al ${formatDateKey(report.horizonKey)} (${PIPELINE_HORIZON_DAYS} días)`}
          accent="near"
        />
        <KpiCard
          label="Pipeline futuro"
          value={formatCurrency(report.futureAmount)}
          hint={`Eventos después del ${formatDateKey(report.horizonKey)}`}
          accent="future"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {supportCards.map((card) => (
          <Card key={card.label} className="shadow-none ring-1 ring-border/60">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {report.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            No hay cotizaciones abiertas en el pipeline comercial.
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Cotizaciones abiertas
          </h2>
          <div className="rounded-lg border ring-1 ring-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha del evento</TableHead>
                  <TableHead>Horizonte</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => (
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
                    <TableCell>{row.statusName}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-muted-foreground" />
                        {formatEventDate(row.eventDate) ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          BUCKET_CLASS[row.bucket],
                        )}
                      >
                        {PIPELINE_BUCKET_LABEL[row.bucket]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.amount)}
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
            page={safePage}
            totalCount={report.rows.length}
            pageSize={REPORTS_PAGE_SIZE}
            hrefFor={(nextPage) =>
              buildReportesHref({
                tab: REPORTS_TAB.PIPELINE,
                page: nextPage,
              })
            }
          />
        </section>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "total" | "near" | "future";
}) {
  return (
    <Card
      className={cn(
        "shadow-none ring-1 ring-border/60",
        accent === "near" && "border-t-2 border-t-emerald-500",
        accent === "future" && "border-t-2 border-t-sky-500",
        accent === "total" && "border-t-2 border-t-foreground/30",
      )}
    >
      <CardContent className="pt-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
