import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profiles/get-profile";
import { getProfileStatusCode } from "@/lib/profiles/status";
import { PROFILE_STATUS } from "@/lib/profiles/constants";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/account-setup");
  }

  const statusCode = getProfileStatusCode(profile);

  if (statusCode === PROFILE_STATUS.PENDING) {
    redirect("/pending-approval");
  }

  if (statusCode === PROFILE_STATUS.REJECTED) {
    redirect("/access-denied");
  }

  if (statusCode === PROFILE_STATUS.APPROVED) {
    redirect("/dashboard");
  }

  redirect("/account-setup");
}
