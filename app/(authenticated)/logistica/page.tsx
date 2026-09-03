import { Truck } from "lucide-react";
import { EventsHint } from "@/components/events/events-hint";
import { LogisticsBoard } from "@/components/logistics/logistics-board";
import { LogisticsTabs } from "@/components/logistics/logistics-tabs";
import { LogisticsWindowFilter } from "@/components/logistics/logistics-window-filter";
import { getBankAccounts } from "@/lib/bank-accounts/queries";
import {
  LOGISTICS_TAB,
  parseLogisticsTab,
  parseLogisticsWindow,
} from "@/lib/logistics/constants";
import { getLogisticsQueue } from "@/lib/logistics/queries";
import { getPaymentMethods } from "@/lib/payments/queries";

export const dynamic = "force-dynamic";

type LogisticsPageProps = {
  searchParams: Promise<{
    tab?: string;
    window?: string;
  }>;
};

const HINT =
  "Bodega alista y marca los 5 checks. Cuando está lista para instalar, el pedido aparece en Instalaciones. Al confirmar la entrega, pasa a Retirada.";

const EMPTY_LABELS = {
  [LOGISTICS_TAB.WAREHOUSE]:
    "No hay pedidos para alistar en esta ventana. Los vencidos siguen apareciendo aquí.",
  [LOGISTICS_TAB.DELIVERY]:
    "No hay pedidos listos para instalar. Completá el alistado en Bodega para que aparezcan aquí.",
  [LOGISTICS_TAB.PICKUP]:
    "No hay retiros pendientes en esta ventana. Los vencidos siguen apareciendo aquí.",
};

export default async function LogisticsPage({
  searchParams,
}: LogisticsPageProps) {
  const { tab: tabParam, window: windowParam } = await searchParams;
  const tab = parseLogisticsTab(tabParam);
  const window = parseLogisticsWindow(windowParam);

  const [queue, paymentMethods, bankAccounts] = await Promise.all([
    getLogisticsQueue(window),
    getPaymentMethods(),
    getBankAccounts(),
  ]);

  const items =
    tab === LOGISTICS_TAB.DELIVERY
      ? queue.delivery
      : tab === LOGISTICS_TAB.PICKUP
        ? queue.pickup
        : queue.warehouse;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight">
          <Truck className="size-7 text-muted-foreground" />
          Logística
          <EventsHint description={HINT} />
        </h1>
        <LogisticsWindowFilter activeTab={tab} activeWindow={window} />
      </div>

      <LogisticsTabs
        activeTab={tab}
        window={window}
        counts={{
          warehouse: queue.warehouse.length,
          delivery: queue.delivery.length,
          pickup: queue.pickup.length,
        }}
      />

      <LogisticsBoard
        items={items}
        emptyLabel={EMPTY_LABELS[tab]}
        paymentMethods={paymentMethods}
        bankAccounts={bankAccounts}
      />
    </main>
  );
}
