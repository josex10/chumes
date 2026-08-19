import {
  COMMERCIAL_STATUS_CODES,
  EVENT_STATUS,
  TERMINAL_STATUS_CODES,
} from "@/lib/events/constants";

const COMMERCIAL_SET = new Set<string>([
  ...COMMERCIAL_STATUS_CODES,
  EVENT_STATUS.LOST,
]);

export function canTransitionCommercial(
  currentStatusCode: string,
  nextStatusCode: string,
): boolean {
  if (currentStatusCode === nextStatusCode) return false;

  if (TERMINAL_STATUS_CODES.includes(currentStatusCode as never)) {
    return false;
  }

  if (nextStatusCode === EVENT_STATUS.LOST) {
    return COMMERCIAL_STATUS_CODES.includes(currentStatusCode as never);
  }

  return (
    COMMERCIAL_SET.has(currentStatusCode) &&
    COMMERCIAL_STATUS_CODES.includes(nextStatusCode as never)
  );
}

export function isCommercialStatus(statusCode: string): boolean {
  return COMMERCIAL_STATUS_CODES.includes(statusCode as never);
}
