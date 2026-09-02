import Link from "next/link";
import { BankAccountForm } from "@/components/events/bank-account-form";

export const dynamic = "force-dynamic";

export default function NewBankAccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/events/settings/accounts"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a cuentas
      </Link>
      <BankAccountForm />
    </main>
  );
}
