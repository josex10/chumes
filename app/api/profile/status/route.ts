import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/profiles/get-profile";
import { getProfileStatusCode } from "@/lib/profiles/status";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ status: null });
  }

  return NextResponse.json({
    status: getProfileStatusCode(profile) ?? null,
  });
}
