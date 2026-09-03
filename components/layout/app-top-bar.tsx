import Link from "next/link";
import { AppTopBarActions } from "@/components/layout/app-top-bar-actions";

type AppTopBarProps = {
  fullName: string | null;
  email: string;
  menuButton?: React.ReactNode;
};

export function AppTopBar({ fullName, email, menuButton }: AppTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-1">
        {menuButton}
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Chumes
        </Link>
      </div>
      <AppTopBarActions fullName={fullName} email={email} />
    </header>
  );
}
