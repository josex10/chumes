"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CategoriesDialog, PaymentMethodsDialog } from "@/components/expenses/catalog-dialogs";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { useQuickExpense } from "@/components/expenses/quick-expense-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteExpense, updateExpense } from "@/lib/expenses/actions";
import { formatSpentAt } from "@/lib/expenses/format";
import { toDatetimeLocalValue } from "@/lib/events/format-dates";
import { formatCurrency } from "@/lib/quotes/format";
import type { ExpenseFormValues } from "@/lib/expenses/schema";
import type {
  CompanyPaymentMethod,
  ExpenseCategory,
  ExpenseWithRelations,
} from "@/lib/supabase/types";

type ExpensesPanelProps = {
  expenses: ExpenseWithRelations[];
  categories: ExpenseCategory[];
  methods: CompanyPaymentMethod[];
  hasWeekExpenses: boolean;
};

function selectable<T extends { id: number; is_active: boolean }>(
  items: T[],
  currentId?: number,
) {
  return items.filter((item) => item.is_active || item.id === currentId);
}

export function ExpensesPanel({
  expenses,
  categories,
  methods,
  hasWeekExpenses,
}: ExpensesPanelProps) {
  const router = useRouter();
  const { openQuickExpense } = useQuickExpense();
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseWithRelations | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseWithRelations | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function expenseToForm(expense: ExpenseWithRelations): ExpenseFormValues {
    return {
      category_id: expense.category_id,
      payment_method_id: expense.payment_method_id,
      amount: expense.amount,
      spent_at: toDatetimeLocalValue(expense.spent_at),
      detail: expense.detail ?? "",
    };
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteExpense(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium">Movimientos de la semana</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setCategoriesOpen(true)}>
            Categorías
          </Button>
          <Button type="button" variant="outline" onClick={() => setMethodsOpen(true)}>
            Métodos de pago
          </Button>
          <Button type="button" variant="add" onClick={openQuickExpense}>
            <Plus className="size-4" />
            Registrar gasto
          </Button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {hasWeekExpenses
              ? "No hay gastos con ese filtro."
              : "No hay gastos esta semana."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl ring-1 ring-border/60">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-base font-medium">{formatCurrency(expense.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.expense_categories.name} · {expense.company_payment_methods.name}
                </p>
                <p className="text-xs text-muted-foreground">{formatSpentAt(expense.spent_at)}</p>
                {expense.detail ? (
                  <p className="mt-1 text-sm">{expense.detail}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(expense)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(expense);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CategoriesDialog
        categories={categories}
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />
      <PaymentMethodsDialog
        methods={methods}
        open={methodsOpen}
        onOpenChange={setMethodsOpen}
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} disablePointerDismissal>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar gasto</DialogTitle>
            <DialogDescription>
              Corrige la fecha, el método, el monto o el detalle.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <ExpenseForm
              key={editing.id}
              categories={selectable(categories, editing.category_id)}
              methods={selectable(methods, editing.payment_method_id)}
              initialValues={expenseToForm(editing)}
              submitLabel="Guardar cambios"
              onSubmit={(values) => updateExpense(editing.id, values)}
              onSuccess={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Se elimina el gasto de ${formatCurrency(deleteTarget.amount)}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" disabled={isPending} onClick={confirmDelete}>
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
