import { CustomerForm } from "@/components/customers/customer-form";
import { getCustomerTypes } from "@/lib/customers/queries";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const customerTypes = await getCustomerTypes();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <CustomerForm customerTypes={customerTypes} />
    </main>
  );
}
