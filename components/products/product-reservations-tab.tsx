import Link from "next/link";
import { CalendarDays, Eye } from "lucide-react";
import { ProductReservationsPagination } from "@/components/products/product-reservations-pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEventDate } from "@/lib/events/format-dates";
import type { ProductEventReservationsResult } from "@/lib/products/reservation-queries";

type ProductReservationsTabProps = {
  productId: string;
  operational: ProductEventReservationsResult;
};

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function ProductReservationsTab({
  productId,
  operational,
}: ProductReservationsTabProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(operational.total / operational.pageSize),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>En operación</CardTitle>
        <CardDescription>
          Eventos reservados que tienen este producto comprometido, incluyendo
          paquetes que lo contienen. No incluye cerrados ganados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Fecha del evento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operational.rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Este producto no está reservado en ningún evento de
                      operación.
                    </TableCell>
                  </TableRow>
                ) : (
                  operational.rows.map((row) => (
                    <TableRow key={row.eventId}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/events/${row.eventId}`}
                          className="hover:underline"
                        >
                          {row.eventTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-muted-foreground" />
                          {formatEventDate(row.eventDate) ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatQuantity(row.quantity)}
                      </TableCell>
                      <TableCell>{row.statusName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Link
                            href={`/events/${row.eventId}`}
                            className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label={`Ver evento ${row.eventTitle}`}
                          >
                            <Eye className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <ProductReservationsPagination
            productId={productId}
            page={operational.page}
            totalPages={totalPages}
          />
        </div>
      </CardContent>
    </Card>
  );
}
