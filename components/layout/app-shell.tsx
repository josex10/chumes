import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";

type AppShellProps = {
  children: React.ReactNode;
  fullName: string | null;
  email: string;
};

export function AppShell({ children, fullName, email }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <AppTopBar fullName={fullName} email={email} />
      <div className="flex flex-1">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
