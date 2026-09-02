import Link from "next/link";
import { getBankAccounts } from "@/lib/bank-accounts/queries";
import { BANK_ACCOUNT_KIND_LABELS } from "@/lib/bank-accounts/constants";
import { BankAccountRowActions } from "@/components/events/bank-account-row-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BankAccountsSettingsPage() {
  const accounts = await getBankAccounts();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver a eventos
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Cuentas bancarias
          </h1>
          <p className="mt-2 text-muted-foreground">
            Define a qué cuenta entra cada adelanto y de cuál sale cada devolución.
            Desactiva una cuenta para dejarla fuera de los formularios sin perder el historial.
          </p>
        </div>
        <Link
          href="/events/settings/accounts/new"
          className={cn(buttonVariants({ variant: "add" }))}
        >
          Nueva cuenta
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Aún no hay cuentas configuradas.</p>
          <Link
            href="/events/settings/accounts/new"
            className={cn(buttonVariants({ variant: "add" }), "mt-4 inline-flex")}
          >
            Crear primera cuenta
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.bank_name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {account.account_number}
                  </TableCell>
                  <TableCell>{BANK_ACCOUNT_KIND_LABELS[account.kind]}</TableCell>
                  <TableCell>{account.is_active ? "Activa" : "Inactiva"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/events/settings/accounts/${account.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                        )}
                      >
                        Editar
                      </Link>
                      <BankAccountRowActions
                        accountId={account.id}
                        isActive={account.is_active}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
