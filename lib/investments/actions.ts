"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { fromDatetimeLocalValue } from "@/lib/events/format-dates";
import {
  creditorFormSchema,
  investmentFormSchema,
  investmentPaymentFormSchema,
  type CreditorFormValues,
  type InvestmentFormValues,
  type InvestmentPaymentFormValues,
} from "@/lib/investments/schema";
import { remainingMoney, roundMoney, sumMoney } from "@/lib/money";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/supabase/db-errors";
import type { InvestmentStatus } from "@/lib/supabase/types";

type ActionResult = { success: true } | { success: false; error: string };

function revalidateGastos() {
  revalidatePath("/gastos");
}

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const { userId } = await auth();
  if (!userId) return { error: "Tu sesión expiró. Vuelve a entrar." };
  return { userId };
}

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

type PaymentSnapshot = { id: string; amount: number };

async function loadInvestmentMoney(investmentId: string): Promise<
  | {
      amount: number;
      payments: PaymentSnapshot[];
      paid: number;
      remaining: number;
      status: InvestmentStatus;
    }
  | null
> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("investments")
    .select("amount, status, investment_payments(id, amount)")
    .eq("id", investmentId)
    .maybeSingle();

  if (error || !data) return null;

  const payments = (data.investment_payments ?? []).map((payment) => ({
    id: payment.id,
    amount: roundMoney(Number(payment.amount)),
  }));
  const amount = roundMoney(Number(data.amount));
  const paid = sumMoney(payments.map((payment) => payment.amount));

  return {
    amount,
    payments,
    paid,
    remaining: remainingMoney(amount, paid),
    status: data.status,
  };
}

async function syncInvestmentStatus(
  investmentId: string,
  userId: string,
): Promise<ActionResult | null> {
  const snapshot = await loadInvestmentMoney(investmentId);
  if (!snapshot) return { success: false, error: "Inversión no encontrada." };

  const status: InvestmentStatus = snapshot.remaining === 0 ? "SETTLED" : "OPEN";
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("investments")
    .update({ status, updated_by: userId })
    .eq("id", investmentId);

  if (error) {
    console.error("[syncInvestmentStatus]", error.message);
    return { success: false, error: "No se pudo actualizar el saldo de la inversión." };
  }

  return null;
}

async function assertPaymentMethod(
  paymentMethodId: number,
  allowedInactiveId?: number,
): Promise<ActionResult | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("company_payment_methods")
    .select("id, is_active")
    .eq("id", paymentMethodId)
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Ese método de pago no está disponible." };
  }

  if (!data.is_active && data.id !== allowedInactiveId) {
    return { success: false, error: "Ese método de pago no está disponible." };
  }

  return null;
}

