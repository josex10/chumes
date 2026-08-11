import Link from "next/link";
import { getCustomers } from "@/lib/customers/queries";
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

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-2 text-muted-foreground">
            Manage customer records for Chumes operations.
          </p>
        </div>
        <Link href="/customers/new" className={cn(buttonVariants())}>
          New customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">No customers yet.</p>
          <Link
            href="/customers/new"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
          >
            Add your first customer
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Identification</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.identification ?? "—"}</TableCell>
                  <TableCell>{customer.customer_types.name}</TableCell>
                  <TableCell>{customer.email ?? "—"}</TableCell>
                  <TableCell>{customer.phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
