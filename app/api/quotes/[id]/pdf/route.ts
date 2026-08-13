import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PROFILE_STATUS } from "@/lib/profiles/constants";
import { getCurrentProfile } from "@/lib/profiles/get-profile";
import { getProfileStatusCode } from "@/lib/profiles/status";
import { getQuotePdfFilename } from "@/lib/quotes/pdf/filename";
import { generateQuotePdf } from "@/lib/quotes/pdf/generate-quote-pdf";
import { getQuoteById } from "@/lib/quotes/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentProfile();

  if (!profile || getProfileStatusCode(profile) !== PROFILE_STATUS.APPROVED) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const quote = await getQuoteById(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  try {
    const pdfBuffer = await generateQuotePdf(quote);
    const filename = getQuotePdfFilename(quote);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/quotes/[id]/pdf]", error);
    return NextResponse.json(
      { error: "Could not generate PDF" },
      { status: 500 },
    );
  }
}
