import {
  EVENTS_PIPELINE_TAB,
  type EventArchiveType,
  type EventsPipelineTab,
} from "@/lib/events/constants";

export type EventsPageQuery = {
  tab?: EventsPipelineTab;
  customerId?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  archiveType?: EventArchiveType;
  page?: number;
};

export function buildEventsHref(query: EventsPageQuery): string {
  const params = new URLSearchParams();

  if (query.tab && query.tab !== EVENTS_PIPELINE_TAB.COMMERCIAL) {
    params.set("tab", query.tab);
  }

  if (query.customerId) {
    params.set("customerId", query.customerId);
  }

  if (query.source) {
    params.set("source", query.source);
  }

  if (query.tab === EVENTS_PIPELINE_TAB.HISTORY) {
    if (query.dateFrom) params.set("from", query.dateFrom);
    if (query.dateTo) params.set("to", query.dateTo);
    if (query.archiveType) params.set("archiveType", query.archiveType);
    if (query.page && query.page > 1) params.set("page", String(query.page));
  }

  const qs = params.toString();
  return qs ? `/events?${qs}` : "/events";
}

export function getArchiveTypeLabel(statusCode: string): string {
  if (
    statusCode === "WON_ARCHIVED" ||
    statusCode === "COMPLETED"
  ) {
    return "Ganado";
  }

  if (statusCode === "LOST" || statusCode === "CANCELLED") {
    return "Perdido";
  }

  return statusCode;
}
