import Link from "next/link";
import { formatDateKey } from "@/lib/follow-ups/calendar";
import { REPORTS_TAB, type ReportesTab } from "@/lib/reports/constants";
import { buildReportesHref } from "@/lib/reports/url";
import { cn } from "@/lib/utils";

const TABS: { id: ReportesTab; label: string }[] = [
  { id: REPORTS_TAB.PIPELINE, label: "Pipeline" },
  { id: REPORTS_TAB.LOST, label: "Pérdidas" },
];

type ReportesHeaderProps = {
  activeTab: ReportesTab;
  todayKey: string;
};

export function ReportesHeader({ activeTab, todayKey }: ReportesHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snapshot en vivo al {formatDateKey(todayKey)}. Forecast de cotizaciones
          abiertas y cotizaciones cerradas perdidas.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-border/60">
        {TABS.map((tab) => {
          const href = buildReportesHref({ tab: tab.id });
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
