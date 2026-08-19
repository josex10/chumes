import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CustomersPaginationProps = {
  page: number;
  totalPages: number;
  query?: string;
};

function buildHref(page: number, query?: string) {
  const params = new URLSearchParams();
  if (query?.trim()) {
    params.set("q", query.trim());
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `/customers?${qs}` : "/customers";
}

export function CustomersPagination({
  page,
  totalPages,
  query,
}: CustomersPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1, query)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Anterior
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            Anterior
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1, query)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Siguiente
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            Siguiente
          </span>
        )}
      </div>
    </div>
  );
}
