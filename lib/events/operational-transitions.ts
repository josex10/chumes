import { EVENT_STATUS, OPERATIONAL_STATUS_CODES } from "@/lib/events/constants";

export function canTransitionOperational(
  currentStatusCode: string,
  nextStatusCode: string,
): boolean {
  if (currentStatusCode === nextStatusCode) return false;

  if (!OPERATIONAL_STATUS_CODES.includes(currentStatusCode as never)) {
    return false;
  }

  if (OPERATIONAL_STATUS_CODES.includes(nextStatusCode as never)) {
    return true;
  }

  return (
    nextStatusCode === EVENT_STATUS.LOST ||
    nextStatusCode === EVENT_STATUS.WON_ARCHIVED
  );
}

export function getAllowedOperationalTransitions(currentStatusCode: string): string[] {
  if (!OPERATIONAL_STATUS_CODES.includes(currentStatusCode as never)) {
    return [];
  }

  return [
    ...OPERATIONAL_STATUS_CODES.filter((code) => code !== currentStatusCode),
    EVENT_STATUS.WON_ARCHIVED,
    EVENT_STATUS.LOST,
  ];
}

export function isOperationalStatus(statusCode: string): boolean {
  return OPERATIONAL_STATUS_CODES.includes(statusCode as never);
}
