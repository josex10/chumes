import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { EVENT_PHASE } from "@/lib/events/constants";
import { generateReservationPdf } from "@/lib/events/pdf/generate-reservation-pdf";
import { getReservationPdfFilename } from "@/lib/events/pdf/filename";
import { getEventReservationPdfData } from "@/lib/events/queries";
import { getStatusPhase } from "@/lib/events/status-transitions";
import { PROFILE_STATUS } from "@/lib/profiles/constants";
import { getCurrentProfile } from "@/lib/profiles/get-profile";
import { getProfileStatusCode } from "@/lib/profiles/status";

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
  const data = await getEventReservationPdfData(id);

  if (!data) {
    return NextResponse.json(
      { error: "Reserva no encontrada o sin cotización vinculada." },
      { status: 404 },
    );
  }

  if (getStatusPhase(data.event.event_statuses.code) !== EVENT_PHASE.OPERATIONAL) {
    return NextResponse.json(
      { error: "El PDF de reserva solo está disponible en fase operativa." },
      { status: 403 },
    );
  }

  try {
    const pdfBuffer = await generateReservationPdf(data);
    const filename = getReservationPdfFilename(data);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/events/[id]/reservation/pdf]", error);
    return NextResponse.json(
      { error: "Could not generate PDF" },
      { status: 500 },
    );
  }
}
