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
  commercial: ProductEventReservationsResult;
};

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function ReservationsTable({
  productId,
  result,
  pageKey,
  otherKey,
  otherPage,
  emptyMessage,
}: {
  productId: string;
  result: ProductEventReservationsResult;
  pageKey: "op" | "com";
  otherKey: "op" | "com";
  otherPage: number;
  emptyMessage: string;
}) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
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
            {result.rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              result.rows.map((row) => (
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
        page={result.page}
        totalPages={totalPages}
        pageKey={pageKey}
        otherKey={otherKey}
        otherPage={otherPage}
      />
    </div>
  );
}

export function ProductReservationsTab({
  productId,
  operational,
  commercial,
}: ProductReservationsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>En operación</CardTitle>
          <CardDescription>
            Eventos ya reservados que tienen este producto en la cotización
            vinculada, incluyendo paquetes que lo contienen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationsTable
            productId={productId}
            result={operational}
            pageKey="op"
            otherKey="com"
            otherPage={commercial.page}
            emptyMessage="Este producto no está reservado en ningún evento de operación."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>En comercial</CardTitle>
          <CardDescription>
            Eventos comerciales con este producto en cotización. No reservan
            inventario hasta confirmar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationsTable
            productId={productId}
            result={commercial}
            pageKey="com"
            otherKey="op"
            otherPage={operational.page}
            emptyMessage="No hay eventos comerciales con este producto en cotización."
          />
        </CardContent>
      </Card>
    </div>
  );
}
