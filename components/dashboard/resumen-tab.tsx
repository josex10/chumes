import { Download } from "lucide-react";
import Link from "next/link";
import { ResumenCharts } from "@/components/dashboard/resumen-charts";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CHUMES_COMPANY } from "@/lib/quotes/pdf/company";
import { formatCurrency } from "@/lib/quotes/format";
import {
  eventCountLabel,
  formatRatioLabel,
  movementCountLabel,
  type WeekReport,
} from "@/lib/dashboard/week-report";
import { cn } from "@/lib/utils";

type ResumenTabProps = {
  report: WeekReport;
};

export function ResumenTab({ report }: ResumenTabProps) {
  const profitIsLoss = report.profit < 0;

  return (
    <article className="overflow-hidden rounded-xl border bg-background">
      <header className="flex flex-col gap-4 border-b px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {CHUMES_COMPANY.name}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Resumen semanal</h2>
          <p className="mt-1 text-lg">{report.weekRange}</p>
        </div>
        <a
          href={`/api/dashboard/week-report/pdf?week=${report.weekKey}`}
          className={cn(buttonVariants({ variant: "export", size: "sm" }))}
        >
          <Download />
          Descargar PDF
        </a>
      </header>

      <section className="border-b px-6 py-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Facturado</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(report.billed)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {eventCountLabel(report.eventCount)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cobrado {formatCurrency(report.collected)} · Pendiente{" "}
              {formatCurrency(report.pending)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Gastos</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(report.expensesTotal)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {movementCountLabel(report.expenseCount)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Utilidad</p>
            <p
              className={cn(
                "mt-2 text-3xl font-semibold tracking-tight tabular-nums",
                profitIsLoss && "text-destructive",
              )}
            >
              {formatCurrency(report.profit)}
            </p>
            <p className={cn("mt-2 text-sm", profitIsLoss ? "text-destructive" : "text-muted-foreground")}>
              {report.margin === null ? "—" : `${formatRatioLabel(report.margin)} de margen`}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            {report.bar.kind === "loss" && <div className="h-full bg-destructive" />}
            {report.bar.kind === "profit" && <div className="h-full bg-foreground" />}
            {report.bar.kind === "split" && (
              <div className="flex h-full">
                <div
                  className="h-full bg-foreground/35"
                  style={{ width: `${report.bar.expenseRatio * 100}%` }}
                />
                <div
                  className="h-full bg-foreground"
                  style={{ width: `${report.bar.profitRatio * 100}%` }}
                />
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{report.bar.caption}</p>
        </div>
      </section>

      <section className="border-b px-6 py-6">
        <ResumenCharts days={report.days} categories={report.categories} />
      </section>

      <section className="border-b px-6 py-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
          De dónde sale lo facturado
        </h3>
        {report.events.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No hay eventos confirmados esta semana.
          </p>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Facturado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.dateLabel}</TableCell>
                    <TableCell className="whitespace-normal">
                      <Link href={`/events/${event.id}`} className="font-medium hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-normal">{event.customerName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(event.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total facturado</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(report.billed)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </section>

      <section className="border-b px-6 py-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
          En qué se fue el gasto
        </h3>
        {report.expenseRows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No hay gastos esta semana.</p>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Medio de pago</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.expenseRows.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-normal">{expense.concept}</TableCell>
                    <TableCell className="whitespace-normal">{expense.paymentMethod}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total gastos</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(report.expensesTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </section>

      <footer className="px-6 py-6">
        <p className="text-sm">
          Facturado {formatCurrency(report.billed)} − Gastos {formatCurrency(report.expensesTotal)}{" "}
          ={" "}
          <span className={cn("font-semibold", profitIsLoss && "text-destructive")}>
            Utilidad {formatCurrency(report.profit)}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Chumes · Resumen semanal · generado el {report.generatedLabel}
        </p>
      </footer>
    </article>
  );
}
