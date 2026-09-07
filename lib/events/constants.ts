export const EVENT_PHASE = {
  COMMERCIAL: "COMMERCIAL",
  OPERATIONAL: "OPERATIONAL",
  TERMINAL: "TERMINAL",
} as const;

export type EventPhase = (typeof EVENT_PHASE)[keyof typeof EVENT_PHASE];

export const EVENT_STATUS = {
  INQUIRY: "INQUIRY",
  NO_RESPONSE: "NO_RESPONSE",
  QUOTING: "QUOTING",
  QUOTED_NO_DATES: "QUOTED_NO_DATES",
  QUOTE_SENT: "QUOTE_SENT",
  FOLLOW_UP: "FOLLOW_UP",
  APPROVED: "APPROVED",
  RESERVED: "RESERVED",
  PREP_CURRENT_WEEK: "PREP_CURRENT_WEEK",
  PREP_DAY_BEFORE: "PREP_DAY_BEFORE",
  DELIVERED: "DELIVERED",
  PICKED_UP: "PICKED_UP",
  INSPECTION_PENDING: "INSPECTION_PENDING",
  COMPLETED: "COMPLETED",
  WON_ARCHIVED: "WON_ARCHIVED",
  LOST: "LOST",
  CANCELLED: "CANCELLED",
} as const;

export type EventStatusCode = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const EVENT_PRIORITY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
} as const;

export const COMMERCIAL_STATUS_CODES: EventStatusCode[] = [
  EVENT_STATUS.INQUIRY,
  EVENT_STATUS.NO_RESPONSE,
  EVENT_STATUS.QUOTING,
  EVENT_STATUS.QUOTED_NO_DATES,
  EVENT_STATUS.QUOTE_SENT,
  EVENT_STATUS.FOLLOW_UP,
  EVENT_STATUS.APPROVED,
];

export const OPERATIONAL_STATUS_CODES: EventStatusCode[] = [
  EVENT_STATUS.RESERVED,
  EVENT_STATUS.PREP_CURRENT_WEEK,
  EVENT_STATUS.PREP_DAY_BEFORE,
  EVENT_STATUS.DELIVERED,
  EVENT_STATUS.PICKED_UP,
  EVENT_STATUS.INSPECTION_PENDING,
  EVENT_STATUS.COMPLETED,
];

export const ARCHIVED_STATUS_CODES: EventStatusCode[] = [
  EVENT_STATUS.WON_ARCHIVED,
  EVENT_STATUS.LOST,
];

export const TERMINAL_STATUS_CODES: EventStatusCode[] = [
  ...ARCHIVED_STATUS_CODES,
  EVENT_STATUS.CANCELLED,
];

export const EVENTS_PIPELINE_TAB = {
  COMMERCIAL: "comercial",
  OPERATIONAL: "operacion",
  HISTORY: "historial",
} as const;

export type EventsPipelineTab =
  (typeof EVENTS_PIPELINE_TAB)[keyof typeof EVENTS_PIPELINE_TAB];

export const EVENT_ARCHIVE_TYPE = {
  WON: "ganado",
  LOST: "perdido",
} as const;

export type EventArchiveType =
  (typeof EVENT_ARCHIVE_TYPE)[keyof typeof EVENT_ARCHIVE_TYPE];

export const EVENT_HISTORY_PAGE_SIZE = 20;

export function parseEventsPipelineTab(
  value: string | undefined,
): EventsPipelineTab {
  if (
    value === EVENTS_PIPELINE_TAB.OPERATIONAL ||
    value === EVENTS_PIPELINE_TAB.HISTORY
  ) {
    return value;
  }

  return EVENTS_PIPELINE_TAB.COMMERCIAL;
}

export function parseEventArchiveType(
  value: string | undefined,
): EventArchiveType | undefined {
  if (value === EVENT_ARCHIVE_TYPE.WON || value === EVENT_ARCHIVE_TYPE.LOST) {
    return value;
  }

  return undefined;
}

export function isArchivedStatus(statusCode: string): boolean {
  return ARCHIVED_STATUS_CODES.includes(statusCode as EventStatusCode);
}

export const LOST_REASON = {
  NO_RESPONSE: "NO_RESPONSE",
  NO_INVENTORY: "NO_INVENTORY",
  OVER_BUDGET: "OVER_BUDGET",
  OTHER_VENDOR: "OTHER_VENDOR",
  EVENT_CANCELLED: "EVENT_CANCELLED",
  DATES_UNAVAILABLE: "DATES_UNAVAILABLE",
  OTHER: "OTHER",
} as const;

export type LostReasonCode = (typeof LOST_REASON)[keyof typeof LOST_REASON];

export const LOST_REASON_OPTIONS: {
  code: LostReasonCode;
  label: string;
}[] = [
  { code: LOST_REASON.NO_RESPONSE, label: "Sin respuesta" },
  { code: LOST_REASON.NO_INVENTORY, label: "Sin inventario" },
  { code: LOST_REASON.OVER_BUDGET, label: "Se pasó de presupuesto" },
  { code: LOST_REASON.OTHER_VENDOR, label: "Eligió a otro proveedor" },
  { code: LOST_REASON.EVENT_CANCELLED, label: "Canceló el evento" },
  { code: LOST_REASON.DATES_UNAVAILABLE, label: "Fechas no disponibles" },
  { code: LOST_REASON.OTHER, label: "Otro" },
];

export function resolveLostReason(
  code: string,
  customText?: string,
): string | null {
  if (code === LOST_REASON.OTHER) {
    const custom = customText?.trim() ?? "";
    return custom.length > 0 ? custom : null;
  }

  const option = LOST_REASON_OPTIONS.find((item) => item.code === code);
  return option?.label ?? null;
}
