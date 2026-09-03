"use client";

import { useEffect } from "react";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function isNavActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

function SidebarNav({
  pendingFollowUps,
  onNavigate,
  className,
}: {
  pendingFollowUps: number;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 p-4", className)}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = isNavActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
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
  );
}

export function AppSidebar({
  pendingFollowUps = 0,
  mobileOpen,
  onMobileOpenChange,
}: AppSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function handleChange() {
      if (media.matches) {
        onMobileOpenChange(false);
      }
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMobileOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, onMobileOpenChange]);

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
        <SidebarNav pendingFollowUps={pendingFollowUps} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 animate-in bg-black/40 fade-in duration-200"
            aria-label="Cerrar menú"
            onClick={() => onMobileOpenChange(false)}
          />
          <aside
            id="app-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-mobile-nav-title"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-in flex-col bg-background shadow-lg slide-in-from-left duration-200"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4">
              <h2
                id="app-mobile-nav-title"
                className="text-sm font-medium"
              >
                Menú
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8"
                aria-label="Cerrar menú"
                onClick={() => onMobileOpenChange(false)}
              >
                <X className="size-4" strokeWidth={1.5} />
              </Button>
            </div>
            <SidebarNav
              pendingFollowUps={pendingFollowUps}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
