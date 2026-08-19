import Link from "next/link";
import { Suspense } from "react";
import { CUSTOMER_LIST_PAGE_SIZE } from "@/lib/customers/constants";
import { searchCustomers } from "@/lib/customers/queries";
import { CustomersPagination } from "@/components/customers/customers-pagination";
import { CustomersToolbar } from "@/components/customers/customers-toolbar";
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

type CustomersPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await searchCustomers({
    query: q,
    page,
    pageSize: CUSTOMER_LIST_PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / CUSTOMER_LIST_PAGE_SIZE));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-2 text-muted-foreground">
            Administra los clientes de Chumes.
          </p>
        </div>
        <Link href="/customers/new" className={cn(buttonVariants({ variant: "add" }))}>
          Nuevo cliente
        </Link>
      </div>

      <Suspense fallback={<div className="h-8 max-w-md rounded-md bg-muted" />}>
        <CustomersToolbar initialQuery={q} />
      </Suspense>

      {result.customers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            {q.trim()
              ? `No se encontraron clientes para "${q.trim()}".`
              : "Aún no hay clientes."}
          </p>
          {!q.trim() && (
            <Link
              href="/customers/new"
              className={cn(buttonVariants({ variant: "add" }), "mt-4 inline-flex")}
            >
              Agregar primer cliente
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.identification ?? "—"}</TableCell>
                    <TableCell>{customer.customer_types.name}</TableCell>
                    <TableCell>{customer.email ?? "—"}</TableCell>
                    <TableCell>{customer.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${customer.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                          )}
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                          )}
                        >
                          Editar
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <CustomersPagination page={page} totalPages={totalPages} query={q} />
        </>
      )}
    </main>
  );
}
