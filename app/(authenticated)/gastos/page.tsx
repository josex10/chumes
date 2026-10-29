import { Suspense } from "react";
import Link from "next/link";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpensesPanel } from "@/components/expenses/expenses-panel";
import { GastosWeekNav } from "@/components/expenses/gastos-week-nav";
import { Card, CardContent } from "@/components/ui/card";
import { InvestmentsPanel } from "@/components/investments/investments-panel";
import {
  formatWeekRange,
  getWeekBounds,
  getWeekKey,
  parseWeekKey,
} from "@/lib/dashboard/stats";
import { gastosHref, summarizeExpenses } from "@/lib/expenses/format";
import {
  getCompanyPaymentMethods,
  getExpenseCategories,
  getExpensesBetween,
} from "@/lib/expenses/queries";
import { getInvestmentCreditors, getInvestments } from "@/lib/investments/queries";
import { formatCurrency } from "@/lib/quotes/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gastos",
};

type GastosPageProps = {
  searchParams: Promise<{
    tab?: string;
    week?: string;
    category?: string;
    method?: string;
  }>;
};

function parseId(value?: string): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}

function referenceFromWeek(week?: string): Date {
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    const date = parseWeekKey(week);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

export default async function GastosPage({ searchParams }: GastosPageProps) {
  const params = await searchParams;
  const activeTab = params.tab === "inversiones" ? "inversiones" : "gastos";
  const explicitWeek =
    params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week) ? params.week : null;
  const reference = referenceFromWeek(explicitWeek ?? undefined);
  const { start, end } = getWeekBounds(reference);
  const weekKey = getWeekKey(reference);
  const weekRange = formatWeekRange(start, end);
  const categoryId = parseId(params.category);
  const methodId = parseId(params.method);

  const [categories, methods, expenses, creditors, investments] = await Promise.all([
    getExpenseCategories(),
    getCompanyPaymentMethods(),
    getExpensesBetween(start, end),
    getInvestmentCreditors(),
    getInvestments(),
  ]);

  const summary = summarizeExpenses(expenses, categories);
  const filteredExpenses = expenses.filter((expense) => {
    if (categoryId && expense.category_id !== categoryId) return false;
    if (methodId && expense.payment_method_id !== methodId) return false;
    return true;
  });

  const cards = [
    { label: "Total de la semana", value: formatCurrency(summary.total) },
    ...summary.byCategory.map((row) => ({
      label: row.category.name,
      value: formatCurrency(row.total),
    })),
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 pb-28 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Gastos e inversiones</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lo que sale para operar y lo que la empresa todavía debe.
            </p>
          </div>
          {activeTab === "gastos" ? (
            <Suspense fallback={<div className="h-9 w-[220px] animate-pulse rounded-md bg-muted" />}>
              <GastosWeekNav weekKey={weekKey} weekRange={weekRange} />
            </Suspense>
          ) : null}
        </div>

        <nav className="flex gap-1 border-b border-border/60">
          <Link
            href={gastosHref({ week: explicitWeek })}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "gastos"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Gastos
          </Link>
          <Link
            href={gastosHref({ tab: "inversiones", week: explicitWeek })}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "inversiones"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Inversiones
          </Link>
        </nav>
      </div>

      {activeTab === "gastos" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.label} className="shadow-none ring-1 ring-border/60">
                <CardContent className="pt-0">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ExpenseFilters
            week={explicitWeek}
            categories={categories}
            methods={methods}
            categoryId={categoryId}
            methodId={methodId}
          />
          <ExpensesPanel
            expenses={filteredExpenses}
            categories={categories}
            methods={methods}
            hasWeekExpenses={expenses.length > 0}
          />
        </>
      ) : (
        <InvestmentsPanel
          investments={investments}
          creditors={creditors}
          methods={methods}
        />
      )}
    </main>
  );
}
