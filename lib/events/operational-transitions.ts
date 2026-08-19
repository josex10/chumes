import { EVENT_STATUS } from "@/lib/events/constants";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [EVENT_STATUS.RESERVED]: [EVENT_STATUS.DELIVERED, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.DELIVERED]: [EVENT_STATUS.PICKED_UP, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.PICKED_UP]: [EVENT_STATUS.INSPECTION_PENDING, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.INSPECTION_PENDING]: [EVENT_STATUS.COMPLETED, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.COMPLETED]: [],
  [EVENT_STATUS.CANCELLED]: [],
};

export function canTransitionOperational(
  currentStatusCode: string,
  nextStatusCode: string,
): boolean {
  return (ALLOWED_TRANSITIONS[currentStatusCode] ?? []).includes(nextStatusCode);
}

export function getAllowedOperationalTransitions(currentStatusCode: string): string[] {
  return ALLOWED_TRANSITIONS[currentStatusCode] ?? [];
}

export function isOperationalStatus(statusCode: string): boolean {
  return Boolean(ALLOWED_TRANSITIONS[statusCode]);
}
