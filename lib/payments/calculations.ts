import {
  FINANCIAL_MOVEMENT_TYPE,
  PAYMENT_STATUS,
  type FinancialMovementType,
} from "@/lib/payments/constants";
import type { PaymentStatus, PaymentSummary } from "@/lib/supabase/types";

type MovementForSummary = {
  movement_type: FinancialMovementType;
  amount: number;
};

export type { PaymentSummary };

export function calculatePaymentSummary(
  quoteTotal: number,
  movements: MovementForSummary[],
): PaymentSummary {
  const totalAdvances = movements
    .filter((m) => m.movement_type === FINANCIAL_MOVEMENT_TYPE.ADVANCE)
    .reduce((sum, m) => sum + m.amount, 0);

  const totalRefunds = movements
    .filter((m) => m.movement_type === FINANCIAL_MOVEMENT_TYPE.REFUND)
    .reduce((sum, m) => sum + m.amount, 0);

  const netPaid = totalAdvances - totalRefunds;
  const balanceDue = Math.max(0, quoteTotal - netPaid);
  const overpaidAmount = Math.max(0, netPaid - quoteTotal);

  return {
    quoteTotal,
    totalAdvances,
    totalRefunds,
    netPaid,
    balanceDue,
    overpaidAmount,
    paymentStatus:
      balanceDue === 0 ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
  };
}
