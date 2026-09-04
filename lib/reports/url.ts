import {
  LOST_DATE_FIELD,
  REPORTS_TAB,
  type LostDateFieldParam,
  type ReportesTab,
} from "@/lib/reports/constants";

export type ReportesPageQuery = {
  tab?: ReportesTab;
  dateFrom?: string;
  dateTo?: string;
  dateField?: LostDateFieldParam;
  page?: number;
};

export function buildReportesHref(query: ReportesPageQuery = {}): string {
  const params = new URLSearchParams();
  const tab = query.tab ?? REPORTS_TAB.PIPELINE;

  if (tab !== REPORTS_TAB.PIPELINE) {
    params.set("tab", tab);
  }

  if (tab === REPORTS_TAB.LOST) {
    if (query.dateFrom) params.set("from", query.dateFrom);
    if (query.dateTo) params.set("to", query.dateTo);
    if (query.dateField && query.dateField !== LOST_DATE_FIELD.ARCHIVED) {
      params.set("dateField", query.dateField);
    }
  }

  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  const qs = params.toString();
  return qs ? `/reportes?${qs}` : "/reportes";
}
