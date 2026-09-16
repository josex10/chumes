export const RESEARCH_STATUS = {
  OPEN: "OPEN",
  WAITING_CLIENT: "WAITING_CLIENT",
  DONE: "DONE",
} as const;

export type ResearchStatus =
  (typeof RESEARCH_STATUS)[keyof typeof RESEARCH_STATUS];

export const OPEN_RESEARCH_STATUSES: ResearchStatus[] = [
  RESEARCH_STATUS.OPEN,
  RESEARCH_STATUS.WAITING_CLIENT,
];

export const RESEARCH_UPDATE_KIND = {
  NOTE: "NOTE",
  WHATSAPP: "WHATSAPP",
} as const;

export type ResearchUpdateKind =
  (typeof RESEARCH_UPDATE_KIND)[keyof typeof RESEARCH_UPDATE_KIND];

export const RESEARCH_TITLE_SUGGESTIONS = [
  "Cristalería",
  "Arreglos florales",
  "Mobiliario",
] as const;

export function isOpenResearchStatus(
  status: string,
): status is
  | typeof RESEARCH_STATUS.OPEN
  | typeof RESEARCH_STATUS.WAITING_CLIENT {
  return OPEN_RESEARCH_STATUSES.includes(status as ResearchStatus);
}

export function getResearchStatusLabel(status: ResearchStatus): string {
  switch (status) {
    case RESEARCH_STATUS.OPEN:
      return "Pendiente";
    case RESEARCH_STATUS.WAITING_CLIENT:
      return "Esperando cliente";
    case RESEARCH_STATUS.DONE:
      return "Hecha";
  }
}
