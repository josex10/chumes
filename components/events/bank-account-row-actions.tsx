"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBankAccountActive } from "@/lib/bank-accounts/actions";
import { Button } from "@/components/ui/button";

type BankAccountRowActionsProps = {
  accountId: number;
  isActive: boolean;
};

export function BankAccountRowActions({
  accountId,
  isActive,
}: BankAccountRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive() {
    startTransition(async () => {
      await toggleBankAccountActive(accountId, !isActive);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleToggleActive}
    >
      {isActive ? "Deshabilitar" : "Activar"}
    </Button>
  );
}