export async function createCreditor(
  values: CreditorFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = creditorFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("investment_creditors").insert({
    name: parsed.data.name.trim(),
    is_active: parsed.data.is_active,
  });

  if (error) {
    console.error("[createCreditor]", error.message);
    return {
      success: false,
      error: isUniqueViolation(error)
        ? "Ya existe una persona con ese nombre."
        : "No se pudo guardar la persona.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function updateCreditor(
  id: number,
  values: CreditorFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = creditorFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("investment_creditors")
    .update({
      name: parsed.data.name.trim(),
      is_active: parsed.data.is_active,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCreditor]", error.message);
    return {
      success: false,
      error: isUniqueViolation(error)
        ? "Ya existe una persona con ese nombre."
        : "No se pudo actualizar la persona.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function deleteCreditor(id: number): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("investment_creditors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteCreditor]", error.message);
    return {
      success: false,
      error: isForeignKeyViolation(error)
        ? "Esta persona ya tiene inversiones. Desactívala para ocultarla."
        : "No se pudo eliminar la persona.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function createInvestment(
  values: InvestmentFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = investmentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const amount = roundMoney(parsed.data.amount);
  if (amount <= 0) {
    return { success: false, error: "El monto debe ser mayor a cero." };
  }

  const supabase = createAdminSupabaseClient();
  const { data: creditor } = await supabase
    .from("investment_creditors")
    .select("id, is_active")
    .eq("id", parsed.data.creditor_id)
    .maybeSingle();

  if (!creditor?.is_active) {
    return { success: false, error: "Selecciona una persona activa." };
  }

  const { error } = await supabase.from("investments").insert({
    creditor_id: parsed.data.creditor_id,
    title: parsed.data.title.trim(),
    amount: roundMoney(parsed.data.amount),
    invested_on: parsed.data.invested_on,
    status: "OPEN",
    notes: blankToNull(parsed.data.notes),
    created_by: session.userId,
    updated_by: session.userId,
  });

  if (error) {
    console.error("[createInvestment]", error.message);
    return { success: false, error: "No se pudo crear la inversión." };
  }

  revalidateGastos();
  return { success: true };
}

export async function updateInvestment(
  id: string,
  values: InvestmentFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = investmentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const snapshot = await loadInvestmentMoney(id);
  if (!snapshot) return { success: false, error: "Inversión no encontrada." };

  const amount = roundMoney(parsed.data.amount);
  if (amount < snapshot.paid) {
    return {
      success: false,
      error: "El monto no puede ser menor a lo ya abonado.",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: current } = await supabase
    .from("investments")
    .select("creditor_id")
    .eq("id", id)
    .maybeSingle();
  const { data: creditor } = await supabase
    .from("investment_creditors")
    .select("id, is_active")
    .eq("id", parsed.data.creditor_id)
    .maybeSingle();

  if (!creditor || (!creditor.is_active && creditor.id !== current?.creditor_id)) {
    return { success: false, error: "Selecciona una persona activa." };
  }

  const status: InvestmentStatus =
    remainingMoney(amount, snapshot.paid) === 0 ? "SETTLED" : "OPEN";

  const { error } = await supabase
    .from("investments")
    .update({
      creditor_id: parsed.data.creditor_id,
      title: parsed.data.title.trim(),
      amount,
      invested_on: parsed.data.invested_on,
      status,
      notes: blankToNull(parsed.data.notes),
      updated_by: session.userId,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateInvestment]", error.message);
    return { success: false, error: "No se pudo actualizar la inversión." };
  }

  revalidateGastos();
  return { success: true };
}

export async function deleteInvestment(id: string): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("investments").delete().eq("id", id);

  if (error) {
    console.error("[deleteInvestment]", error.message);
    return { success: false, error: "No se pudo eliminar la inversión." };
  }

  revalidateGastos();
  return { success: true };
}

export async function createInvestmentPayment(
  investmentId: string,
  values: InvestmentPaymentFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = investmentPaymentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const snapshot = await loadInvestmentMoney(investmentId);
  if (!snapshot) return { success: false, error: "Inversión no encontrada." };
  if (snapshot.remaining === 0) {
    return { success: false, error: "Esta inversión ya está completada." };
  }

  const amount = roundMoney(parsed.data.amount);
  if (amount <= 0) {
    return { success: false, error: "El monto debe ser mayor a cero." };
  }
  if (amount > snapshot.remaining) {
    return {
      success: false,
      error: "El abono no puede ser mayor al saldo pendiente.",
    };
  }

  const methodError = await assertPaymentMethod(parsed.data.payment_method_id);
  if (methodError) return methodError;

  const paidAt = fromDatetimeLocalValue(parsed.data.paid_at);
  if (!paidAt) return { success: false, error: "Fecha inválida" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("investment_payments").insert({
    investment_id: investmentId,
    payment_method_id: parsed.data.payment_method_id,
    amount,
    paid_at: paidAt,
    notes: blankToNull(parsed.data.notes),
    created_by: session.userId,
    updated_by: session.userId,
  });

  if (error) {
    console.error("[createInvestmentPayment]", error.message);
    return { success: false, error: "No se pudo registrar el abono." };
  }

  const statusError = await syncInvestmentStatus(investmentId, session.userId);
  if (statusError) return statusError;

  revalidateGastos();
  return { success: true };
}

export async function updateInvestmentPayment(
  paymentId: string,
  values: InvestmentPaymentFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = investmentPaymentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: payment, error: paymentError } = await supabase
    .from("investment_payments")
    .select("id, investment_id, payment_method_id, amount")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !payment) {
    return { success: false, error: "Abono no encontrado." };
  }

  const snapshot = await loadInvestmentMoney(payment.investment_id);
  if (!snapshot) return { success: false, error: "Inversión no encontrada." };

  const othersPaid = sumMoney(
    snapshot.payments
      .filter((item) => item.id !== paymentId)
      .map((item) => item.amount),
  );
  const available = remainingMoney(snapshot.amount, othersPaid);
  const amount = roundMoney(parsed.data.amount);
  if (amount <= 0) {
    return { success: false, error: "El monto debe ser mayor a cero." };
  }
  if (amount > available) {
    return {
      success: false,
      error: "El abono no puede ser mayor al saldo pendiente.",
    };
  }

  const methodError = await assertPaymentMethod(
    parsed.data.payment_method_id,
    payment.payment_method_id,
  );
  if (methodError) return methodError;

  const paidAt = fromDatetimeLocalValue(parsed.data.paid_at);
  if (!paidAt) return { success: false, error: "Fecha inválida" };

  const { error } = await supabase
    .from("investment_payments")
    .update({
      payment_method_id: parsed.data.payment_method_id,
      amount,
      paid_at: paidAt,
      notes: blankToNull(parsed.data.notes),
      updated_by: session.userId,
    })
    .eq("id", paymentId);

  if (error) {
    console.error("[updateInvestmentPayment]", error.message);
    return { success: false, error: "No se pudo actualizar el abono." };
  }

  const statusError = await syncInvestmentStatus(payment.investment_id, session.userId);
  if (statusError) return statusError;

  revalidateGastos();
  return { success: true };
}

export async function deleteInvestmentPayment(
  paymentId: string,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { data: payment, error: paymentError } = await supabase
    .from("investment_payments")
    .select("id, investment_id")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !payment) {
    return { success: false, error: "Abono no encontrado." };
  }

  const { error } = await supabase
    .from("investment_payments")
    .delete()
    .eq("id", paymentId);

  if (error) {
    console.error("[deleteInvestmentPayment]", error.message);
    return { success: false, error: "No se pudo eliminar el abono." };
  }

  const statusError = await syncInvestmentStatus(payment.investment_id, session.userId);
  if (statusError) return statusError;

  revalidateGastos();
  return { success: true };
}
