"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { confirmDelivery } from "@/lib/logistics/actions";
import { toDatetimeLocalValue } from "@/lib/events/format-dates";
import {
  formatBankAccountLabel,
  selectableBankAccounts,
} from "@/lib/bank-accounts/format";
import {
  BANK_ACCOUNT_KIND,
  BANK_ACCOUNT_KIND_LABELS,
} from "@/lib/bank-accounts/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { BankAccount, PaymentMethod } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConfirmDeliveryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  pickupDate: string | null;
  balanceDue: number;
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};

export function ConfirmDeliveryDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  pickupDate,
  balanceDue,
  paymentMethods,
  bankAccounts,
}: ConfirmDeliveryDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pickupValue, setPickupValue] = useState(
    toDatetimeLocalValue(pickupDate),
  );
  const [collectPayment, setCollectPayment] = useState(false);
  const [amount, setAmount] = useState(
    balanceDue > 0 ? String(balanceDue) : "",
  );
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(
    paymentMethods[0]?.id,
  );
  const [bankAccountId, setBankAccountId] = useState<number | undefined>(
    selectableBankAccounts(bankAccounts)[0]?.id,
  );

  const accounts = useMemo(
    () => selectableBankAccounts(bankAccounts),
    [bankAccounts],
  );
  const operating = accounts.filter(
    (account) => account.kind === BANK_ACCOUNT_KIND.OPERATING,
  );
  const advances = accounts.filter(
    (account) => account.kind === BANK_ACCOUNT_KIND.ADVANCES,
  );
  const methodItems = useMemo(
    () =>
      paymentMethods.map((method) => ({
        value: String(method.id),
        label: method.name,
      })),
    [paymentMethods],
  );
  const accountItems = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.id),
        label: formatBankAccountLabel(account),
      })),
    [accounts],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPickupValue(toDatetimeLocalValue(pickupDate));
    setCollectPayment(false);
    setAmount(balanceDue > 0 ? String(balanceDue) : "");
  }, [open, pickupDate, balanceDue]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null);
      setPickupValue(toDatetimeLocalValue(pickupDate));
      setCollectPayment(false);
      setAmount(balanceDue > 0 ? String(balanceDue) : "");
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await confirmDelivery({
        eventId,
        pickupDate: pickupValue,
        collectPayment: collectPayment && balanceDue > 0,
        payment:
          collectPayment && balanceDue > 0 && paymentMethodId && bankAccountId
            ? {
                amount: Number(amount),
                payment_method_id: paymentMethodId,
                bank_account_id: bankAccountId,
              }
            : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      handleOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar entrega</DialogTitle>
          <DialogDescription>
            {eventTitle}. Confirmá la hora de retiro y el evento pasa a
            Retirada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickup_date">Hora de retiro</Label>
            <Input
              id="pickup_date"
              type="datetime-local"
              value={pickupValue}
              onChange={(event) => setPickupValue(event.target.value)}
            />
          </div>

          {balanceDue > 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={collectPayment}
                  onChange={(event) => setCollectPayment(event.target.checked)}
                  className="size-4 accent-primary"
                />
                Registrar cobro del saldo ({formatCurrency(balanceDue)})
              </label>

              {collectPayment ? (
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="collect_amount">Monto</Label>
                    <Input
                      id="collect_amount"
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de pago</Label>
                    <Select
                      value={paymentMethodId ? String(paymentMethodId) : null}
                      onValueChange={(next) =>
                        next && setPaymentMethodId(Number(next))
                      }
                      items={methodItems}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={String(method.id)}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cuenta</Label>
                    <Select
                      value={bankAccountId ? String(bankAccountId) : null}
                      onValueChange={(next) =>
                        next && setBankAccountId(Number(next))
                      }
                      items={accountItems}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {operating.length > 0 ? (
                          <SelectGroup>
                            <SelectLabel>
                              {BANK_ACCOUNT_KIND_LABELS.OPERATING}
                            </SelectLabel>
                            {operating.map((account) => (
                              <SelectItem
                                key={account.id}
                                value={String(account.id)}
                              >
                                {formatBankAccountLabel(account)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ) : null}
                        {advances.length > 0 ? (
                          <SelectGroup>
                            <SelectLabel>
                              {BANK_ACCOUNT_KIND_LABELS.ADVANCES}
                            </SelectLabel>
                            {advances.map((account) => (
                              <SelectItem
                                key={account.id}
                                value={String(account.id)}
                              >
                                {formatBankAccountLabel(account)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="commit"
            disabled={
              isPending ||
              !pickupValue ||
              (collectPayment &&
                (!amount || !paymentMethodId || !bankAccountId))
            }
            onClick={handleSubmit}
          >
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Confirmar entrega
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
