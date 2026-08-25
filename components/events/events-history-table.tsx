import Link from "next/link";
import { Archive, CalendarDays, Eye, Trophy, XCircle } from "lucide-react";
import { EVENT_STATUS } from "@/lib/events/constants";
import { getArchiveTypeLabel } from "@/lib/events/events-url";
import { getLinkedQuote } from "@/lib/events/event-badges";
import { formatEventDate } from "@/lib/events/format-dates";
import { formatCurrency } from "@/lib/quotes/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EventWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventsHistoryTableProps = {
  events: EventWithRelations[];
};

function formatArchivedAt(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CR");
}

export function EventsHistoryTable({ events }: EventsHistoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha del evento</TableHead>
            <TableHead>Archivado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const linkedQuote = getLinkedQuote(event);
            const archiveType = getArchiveTypeLabel(event.event_statuses.code);
            const isWon =
              event.event_statuses.code === EVENT_STATUS.WON_ARCHIVED ||
              event.event_statuses.code === EVENT_STATUS.COMPLETED;
            const TypeIcon = isWon ? Trophy : XCircle;

            return (
              <TableRow key={event.id}>
                <TableCell className="font-medium">
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
                </TableCell>
                <TableCell>{event.customers.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    {formatEventDate(event.event_date) ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <Archive className="size-3.5 text-muted-foreground" />
                    {formatArchivedAt(event.archived_at)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                      isWon
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
                    )}
                  >
                    <TypeIcon className="size-3" />
                    {archiveType}
                  </span>
                </TableCell>
                <TableCell>
                  {linkedQuote
                    ? formatCurrency(Number(linkedQuote.total))
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label="Ver evento"
                    >
                      <Eye className="size-3.5" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
