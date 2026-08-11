import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Chumes Intranet
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Internal platform for rental and sales operations.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          {userId ? (
            <Link
              href="/customers"
              className={cn(
                buttonVariants(),
                "inline-flex h-12 items-center justify-center rounded-full px-8 text-sm",
              )}
            >
              Customers
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants(),
                  "inline-flex h-12 items-center justify-center rounded-full px-8 text-sm",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex h-12 items-center justify-center rounded-full px-8 text-sm",
                )}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
