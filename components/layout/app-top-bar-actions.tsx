"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

type AppTopBarActionsProps = {
  fullName: string | null;
  email: string;
};

function getInitials(fullName: string | null, email: string): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function AppTopBarActions({ fullName, email }: AppTopBarActionsProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = fullName?.trim() || email;
  const initials = getInitials(fullName, email);

  return (
    <div className="flex items-center gap-3">
      <time
        className="hidden tabular-nums text-sm text-muted-foreground sm:block"
        dateTime={now?.toISOString()}
      >
        {now ? formatClock(now) : "--:--:--"}
      </time>

      <ThemeToggle />

      <div className="flex items-center gap-2.5 border-l border-border/60 pl-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {initials}
        </div>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-medium leading-none">{displayName}</p>
          {fullName?.trim() ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </div>

      <SignOutButton>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground"
          aria-label="Cerrar sesión"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
        </Button>
      </SignOutButton>
    </div>
  );
}
