"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageCircleMore,
  Package,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Eventos", icon: CalendarDays },
  { href: "/seguimientos", label: "Seguimientos", icon: MessageCircleMore },
  { href: "/logistica", label: "Logística", icon: Truck },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/quotes", label: "Cotizaciones", icon: FileText },
] as const;

type AppSidebarProps = {
  pendingFollowUps?: number;
};

export function AppSidebar({ pendingFollowUps = 0 }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 bg-background">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-muted/50 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.5} />
              {label}
              {href === "/seguimientos" && pendingFollowUps > 0 ? (
                <span className="ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-amber-800 dark:text-amber-300">
                  {pendingFollowUps > 99 ? "99+" : pendingFollowUps}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
