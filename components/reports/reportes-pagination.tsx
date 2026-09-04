import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReportesPaginationProps = {
  page: number;
  totalCount: number;
  pageSize: number;
  hrefFor: (page: number) => string;
};

export function ReportesPagination({
  page,
  totalCount,
  pageSize,
  hrefFor,
}: ReportesPaginationProps) {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {start}–{end} de {totalCount}
        {totalPages > 1 ? ` · Página ${page} de ${totalPages}` : null}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
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
              href={hrefFor(page + 1)}
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
      ) : null}
    </div>
  );
}
