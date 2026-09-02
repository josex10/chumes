import Link from "next/link";
import { notFound } from "next/navigation";
import { getBankAccountById } from "@/lib/bank-accounts/queries";
import { BankAccountForm } from "@/components/events/bank-account-form";

export const dynamic = "force-dynamic";

type EditBankAccountPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBankAccountPage({
  params,
}: EditBankAccountPageProps) {
  const { id } = await params;
  const accountId = Number(id);

  if (!Number.isInteger(accountId) || accountId <= 0) {
    notFound();
  }

  const account = await getBankAccountById(accountId);

  if (!account) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/events/settings/accounts"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a cuentas
      </Link>
      <BankAccountForm account={account} />
    </main>
  );
}
