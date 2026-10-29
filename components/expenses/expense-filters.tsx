import Link from "next/link";
import { gastosHref } from "@/lib/expenses/format";
import { cn } from "@/lib/utils";
import type { CompanyPaymentMethod, ExpenseCategory } from "@/lib/supabase/types";

type ExpenseFiltersProps = {
  week: string | null;
  categories: ExpenseCategory[];
  methods: CompanyPaymentMethod[];
  categoryId: number | null;
  methodId: number | null;
};

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-3 py-1 text-sm transition-colors",
    active
      ? "bg-foreground text-background"
      : "bg-muted text-muted-foreground hover:text-foreground",
  );
}

export function ExpenseFilters({
  week,
  categories,
  methods,
  categoryId,
  methodId,
}: ExpenseFiltersProps) {
  const visibleCategories = categories.filter(
    (category) => category.is_active || category.id === categoryId,
  );
  const visibleMethods = methods.filter(
    (method) => method.is_active || method.id === methodId,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Link
          href={gastosHref({ week, method: methodId })}
          className={chipClass(categoryId === null)}
        >
          Todas
        </Link>
        {visibleCategories.map((category) => (
          <Link
            key={category.id}
            href={gastosHref({
              week,
              category: category.id,
              method: methodId,
            })}
            className={chipClass(categoryId === category.id)}
          >
            {category.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={gastosHref({ week, category: categoryId })}
          className={chipClass(methodId === null)}
        >
          Todos los métodos
        </Link>
        {visibleMethods.map((method) => (
          <Link
            key={method.id}
            href={gastosHref({
              week,
              category: categoryId,
              method: method.id,
            })}
            className={chipClass(methodId === method.id)}
          >
            {method.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
