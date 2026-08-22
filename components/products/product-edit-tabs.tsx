import Link from "next/link";
import {
  BUNDLE_PRODUCT_TABS,
  PRODUCT_EDIT_TAB,
  SIMPLE_PRODUCT_TABS,
  type ProductEditTab,
} from "@/lib/products/constants";
import { cn } from "@/lib/utils";

type ProductEditTabsProps = {
  productId: string;
  activeTab: ProductEditTab;
  isBundle: boolean;
};

export function ProductEditTabs({
  productId,
  activeTab,
  isBundle,
}: ProductEditTabsProps) {
  const tabs = isBundle ? BUNDLE_PRODUCT_TABS : SIMPLE_PRODUCT_TABS;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60">
      {tabs.map((tab) => {
        const href = `/products/${productId}/edit?tab=${tab.id}`;
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function parseProductEditTab(
  tab: string | undefined,
  isBundle: boolean,
): ProductEditTab {
  if (tab === "pricing") {
    return PRODUCT_EDIT_TAB.GENERAL;
  }

  const validTabs = isBundle ? BUNDLE_PRODUCT_TABS : SIMPLE_PRODUCT_TABS;
  const match = validTabs.find((entry) => entry.id === tab);
  return match?.id ?? PRODUCT_EDIT_TAB.GENERAL;
}
