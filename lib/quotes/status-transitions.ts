import { QUOTE_STATUS } from "@/lib/quotes/constants";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [QUOTE_STATUS.DRAFT]: [QUOTE_STATUS.SENT, QUOTE_STATUS.REJECTED],
  [QUOTE_STATUS.SENT]: [QUOTE_STATUS.CUSTOMER_APPROVED, QUOTE_STATUS.REJECTED, QUOTE_STATUS.EXPIRED],
  [QUOTE_STATUS.CUSTOMER_APPROVED]: [QUOTE_STATUS.PENDING_AVAILABILITY, QUOTE_STATUS.REJECTED],
  [QUOTE_STATUS.PENDING_AVAILABILITY]: [],
  [QUOTE_STATUS.REJECTED]: [],
  [QUOTE_STATUS.EXPIRED]: [],
};

export function canTransitionStatus(currentStatusCode: string, nextStatusCode: string): boolean {
  return (ALLOWED_TRANSITIONS[currentStatusCode] ?? []).includes(nextStatusCode);
}

export function getAllowedTransitions(currentStatusCode: string): string[] {
  return ALLOWED_TRANSITIONS[currentStatusCode] ?? [];
}

export function getStatusActionLabel(statusCode: string): string {
  switch (statusCode) {
    case QUOTE_STATUS.SENT: return "Mark as sent";
    case QUOTE_STATUS.CUSTOMER_APPROVED: return "Mark as approved";
    case QUOTE_STATUS.PENDING_AVAILABILITY: return "Mark pending availability";
    case QUOTE_STATUS.REJECTED: return "Mark as rejected";
    case QUOTE_STATUS.EXPIRED: return "Mark as expired";
    default: return statusCode;
  }
}
