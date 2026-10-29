"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { fromDatetimeLocalValue } from "@/lib/events/format-dates";
import {
  buildExpenseFormSchema,
  companyPaymentMethodFormSchema,
  expenseCategoryFormSchema,
  toCategoryCode,
  type CompanyPaymentMethodFormValues,
  type ExpenseCategoryFormValues,
  type ExpenseFormValues,
} from "@/lib/expenses/schema";
import { roundMoney } from "@/lib/money";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/supabase/db-errors";

type ActionResult = { success: true } | { success: false; error: string };

function revalidateGastos() {
  revalidatePath("/gastos");
}

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Tu sesión expiró. Vuelve a entrar." };
  }
  return { userId };
}

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

async function nextSortOrder(
  table: "expense_categories" | "company_payment_methods",
): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? 0) + 10;
}

async function uniqueCategoryCode(name: string): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const base = toCategoryCode(name);
  let code = base;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from("expense_categories")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (!data) return code;
    code = `${base.slice(0, 36)}_${suffix}`;
    suffix += 1;
  }
}

export async function createExpense(
  values: ExpenseFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { data: categories, error: categoriesError } = await supabase
    .from("expense_categories")
    .select("id, requires_detail, is_active");

  if (categoriesError) {
    console.error("[createExpense]", categoriesError.message);
    return { success: false, error: "No se pudo validar la categoría." };
  }

  const parsed = buildExpenseFormSchema(categories ?? []).safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const category = (categories ?? []).find(
    (item) => item.id === parsed.data.category_id,
  );
  if (!category?.is_active) {
    return { success: false, error: "Esa categoría no está disponible." };
  }

  const { data: method, error: methodError } = await supabase
    .from("company_payment_methods")
    .select("id, is_active")
    .eq("id", parsed.data.payment_method_id)
    .maybeSingle();

  if (methodError || !method?.is_active) {
    return { success: false, error: "Ese método de pago no está disponible." };
  }

  const spentAt = fromDatetimeLocalValue(parsed.data.spent_at);
  if (!spentAt) return { success: false, error: "Fecha inválida" };

  const amount = roundMoney(parsed.data.amount);
  if (amount <= 0) {
    return { success: false, error: "El monto debe ser mayor a cero." };
  }

  const { error } = await supabase.from("expenses").insert({
    category_id: parsed.data.category_id,
    payment_method_id: parsed.data.payment_method_id,
    amount,
    spent_at: spentAt,
    detail: blankToNull(parsed.data.detail),
    created_by: session.userId,
    updated_by: session.userId,
  });

  if (error) {
    console.error("[createExpense]", error.message);
    return { success: false, error: "No se pudo guardar el gasto." };
  }

  revalidateGastos();
  return { success: true };
}

