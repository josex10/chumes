import Link from "next/link";
import { Suspense } from "react";
import { WeekPicker } from "@/components/dashboard/week-picker";
import { getWeekKey } from "@/lib/dashboard/stats";
import { cn } from "@/lib/utils";

export type DashboardTab = "main" | "cotizaciones" | "finanzas";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "main", label: "Main" },
  { id: "cotizaciones", label: "Cotizaciones" },
  { id: "finanzas", label: "Finanzas" },
];

type DashboardHeaderProps = {
  activeTab: DashboardTab;
  weekKey: string;
  weekRange: string;
};

export function DashboardHeader({ activeTab, weekKey, weekRange }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen semanal de leads, cotizaciones y finanzas
          </p>
        </div>
        <Suspense fallback={<div className="h-9 w-[220px] animate-pulse rounded-md bg-muted" />}>
          <WeekPicker weekKey={weekKey} weekRange={weekRange} />
        </Suspense>
      </div>

      <nav className="flex gap-1 border-b border-border/60">
        {TABS.map((tab) => {
          const params = new URLSearchParams();
          params.set("tab", tab.id);
          if (weekKey !== getWeekKey()) {
            params.set("week", weekKey);
          }
          const href = `/dashboard?${params.toString()}`;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
