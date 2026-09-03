"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: React.ReactNode;
  fullName: string | null;
  email: string;
  pendingFollowUps?: number;
};

export function AppShell({
  children,
  fullName,
  email,
  pendingFollowUps = 0,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppTopBar
        fullName={fullName}
        email={email}
        menuButton={
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={mobileNavOpen}
            aria-controls="app-mobile-nav"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-4" strokeWidth={1.5} />
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1">
        <AppSidebar
          pendingFollowUps={pendingFollowUps}
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
