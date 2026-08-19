import {
  COMMERCIAL_STATUS_CODES,
  EVENT_PHASE,
  EVENT_STATUS,
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
  if (isOperationalStatus(statusCode)) return EVENT_PHASE.OPERATIONAL;
  if (
    statusCode === EVENT_STATUS.LOST ||
    statusCode === EVENT_STATUS.COMPLETED ||
    statusCode === EVENT_STATUS.CANCELLED
  ) {
    return EVENT_PHASE.TERMINAL;
  }
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

export function getStatusActionLabel(statusCode: string): string {
  switch (statusCode) {
    case EVENT_STATUS.FOLLOW_UP:
      return "Marcar en seguimiento";
    case EVENT_STATUS.NO_RESPONSE:
      return "Marcar sin respuesta";
    case EVENT_STATUS.QUOTING:
      return "Marcar cotizando";
    case EVENT_STATUS.QUOTE_SENT:
      return "Marcar cotización enviada";
    case EVENT_STATUS.QUOTED_NO_DATES:
      return "Marcar cotizado sin fechas";
    case EVENT_STATUS.APPROVED:
      return "Marcar aprobada";
    case EVENT_STATUS.LOST:
      return "Marcar perdida";
    case EVENT_STATUS.RESERVED:
      return "Confirmar y reservar";
    case EVENT_STATUS.DELIVERED:
      return "Marcar entregada";
    case EVENT_STATUS.PICKED_UP:
      return "Marcar recogida";
    case EVENT_STATUS.INSPECTION_PENDING:
      return "Marcar inspección";
    case EVENT_STATUS.COMPLETED:
      return "Marcar completada";
    case EVENT_STATUS.CANCELLED:
      return "Cancelar evento";
    default:
      return statusCode;
  }
}
