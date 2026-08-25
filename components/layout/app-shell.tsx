import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";

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
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppTopBar fullName={fullName} email={email} />
      <div className="flex min-h-0 flex-1">
        <AppSidebar pendingFollowUps={pendingFollowUps} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
