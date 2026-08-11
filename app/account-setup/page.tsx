import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileSetupLoader } from "@/components/profiles/profile-setup-loader";
import { getCurrentProfile } from "@/lib/profiles/get-profile";
import { getProfileStatusCode } from "@/lib/profiles/status";
import { PROFILE_STATUS } from "@/lib/profiles/constants";

export const dynamic = "force-dynamic";

export default async function AccountSetupPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await getCurrentProfile();
  const statusCode = profile ? getProfileStatusCode(profile) : undefined;

  if (statusCode === PROFILE_STATUS.APPROVED) {
    redirect("/dashboard");
  }
  if (statusCode === PROFILE_STATUS.PENDING) {
    redirect("/pending-approval");
  }
  if (statusCode === PROFILE_STATUS.REJECTED) {
    redirect("/access-denied");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center p-8">
      <h1 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Setting up your account
      </h1>
      <div className="mt-8">
        <ProfileSetupLoader />
      </div>
      <div className="mt-10 flex justify-center">
        <SignOutButton>
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    </main>
  );
}
