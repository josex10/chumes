import { LostTab } from "@/components/reports/lost-tab";
import { PipelineTab } from "@/components/reports/pipeline-tab";
import { ReportesHeader } from "@/components/reports/reportes-header";
import { todayInCostaRica } from "@/lib/follow-ups/calendar";
import {
  REPORTS_TAB,
  parseLostDateField,
  parseReportesTab,
} from "@/lib/reports/constants";
import { resolveLostDateRange } from "@/lib/reports/period";
import {
  getLostPipelineReport,
  getPipelineReport,
} from "@/lib/reports/queries";

export const dynamic = "force-dynamic";

type ReportesPageProps = {
  searchParams: Promise<{
    tab?: string;
    from?: string;
    to?: string;
    dateField?: string;
    page?: string;
  }>;
};

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const {
    tab: tabParam,
    from,
    to,
    dateField: dateFieldParam,
    page: pageParam,
  } = await searchParams;

  const activeTab = parseReportesTab(tabParam);
  const dateField = parseLostDateField(dateFieldParam);
  const page = Math.max(1, Number(pageParam) || 1);
  const todayKey = todayInCostaRica();
  const lostRange = resolveLostDateRange(from, to, todayKey);

  const [pipelineReport, lostReport] = await Promise.all([
    activeTab === REPORTS_TAB.PIPELINE
      ? getPipelineReport()
      : Promise.resolve(null),
    activeTab === REPORTS_TAB.LOST
      ? getLostPipelineReport({
          dateFrom: lostRange.dateFrom,
          dateTo: lostRange.dateTo,
          dateField,
          page,
        })
      : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-10">
      <ReportesHeader activeTab={activeTab} todayKey={todayKey} />

      {activeTab === REPORTS_TAB.PIPELINE && pipelineReport ? (
        <PipelineTab report={pipelineReport} page={page} />
      ) : null}

      {activeTab === REPORTS_TAB.LOST && lostReport ? (
        <LostTab
          report={lostReport}
          dateFrom={lostRange.dateFrom}
          dateTo={lostRange.dateTo}
          dateField={dateField}
        />
      ) : null}
    </main>
  );
}
