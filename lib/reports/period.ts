import {
  addCalendarDays,
  formatDateKey,
  todayInCostaRica,
} from "@/lib/follow-ups/calendar";
import {
  LOST_DATE_FIELD,
  LOST_DEFAULT_LOOKBACK_DAYS,
  type LostDateFieldParam,
} from "@/lib/reports/constants";

export const LOST_DATE_FIELD_LABEL: Record<LostDateFieldParam, string> = {
  [LOST_DATE_FIELD.ARCHIVED]: "fecha de pérdida",
  [LOST_DATE_FIELD.EVENT]: "fecha del evento",
};

export function getLostDefaultDateRange(todayKey = todayInCostaRica()): {
  dateFrom: string;
  dateTo: string;
} {
  return {
    dateFrom: addCalendarDays(todayKey, -LOST_DEFAULT_LOOKBACK_DAYS),
    dateTo: todayKey,
  };
}

export function resolveLostDateRange(
  dateFrom?: string,
  dateTo?: string,
  todayKey = todayInCostaRica(),
): { dateFrom?: string; dateTo?: string } {
  if (dateFrom || dateTo) {
    return { dateFrom, dateTo };
  }
  return getLostDefaultDateRange(todayKey);
}

export function isLostDefaultDateRange(
  dateFrom?: string,
  dateTo?: string,
  todayKey = todayInCostaRica(),
): boolean {
  const defaults = getLostDefaultDateRange(todayKey);
  return dateFrom === defaults.dateFrom && dateTo === defaults.dateTo;
}

export function formatLostPeriodRange(
  dateFrom?: string,
  dateTo?: string,
  todayKey = todayInCostaRica(),
): string {
  if (dateFrom && dateTo && isLostDefaultDateRange(dateFrom, dateTo, todayKey)) {
    return `Últimos ${LOST_DEFAULT_LOOKBACK_DAYS} días (${formatDateKey(dateFrom)} – ${formatDateKey(dateTo)})`;
  }
  if (dateFrom && dateTo) {
    return `${formatDateKey(dateFrom)} – ${formatDateKey(dateTo)}`;
  }
  if (dateFrom) return `Desde ${formatDateKey(dateFrom)}`;
  if (dateTo) return `Hasta ${formatDateKey(dateTo)}`;
  return "Todo el historial";
}
