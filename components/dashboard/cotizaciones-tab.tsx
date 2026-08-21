import Link from "next/link";
import { CustomersWeekChart } from "@/components/dashboard/customers-week-chart";
import { QuotesHeroChart } from "@/components/dashboard/quotes-hero-chart";
import { QuotesWeekChart } from "@/components/dashboard/quotes-week-chart";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardSummary } from "@/lib/dashboard/stats";
import { formatCurrency } from "@/lib/quotes/format";
import type { QuoteWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type CotizacionesTabProps = {
  summary: DashboardSummary;
  quotes: QuoteWithRelations[];
};

export function CotizacionesTab({ summary, quotes }: CotizacionesTabProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
            {formatCurrency(summary.quotesAmountThisWeek)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {summary.quotesThisWeek === 0
              ? "Aún no hay cotizaciones esta semana"
              : `${summary.quotesThisWeek} cotización${summary.quotesThisWeek === 1 ? "" : "es"} creada${summary.quotesThisWeek === 1 ? "" : "s"}`}
          </p>
        </div>

        <QuotesHeroChart data={summary.quotesDaily} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="ring-1 ring-border/60 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Cotizaciones esta semana
            </p>
            <p className="text-2xl font-semibold tracking-tight">{summary.quotesThisWeek}</p>
            <QuotesWeekChart data={summary.quotesDaily} />
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/60 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Monto total semana
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(summary.quotesAmountThisWeek)}
            </p>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/60 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Clientes nuevos
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              {summary.newCustomersThisWeek}
            </p>
            <CustomersWeekChart data={summary.customersDaily} />
          </CardContent>
        </Card>

        <Card className="ring-1 ring-border/60 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Total clientes
            </p>
            <p className="text-2xl font-semibold tracking-tight">{summary.totalCustomers}</p>
          </CardContent>
        </Card>
      </section>

      {quotes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Cotizaciones de la semana
          </h2>
          <div className="rounded-lg border ring-1 ring-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cotización</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Creada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Link
                        href={`/quotes/${quote.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {quote.quote_number}
                      </Link>
                    </TableCell>
                    <TableCell>{quote.customers.name}</TableCell>
                    <TableCell>{quote.quote_statuses.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(quote.total))}
                    </TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString("es-CR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <section className="flex flex-wrap gap-3">
        <Link href="/quotes/new" className={cn(buttonVariants({ variant: "add" }))}>
          Nueva cotización
        </Link>
      </section>
    </div>
  );
}
