import { DemoReportCards } from "@/components/demo-report/demo-report-cards";
import { DemoReportCharts } from "@/components/demo-report/demo-report-charts";
import { DemoReportDetails } from "@/components/demo-report/demo-report-details";
import { DemoReportHeader } from "@/components/demo-report/demo-report-header";
import { getDemoReport } from "@/lib/demo-report/queries";
import { resolveDemoPeriod } from "@/lib/demo-report/period";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reportes demo",
};

type DemoPageProps = {
  searchParams: Promise<{ vista?: string; fecha?: string }>;
};

export default async function DemoReportPage({ searchParams }: DemoPageProps) {
  const { vista, fecha } = await searchParams;
  const period = resolveDemoPeriod(vista, fecha);
  const report = await getDemoReport(period);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-10">
      <DemoReportHeader period={period} />
      <DemoReportCards report={report} />
      <DemoReportCharts report={report} />
      <DemoReportDetails report={report} />
    </main>
  );
}
