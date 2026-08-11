import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { PROFILE_STATUS } from "@/lib/profiles/constants";

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type !== "user.created") {
    return new Response("Event ignored", { status: 200 });
  }

  const { id, email_addresses, first_name, last_name } = event.data;
  const email = email_addresses[0]?.email_address;

  if (!email) {
    return new Response("Missing email address", { status: 400 });
  }

  const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
  const supabase = createAdminSupabaseClient();

  const { data: pendingStatus, error: statusError } = await supabase
    .from("profile_statuses")
    .select("id")
    .eq("code", PROFILE_STATUS.PENDING)
    .single();

  if (statusError || !pendingStatus) {
    return new Response("Pending status not found", { status: 500 });
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    clerk_user_id: id,
    email,
    full_name: fullName,
    status_id: pendingStatus.id,
    role_id: null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return new Response("Profile already exists", { status: 200 });
    }
    return new Response(insertError.message, { status: 500 });
  }

  return new Response("Profile created", { status: 201 });
}
