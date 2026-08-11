"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PROFILE_STATUS, type ProfileStatusCode } from "@/lib/profiles/constants";

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 20;

type ProfileStatusResponse = {
  status: ProfileStatusCode | null;
};

function getRedirectPath(status: ProfileStatusCode): string {
  switch (status) {
    case PROFILE_STATUS.APPROVED:
      return "/dashboard";
    case PROFILE_STATUS.PENDING:
      return "/pending-approval";
    case PROFILE_STATUS.REJECTED:
      return "/access-denied";
    default:
      return "/account-setup";
  }
}

export function ProfileSetupLoader() {
  const router = useRouter();
  const [message, setMessage] = useState("Creating your account...");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    async function poll() {
      while (attempts < MAX_ATTEMPTS && !cancelled) {
        attempts += 1;

        try {
          const response = await fetch("/api/profile/status");
          if (!response.ok) {
            throw new Error("Failed to check profile status");
          }

          const data = (await response.json()) as ProfileStatusResponse;

          if (data.status) {
            router.replace(getRedirectPath(data.status));
            return;
          }
        } catch {
          if (!cancelled) {
            setMessage("Still setting up your account...");
          }
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!cancelled) {
        setTimedOut(true);
        setMessage(
          "This is taking longer than expected. Please refresh the page or contact an administrator.",
        );
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center text-center">
      {!timedOut && (
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"
          aria-hidden="true"
        />
      )}
      <p className="mt-6 text-zinc-600 dark:text-zinc-400">{message}</p>
      {timedOut && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Refresh page
        </button>
      )}
    </div>
  );
}
