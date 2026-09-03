import {
  LOGISTICS_TAB,
  LOGISTICS_WINDOW,
  type LogisticsTab,
  type LogisticsWindow,
} from "@/lib/logistics/constants";

export function buildLogisticsHref(query: {
  tab?: LogisticsTab;
  window?: LogisticsWindow;
}): string {
  const params = new URLSearchParams();

  if (query.tab && query.tab !== LOGISTICS_TAB.WAREHOUSE) {
    params.set("tab", query.tab);
  }

  if (query.window && query.window !== LOGISTICS_WINDOW.WEEK) {
    params.set("window", query.window);
  }

  const qs = params.toString();
  return qs ? `/logistica?${qs}` : "/logistica";
}