export async function updateExpense(
  id: string,
  values: ExpenseFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("expenses")
    .select("id, category_id, payment_method_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return { success: false, error: "Gasto no encontrado." };
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("expense_categories")
    .select("id, requires_detail, is_active");

  if (categoriesError) {
    return { success: false, error: "No se pudo validar la categoría." };
  }

  const parsed = buildExpenseFormSchema(categories ?? []).safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const category = (categories ?? []).find(
    (item) => item.id === parsed.data.category_id,
  );
  if (!category || (!category.is_active && category.id !== existing.category_id)) {
    return { success: false, error: "Esa categoría no está disponible." };
  }

  const { data: method } = await supabase
    .from("company_payment_methods")
    .select("id, is_active")
    .eq("id", parsed.data.payment_method_id)
    .maybeSingle();

  if (
    !method ||
    (!method.is_active && method.id !== existing.payment_method_id)
  ) {
    return { success: false, error: "Ese método de pago no está disponible." };
  }

  const spentAt = fromDatetimeLocalValue(parsed.data.spent_at);
  if (!spentAt) return { success: false, error: "Fecha inválida" };

  const amount = roundMoney(parsed.data.amount);
  if (amount <= 0) {
    return { success: false, error: "El monto debe ser mayor a cero." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      category_id: parsed.data.category_id,
      payment_method_id: parsed.data.payment_method_id,
      amount,
      spent_at: spentAt,
      detail: blankToNull(parsed.data.detail),
      updated_by: session.userId,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateExpense]", error.message);
    return { success: false, error: "No se pudo actualizar el gasto." };
  }

  revalidateGastos();
  return { success: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    console.error("[deleteExpense]", error.message);
    return { success: false, error: "No se pudo eliminar el gasto." };
  }

  revalidateGastos();
  return { success: true };
}

export async function createExpenseCategory(
  values: ExpenseCategoryFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = expenseCategoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const sortOrder =
    parsed.data.sort_order > 0
      ? parsed.data.sort_order
      : await nextSortOrder("expense_categories");

  const { error } = await supabase.from("expense_categories").insert({
    code: await uniqueCategoryCode(parsed.data.name),
    name: parsed.data.name.trim(),
    requires_detail: parsed.data.requires_detail,
    is_active: parsed.data.is_active,
    sort_order: sortOrder,
  });

  if (error) {
    console.error("[createExpenseCategory]", error.message);
    return {
      success: false,
      error: isUniqueViolation(error)
        ? "Ya existe una categoría con ese nombre."
        : "No se pudo crear la categoría.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function updateExpenseCategory(
  id: number,
  values: ExpenseCategoryFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = expenseCategoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("expense_categories")
    .update({
      name: parsed.data.name.trim(),
      requires_detail: parsed.data.requires_detail,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateExpenseCategory]", error.message);
    return {
      success: false,
      error: isUniqueViolation(error)
        ? "Ya existe una categoría con ese nombre."
        : "No se pudo actualizar la categoría.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function deleteExpenseCategory(id: number): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("expense_categories").delete().eq("id", id);

  if (error) {
    console.error("[deleteExpenseCategory]", error.message);
    return {
      success: false,
      error: isForeignKeyViolation(error)
        ? "Esta categoría ya tiene gastos. Desactívala para ocultarla."
        : "No se pudo eliminar la categoría.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function createCompanyPaymentMethod(
  values: CompanyPaymentMethodFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = companyPaymentMethodFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const sortOrder =
    parsed.data.sort_order > 0
      ? parsed.data.sort_order
      : await nextSortOrder("company_payment_methods");

  const { error } = await supabase.from("company_payment_methods").insert({
    name: parsed.data.name.trim(),
    is_active: parsed.data.is_active,
    sort_order: sortOrder,
  });

  if (error) {
    console.error("[createCompanyPaymentMethod]", error.message);
    return {
      success: false,
      error: isUniqueViolation(error)
        ? "Ya existe un método con ese nombre."
        : "No se pudo crear el método de pago.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function updateCompanyPaymentMethod(
  id: number,
  values: CompanyPaymentMethodFormValues,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const parsed = companyPaymentMethodFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("company_payment_methods")
    .update({
      name: parsed.data.name.trim(),
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCompanyPaymentMethod]", error.message);
    return {
      success: false,
      error: isUniqueViolation(error)
        ? "Ya existe un método con ese nombre."
        : "No se pudo actualizar el método de pago.",
    };
  }

  revalidateGastos();
  return { success: true };
}

export async function deleteCompanyPaymentMethod(
  id: number,
): Promise<ActionResult> {
  const session = await requireUserId();
  if ("error" in session) return { success: false, error: session.error };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("company_payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteCompanyPaymentMethod]", error.message);
    return {
      success: false,
      error: isForeignKeyViolation(error)
        ? "Este método ya se usó. Desactívalo para que no salga en formularios nuevos."
        : "No se pudo eliminar el método de pago.",
    };
  }

  revalidateGastos();
  return { success: true };
}
