export const BANK_ACCOUNT_KIND = {
  OPERATING: "OPERATING",
  ADVANCES: "ADVANCES",
} as const;

export type BankAccountKind =
  (typeof BANK_ACCOUNT_KIND)[keyof typeof BANK_ACCOUNT_KIND];

export const BANK_ACCOUNT_KIND_LABELS: Record<BankAccountKind, string> = {
  OPERATING: "Operativa",
  ADVANCES: "Adelantos",
};
