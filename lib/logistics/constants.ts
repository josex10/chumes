import { EVENT_STATUS, type EventStatusCode } from "@/lib/events/constants";

export const LOGISTICS_TAB = {
  WAREHOUSE: "bodega",
  DELIVERY: "instalaciones",
  PICKUP: "retirada",
} as const;

export type LogisticsTab = (typeof LOGISTICS_TAB)[keyof typeof LOGISTICS_TAB];

export const LOGISTICS_WINDOW = {
  TODAY: "hoy",
  WEEK: "semana",
  NEXT_WEEK: "siguiente",
} as const;

export type LogisticsWindow =
  (typeof LOGISTICS_WINDOW)[keyof typeof LOGISTICS_WINDOW];

export const DEFAULT_LOGISTICS_WINDOW = LOGISTICS_WINDOW.WEEK;

export const LOGISTICS_WINDOW_OPTIONS: {
  id: LogisticsWindow;
  label: string;
}[] = [
  { id: LOGISTICS_WINDOW.TODAY, label: "Hoy" },
  { id: LOGISTICS_WINDOW.WEEK, label: "Esta semana" },
  { id: LOGISTICS_WINDOW.NEXT_WEEK, label: "Siguiente semana" },
];

export const WAREHOUSE_STATUS_CODES: EventStatusCode[] = [
  EVENT_STATUS.RESERVED,
  EVENT_STATUS.PREP_CURRENT_WEEK,
  EVENT_STATUS.PREP_DAY_BEFORE,
];

export const PICKUP_STATUS_CODES: EventStatusCode[] = [EVENT_STATUS.DELIVERED];

export const PREP_STEP = {
  INVENTORY: "inventory",
  PULLED: "pulled",
  REPAIRED: "repaired",
  IRONED: "ironed",
  PACKED: "packed",
} as const;

export type PrepStep = (typeof PREP_STEP)[keyof typeof PREP_STEP];

export const PREP_STEP_COLUMNS = {
  [PREP_STEP.INVENTORY]: "inventory_checked_at",
  [PREP_STEP.PULLED]: "pulled_at",
  [PREP_STEP.REPAIRED]: "repaired_at",
  [PREP_STEP.IRONED]: "ironed_at",
  [PREP_STEP.PACKED]: "packed_at",
} as const;

export const PREP_STEPS = [
  { id: PREP_STEP.INVENTORY, label: "Validar inventario" },
  { id: PREP_STEP.PULLED, label: "Sacar" },
  { id: PREP_STEP.REPAIRED, label: "Reparar" },
  { id: PREP_STEP.IRONED, label: "Planchar" },
  { id: PREP_STEP.PACKED, label: "Empacar" },
] as const;

export const PACKING_CATEGORY_ORDER = [
  "CHAIRS",
  "CHAIR_COVERS",
  "TABLES",
  "TABLE_LINENS",
  "DECORATION",
  "ACCESSORIES",
  "OTHER",
] as const;

export function parseLogisticsTab(value: string | undefined): LogisticsTab {
  if (
    value === LOGISTICS_TAB.DELIVERY ||
    value === LOGISTICS_TAB.PICKUP
  ) {
    return value;
  }

  return LOGISTICS_TAB.WAREHOUSE;
}

export function parseLogisticsWindow(
  value: string | undefined,
): LogisticsWindow {
  if (
    value === LOGISTICS_WINDOW.TODAY ||
    value === LOGISTICS_WINDOW.WEEK ||
    value === LOGISTICS_WINDOW.NEXT_WEEK ||
    value === "proximas"
  ) {
    return value === "proximas" ? LOGISTICS_WINDOW.NEXT_WEEK : value;
  }

  return DEFAULT_LOGISTICS_WINDOW;
}

export function isPrepStep(value: string): value is PrepStep {
  return (Object.values(PREP_STEP) as string[]).includes(value);
}
