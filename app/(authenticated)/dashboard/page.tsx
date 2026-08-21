import { CotizacionesTab } from "@/components/dashboard/cotizaciones-tab";
import {
  DashboardHeader,
  type DashboardTab,
} from "@/components/dashboard/dashboard-header";
import { FinanzasTab } from "@/components/dashboard/finanzas-tab";
import { MainTab } from "@/components/dashboard/main-tab";
import {
  getCustomersCount,
  getCustomersCreatedBetween,
} from "@/lib/customers/queries";
import {
  formatWeekRange,
  getDashboardSummary,
  getFinanceWeekStats,
  getLeadsWeekStats,
  getReservationsWeekStats,
  getWeekBounds,
  getWeekKey,
  parseWeekKey,
} from "@/lib/dashboard/stats";
import { getActiveEventSources } from "@/lib/event-sources/queries";
import {
  getEventsByEventDateBetween,
  getEventsCreatedBetween,
  getEventsReservedBetween,
} from "@/lib/events/queries";
import { getQuotesCreatedBetween } from "@/lib/quotes/queries";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ tab?: string; week?: string }>;
};

function parseTab(tab?: string): DashboardTab {
  if (tab === "cotizaciones" || tab === "finanzas") return tab;
  return "main";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { tab: tabParam, week: weekParam } = await searchParams;
  const activeTab = parseTab(tabParam);
  const reference = weekParam ? parseWeekKey(weekParam) : new Date();
  const { start, end } = getWeekBounds(reference);
  const weekKey = getWeekKey(reference);
  const weekRange = formatWeekRange(start, end);

  const [
    leadsEvents,
    reservedEvents,
    financeEvents,
    quotes,
    totalCustomers,
    customersThisWeek,
    eventSources,
  ] = await Promise.all([
    getEventsCreatedBetween(start, end),
    getEventsReservedBetween(start, end),
    getEventsByEventDateBetween(start, end),
    getQuotesCreatedBetween(start, end),
    getCustomersCount(),
    getCustomersCreatedBetween(start, end),
    getActiveEventSources(),
  ]);

  const leadsStats = getLeadsWeekStats(leadsEvents, eventSources, reference);
  const reservationsStats = getReservationsWeekStats(reservedEvents, reference);
  const financeStats = getFinanceWeekStats(financeEvents, reference);
  const quotesSummary = getDashboardSummary(
    quotes,
    customersThisWeek,
    totalCustomers,
    reference,
  );
  const sourceNames = eventSources.map((s) => s.name);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-10">
      <DashboardHeader activeTab={activeTab} weekKey={weekKey} weekRange={weekRange} />

      {activeTab === "main" && (
        <MainTab
          leadsStats={leadsStats}
          reservationsStats={reservationsStats}
          sourceNames={sourceNames}
        />
      )}

      {activeTab === "cotizaciones" && (
        <CotizacionesTab summary={quotesSummary} quotes={quotes} />
      )}

      {activeTab === "finanzas" && <FinanzasTab stats={financeStats} />}
    </main>
  );
}
