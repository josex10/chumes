import Link from "next/link";
import { AppTopBarActions } from "@/components/layout/app-top-bar-actions";

type AppTopBarProps = {
  fullName: string | null;
  email: string;
};

export function AppTopBar({ fullName, email }: AppTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background px-6">
      <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
        Chumes
      </Link>
      <AppTopBarActions fullName={fullName} email={email} />
    </header>
  );
}
