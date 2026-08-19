import { EVENT_PHASE, EVENT_STATUS, TERMINAL_STATUS_CODES } from "@/lib/events/constants";
import { PAYMENT_STATUS, type PaymentStatus } from "@/lib/payments/constants";

export type PaymentAccess = {
  movementsLocked: boolean;
  advanceDisabled: boolean;
  refundDisabled: boolean;
  editDisabled: boolean;
};

export function getPaymentAccess(
  eventPhase: string,
  eventStatusCode: string,
  paymentStatus: PaymentStatus,
): PaymentAccess {
  const isTerminalPhase = eventPhase === EVENT_PHASE.TERMINAL;
  const isClosedStatus = TERMINAL_STATUS_CODES.includes(
    eventStatusCode as (typeof TERMINAL_STATUS_CODES)[number],
  );
  const movementsLocked = isTerminalPhase || isClosedStatus;
  const isPaid = paymentStatus === PAYMENT_STATUS.PAID;

  return {
    movementsLocked,
    advanceDisabled: movementsLocked || isPaid,
    refundDisabled: movementsLocked,
    editDisabled: movementsLocked,
  };
}
