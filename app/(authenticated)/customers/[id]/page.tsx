import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerDetailInfo } from "@/components/customers/customer-detail-info";
import { CustomerRelatedColumns } from "@/components/customers/customer-related-columns";
import { getCustomerById } from "@/lib/customers/queries";
import { getEventsByCustomerId } from "@/lib/events/queries";
import { getLinkableQuotesForCustomer } from "@/lib/quotes/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const [events, quotes] = await Promise.all([
    getEventsByCustomerId(id),
    getLinkableQuotesForCustomer(id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/customers"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver a clientes
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {customer.name}
          </h1>
        </div>
        <Link
          href={`/customers/${customer.id}/edit`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Editar cliente
        </Link>
      </div>

      <CustomerDetailInfo customer={customer} />
      <CustomerRelatedColumns events={events} quotes={quotes} />
    </main>
  );
}
