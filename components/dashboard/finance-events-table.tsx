import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PAYMENT_STATUS_LABELS,
  type PaymentStatus,
} from "@/lib/payments/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { FinanceWeekStats } from "@/lib/dashboard/stats";

type FinanceEventsTableProps = {
  stats: FinanceWeekStats;
};

export function FinanceEventsTable({ stats }: FinanceEventsTableProps) {
  if (stats.events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No hay eventos confirmados con fecha en esta semana
      </div>
    );
  }

  return (
    <div className="rounded-lg border ring-1 ring-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Cotizado</TableHead>
            <TableHead className="text-right">Adelantos</TableHead>
            <TableHead className="text-right">Pendiente</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <Link
                  href={`/events/${event.id}`}
                  className="font-medium hover:underline"
                >
                  {event.title}
                </Link>
              </TableCell>
              <TableCell>{event.customerName}</TableCell>
              <TableCell>
                {new Date(`${event.eventDate}T12:00:00`).toLocaleDateString("es-CR")}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(event.quoteTotal)}</TableCell>
              <TableCell className="text-right">{formatCurrency(event.netPaid)}</TableCell>
              <TableCell className="text-right">{formatCurrency(event.balanceDue)}</TableCell>
              <TableCell>
                {PAYMENT_STATUS_LABELS[event.paymentStatus as PaymentStatus] ??
                  event.paymentStatus}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
