import {
  COMMERCIAL_STATUS_CODES,
  EVENT_PHASE,
  EVENT_STATUS,
  TERMINAL_STATUS_CODES,
  type EventPhase,
} from "@/lib/events/constants";
import {
  canTransitionCommercial,
  isCommercialStatus,
} from "@/lib/events/commercial-transitions";
import {
  canTransitionOperational,
  getAllowedOperationalTransitions,
  isOperationalStatus,
} from "@/lib/events/operational-transitions";

export function getStatusPhase(statusCode: string): EventPhase {
  if (TERMINAL_STATUS_CODES.includes(statusCode as never)) {
    return EVENT_PHASE.TERMINAL;
  }

  if (isOperationalStatus(statusCode)) return EVENT_PHASE.OPERATIONAL;

  return EVENT_PHASE.COMMERCIAL;
}

export function canTransitionStatus(
  currentStatusCode: string,
  nextStatusCode: string,
): boolean {
  const currentPhase = getStatusPhase(currentStatusCode);

  if (currentPhase === EVENT_PHASE.TERMINAL) {
    return false;
  }

  if (currentPhase === EVENT_PHASE.COMMERCIAL) {
    return canTransitionCommercial(currentStatusCode, nextStatusCode);
  }

  return canTransitionOperational(currentStatusCode, nextStatusCode);
}

export function getAllowedTransitions(currentStatusCode: string): string[] {
  if (isCommercialStatus(currentStatusCode)) {
    return [
      ...COMMERCIAL_STATUS_CODES.filter((code) => code !== currentStatusCode),
      EVENT_STATUS.LOST,
    ];
  }

  if (isOperationalStatus(currentStatusCode)) {
    return getAllowedOperationalTransitions(currentStatusCode);
  }

  return [];
}

export function withLostArchiveAtEnd<T extends { code: string }>(
  statuses: T[],
  allStatuses: T[],
  extraArchiveCodes: readonly string[] = [],
): T[] {
  const archiveCodes = [...extraArchiveCodes, EVENT_STATUS.LOST];
  const archiveSet = new Set(archiveCodes);
  const withoutArchives = statuses.filter(
    (status) => !archiveSet.has(status.code),
  );
  const archives = archiveCodes
    .map((code) => allStatuses.find((status) => status.code === code))
    .filter((status): status is T => Boolean(status));

  return [...withoutArchives, ...archives];
}

export function getStatusActionLabel(statusCode: string): string {
  switch (statusCode) {
    case EVENT_STATUS.INQUIRY:
      return "Marcar solicitud inicial";
    case EVENT_STATUS.NO_RESPONSE:
      return "Marcar sin respuesta";
    case EVENT_STATUS.QUOTING:
      return "Marcar sin cotizar";
    case EVENT_STATUS.QUOTED_NO_DATES:
      return "Marcar cotizado sin fecha";
    case EVENT_STATUS.QUOTE_SENT:
      return "Marcar pendiente de aprobar";
    case EVENT_STATUS.FOLLOW_UP:
      return "Marcar seguimiento de semana actual";
    case EVENT_STATUS.APPROVED:
      return "Marcar aprobado pendiente de depósito";
    case EVENT_STATUS.LOST:
      return "Archivar como perdido";
    case EVENT_STATUS.RESERVED:
      return "Confirmar y reservar";
    case EVENT_STATUS.PREP_CURRENT_WEEK:
      return "Marcar preparando semana actual";
    case EVENT_STATUS.PREP_DAY_BEFORE:
      return "Marcar preparando día previo";
    case EVENT_STATUS.DELIVERED:
      return "Marcar entregado";
    case EVENT_STATUS.PICKED_UP:
      return "Marcar listo para recolección";
    case EVENT_STATUS.INSPECTION_PENDING:
      return "Marcar inspección";
    case EVENT_STATUS.COMPLETED:
      return "Marcar cerrado ganado";
    case EVENT_STATUS.WON_ARCHIVED:
      return "Archivar como ganado";
    case EVENT_STATUS.CANCELLED:
      return "Cancelar evento";
    default:
      return statusCode;
  }
}
