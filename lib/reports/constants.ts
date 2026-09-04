export const REPORTS_TAB = {
  PIPELINE: "pipeline",
  LOST: "perdidas",
} as const;

export type ReportesTab = (typeof REPORTS_TAB)[keyof typeof REPORTS_TAB];

export const LOST_DATE_FIELD = {
  ARCHIVED: "perdida",
  EVENT: "evento",
} as const;

export type LostDateFieldParam =
  (typeof LOST_DATE_FIELD)[keyof typeof LOST_DATE_FIELD];

export const PIPELINE_BUCKET = {
  NEAR: "near",
  FUTURE: "future",
  UNDATED: "undated",
  OVERDUE: "overdue",
} as const;

export type PipelineBucket =
  (typeof PIPELINE_BUCKET)[keyof typeof PIPELINE_BUCKET];

export const PIPELINE_HORIZON_DAYS = 30;

export const LOST_DEFAULT_LOOKBACK_DAYS = 30;

export const REPORTS_PAGE_SIZE = 20;

export const PIPELINE_BUCKET_LABEL: Record<PipelineBucket, string> = {
  near: "Próximo",
  future: "Futuro",
  undated: "Sin fecha",
  overdue: "Vencido",
};

export function parseReportesTab(value: string | undefined): ReportesTab {
  if (value === REPORTS_TAB.LOST) return value;
  return REPORTS_TAB.PIPELINE;
}

export function parseLostDateField(
  value: string | undefined,
): LostDateFieldParam {
  if (value === LOST_DATE_FIELD.EVENT) return value;
  return LOST_DATE_FIELD.ARCHIVED;
}
