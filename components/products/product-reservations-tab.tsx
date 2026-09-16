import Link from "next/link";
import { CalendarDays, Eye, ArrowDown, ArrowUp } from "lucide-react";
import { ProductReservationsPagination } from "@/components/products/product-reservations-pagination";
import { ProductReservationsWeekPicker } from "@/components/products/product-reservations-week-picker";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  buildProductReservationsHref,
  type ProductEventReservationsResult,
} from "@/lib/products/reservation-queries";

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
      <CardHeader className="border-b">
        <CardTitle>En operación</CardTitle>
        <CardDescription>
          Eventos reservados esta semana, incluyendo paquetes que contienen este
          producto. No incluye cerrados ganados.
        </CardDescription>
        <CardAction>
          <ProductReservationsWeekPicker
            productId={productId}
            weekKey={operational.weekKey}
            weekRange={operational.weekRange}
            dateOrder={operational.dateOrder}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>
                    <Link
                      href={buildProductReservationsHref(productId, {
                        weekKey: operational.weekKey,
                        dateOrder:
                          operational.dateOrder === "asc" ? "desc" : "asc",
                      })}
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                      aria-label={
                        operational.dateOrder === "asc"
                          ? "Ordenar por fecha del evento, más reciente primero"
                          : "Ordenar por fecha del evento, más próxima primero"
                      }
                    >
                      Fecha del evento
                      {operational.dateOrder === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )}
                    </Link>
                  </TableHead>
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
                      Este producto no está reservado en esta semana.
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
            weekKey={operational.weekKey}
            dateOrder={operational.dateOrder}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Total de artículos reservados
        </p>
        <p className="text-base font-medium tabular-nums">
          {formatQuantity(operational.totalQuantity)}
        </p>
      </CardFooter>
    </Card>
  );
}
