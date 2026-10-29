import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  adjacentPeriodKey,
  buildDemoHref,
  DEMO_VIEW,
  type DemoPeriod,
} from "@/lib/demo-report/period";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: DEMO_VIEW.WEEK, label: "Semana" },
  { id: DEMO_VIEW.MONTH, label: "Mes" },
] as const;

type DemoReportHeaderProps = {
  period: DemoPeriod;
};

export function DemoReportHeader({ period }: DemoReportHeaderProps) {
  const previousHref = buildDemoHref(period.view, adjacentPeriodKey(period, -1));
  const nextHref = buildDemoHref(period.view, adjacentPeriodKey(period, 1));
  const currentLabel = period.view === DEMO_VIEW.MONTH ? "este mes" : "esta semana";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Reportes demo</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Vista de prueba para la reunión semanal y mensual. Cuando quede afinada
            se puede pasar al dashboard.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex rounded-lg bg-muted/50 p-1">
            {VIEWS.map((view) => {
              const isActive = period.view === view.id;
              return (
                <Link
                  key={view.id}
                  href={buildDemoHref(view.id, period.anchorKey)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-background font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {view.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={previousHref}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              aria-label={period.view === DEMO_VIEW.MONTH ? "Mes anterior" : "Semana anterior"}
            >
              <ChevronLeft className="size-4" />
            </Link>

            <div className="flex min-w-[180px] flex-col items-center">
              <span className="text-sm font-medium">{period.label}</span>
              {!period.isCurrent ? (
                <Link
                  href={buildDemoHref(period.view)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Ir a {currentLabel}
                </Link>
              ) : null}
            </div>

            <Link
              href={nextHref}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              aria-label={period.view === DEMO_VIEW.MONTH ? "Mes siguiente" : "Semana siguiente"}
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
