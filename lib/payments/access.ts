import { EVENT_PHASE, isArchivedStatus } from "@/lib/events/constants";
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
  const movementsLocked =
    eventPhase === EVENT_PHASE.TERMINAL || isArchivedStatus(eventStatusCode);
  const isPaid = paymentStatus === PAYMENT_STATUS.PAID;

  return {
    movementsLocked,
    advanceDisabled: movementsLocked || isPaid,
    refundDisabled: movementsLocked,
    editDisabled: movementsLocked,
  };
}
