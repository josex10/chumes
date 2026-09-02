import type { BankAccount } from "@/lib/supabase/types";

export function formatBankAccountLabel(account: BankAccount): string {
  const lastDigits = account.account_number.replace(/\s/g, "").slice(-4);
  return lastDigits
    ? `${account.name} · ${account.bank_name} · ···${lastDigits}`
    : `${account.name} · ${account.bank_name}`;
}

export function formatBankAccountShort(account: BankAccount): string {
  return `${account.name} · ${account.bank_name}`;
}

export function selectableBankAccounts(
  accounts: BankAccount[],
  currentId?: number | null,
): BankAccount[] {
  const active = accounts.filter((account) => account.is_active);
  if (!currentId) return active;

  const current = accounts.find((account) => account.id === currentId);
  if (current && !current.is_active) {
    return [...active, current];
  }

  return active;
}
