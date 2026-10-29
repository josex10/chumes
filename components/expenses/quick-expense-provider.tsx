"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Receipt } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { createExpense } from "@/lib/expenses/actions";
import type { CompanyPaymentMethod, ExpenseCategory } from "@/lib/supabase/types";

type QuickExpenseContextValue = {
  openQuickExpense: () => void;
};

const QuickExpenseContext = createContext<QuickExpenseContextValue | null>(null);

export function useQuickExpense() {
  const context = useContext(QuickExpenseContext);
  if (!context) {
    throw new Error("useQuickExpense must be used within QuickExpenseProvider");
  }
  return context;
}

type QuickExpenseProviderProps = {
  children: React.ReactNode;
  categories: ExpenseCategory[];
  methods: CompanyPaymentMethod[];
};

export function QuickExpenseProvider({
  children,
  categories,
  methods,
}: QuickExpenseProviderProps) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  const openQuickExpense = useCallback(() => {
    setSession((current) => current + 1);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openQuickExpense }), [openQuickExpense]);

  return (
    <QuickExpenseContext.Provider value={value}>
      {children}

      <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-action-add" />
              Gasto rápido
            </DialogTitle>
            <DialogDescription>
              Categoría, cómo se pagó y el monto. La fecha queda en este momento.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <ExpenseForm
              key={session}
              categories={categories}
              methods={methods}
              submitLabel="Guardar gasto"
              onSubmit={createExpense}
              onSuccess={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {open ? null : (
        <SimpleTooltip
          label="Gasto rápido"
          className="fixed right-6 bottom-[5.25rem] z-40"
        >
          <Button
            type="button"
            variant="add"
            size="icon-lg"
            aria-label="Gasto rápido"
            onClick={openQuickExpense}
            className="size-12 rounded-full shadow-lg"
          >
            <Receipt className="size-5" />
          </Button>
        </SimpleTooltip>
      )}
    </QuickExpenseContext.Provider>
  );
}
