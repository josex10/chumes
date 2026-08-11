import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Pending approval
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Your account has been created and is pending approval. This usually
        takes 12–24 hours. You will receive access once an administrator
        approves your profile.
      </p>
      <SignOutButton>
        <button
          type="button"
          className="mt-8 w-fit rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Sign out
        </button>
      </SignOutButton>
    </main>
  );
}
