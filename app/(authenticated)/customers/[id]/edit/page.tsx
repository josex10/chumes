import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { getCustomerById, getCustomerTypes } from "@/lib/customers/queries";

export const dynamic = "force-dynamic";

type EditCustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const [customer, customerTypes] = await Promise.all([
    getCustomerById(id),
    getCustomerTypes(),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <CustomerForm customer={customer} customerTypes={customerTypes} />
    </main>
  );
}
