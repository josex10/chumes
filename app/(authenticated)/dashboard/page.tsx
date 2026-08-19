import Link from "next/link";
import { CustomersWeekChart } from "@/components/dashboard/customers-week-chart";
import { QuotesHeroChart } from "@/components/dashboard/quotes-hero-chart";
import { QuotesWeekChart } from "@/components/dashboard/quotes-week-chart";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCustomersCount,
  getCustomersCreatedBetween,
} from "@/lib/customers/queries";
import { getDashboardSummary, getWeekBounds } from "@/lib/dashboard/stats";
import { formatCurrency } from "@/lib/quotes/format";
import { getQuotes } from "@/lib/quotes/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { start, end } = getWeekBounds();
  const [quotes, totalCustomers, customersThisWeek] = await Promise.all([
    getQuotes(),
    getCustomersCount(),
    getCustomersCreatedBetween(start, end),
  ]);
  const summary = getDashboardSummary(quotes, customersThisWeek, totalCustomers);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-10">
      <section className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Cotizaciones</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Resumen de actividad de la semana
            </p>
          </div>
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Esta semana
          </span>
        </div>

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

      <section className="flex flex-wrap gap-3">
        <Link href="/customers/new" className={cn(buttonVariants({ variant: "add" }))}>
          Nuevo cliente
        </Link>
        <Link href="/quotes/new" className={cn(buttonVariants({ variant: "add" }))}>
          Nueva cotización
        </Link>
      </section>
    </main>
  );
}
