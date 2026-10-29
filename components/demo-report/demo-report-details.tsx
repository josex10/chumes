import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DemoEventRow, DemoQuoteRow, DemoReport } from "@/lib/demo-report/aggregate";
import { formatDateKey, toCostaRicaDateKey } from "@/lib/follow-ups/calendar";
import { formatCurrency } from "@/lib/quotes/format";

function formatEventDate(value: string | null): string {
  if (!value) return "—";
  return formatDateKey(value.slice(0, 10));
}

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  return formatDateKey(toCostaRicaDateKey(value));
}

function moneyOrMissing(amount: number, hasQuote: boolean): string {
  if (!hasQuote) return "Sin cotización";
  return formatCurrency(amount);
}

function SoldTable({ rows }: { rows: DemoEventRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay alquileres vendidos con fecha de evento en este periodo.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha del evento</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Transporte</TableHead>
          <TableHead className="text-right">Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link href={`/events/${row.id}`} className="hover:underline">
                {row.title}
              </Link>
            </TableCell>
            <TableCell>{row.customerName}</TableCell>
            <TableCell>{formatEventDate(row.eventDate)}</TableCell>
            <TableCell>{row.statusName}</TableCell>
            <TableCell className="text-right tabular-nums">
              {row.deliveryFee > 0 ? formatCurrency(row.deliveryFee) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {moneyOrMissing(row.quoteTotal, Boolean(row.quoteId))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function QuoteTable({ rows }: { rows: DemoQuoteRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay cotizaciones creadas en este periodo.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cotización</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Creada</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>Fecha del evento</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link href={`/quotes/${row.id}/edit`} className="hover:underline">
                {row.quoteNumber}
              </Link>
            </TableCell>
            <TableCell>{row.customerName}</TableCell>
            <TableCell>{formatTimestamp(row.createdAt)}</TableCell>
            <TableCell>
              {row.eventId ? (
                <Link href={`/events/${row.eventId}`} className="hover:underline">
                  {row.eventTitle ?? "Evento"}
                </Link>
              ) : (
                "Sin evento"
              )}
            </TableCell>
            <TableCell>{formatEventDate(row.eventDate)}</TableCell>
            <TableCell>{row.statusName}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(row.total)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LostTable({ rows }: { rows: DemoEventRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay eventos perdidos con fecha de evento en este periodo.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha del evento</TableHead>
          <TableHead>Archivado</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead className="text-right">Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link href={`/events/${row.id}`} className="hover:underline">
                {row.title}
              </Link>
            </TableCell>
            <TableCell>{row.customerName}</TableCell>
            <TableCell>{formatEventDate(row.eventDate)}</TableCell>
            <TableCell>{formatTimestamp(row.archivedAt)}</TableCell>
            <TableCell>{row.lostReason?.trim() || "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {moneyOrMissing(row.quoteTotal, Boolean(row.quoteId))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type DemoReportDetailsProps = {
  report: DemoReport;
};

export function DemoReportDetails({ report }: DemoReportDetailsProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Detalle de alquileres vendidos</h2>
        <SoldTable rows={report.sold.rows} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Detalle de cotizaciones</h2>
        <QuoteTable rows={report.quoted.rows} />
      </section>

      <section id="perdidos" className="flex scroll-mt-6 flex-col gap-3">
        <h2 className="text-sm font-medium">Detalle de perdidos</h2>
        <LostTable rows={report.lost.rows} />
      </section>

      <section className="flex flex-col gap-2 border-t border-border/60 pt-6">
        <h2 className="text-sm font-medium">Cómo se calcula</h2>
        <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Vendidos: fecha del evento, en estado reservado, de operación o cerrado
            ganado. El monto es el total de la cotización vinculada más reciente.
          </li>
          <li>Leads: eventos creados en la semana o el mes, en cualquier estado.</li>
          <li>
            Cotizaciones: creadas en el periodo, abiertas o cerradas. De un mismo
            evento se toma la más reciente. Las que no tienen evento se suman todas.
          </li>
          <li>
            Perdidos: estado perdido y fecha del evento dentro del periodo. No usa el
            día en que se archivó.
          </li>
          <li>
            Transporte: campo de monto de transporte de esos alquileres vendidos. Ya
            forma parte del total vendido.
          </li>
        </ul>
      </section>
    </div>
  );
}
