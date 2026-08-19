export const FINANCIAL_MOVEMENT_TYPE = {
  ADVANCE: "ADVANCE",
  REFUND: "REFUND",
} as const;

export type FinancialMovementType =
  (typeof FINANCIAL_MOVEMENT_TYPE)[keyof typeof FINANCIAL_MOVEMENT_TYPE];

export const PAYMENT_STATUS = {
  PAID: "PAID",
  PENDING: "PENDING",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Cancelado",
  PENDING: "Pendiente",
};

export const FINANCIAL_MOVEMENT_TYPE_LABELS: Record<FinancialMovementType, string> = {
  ADVANCE: "Adelanto",
  REFUND: "Devolución",
};

export const PAYMENT_QUICK_PERCENTAGES = [10, 20, 50] as const;
