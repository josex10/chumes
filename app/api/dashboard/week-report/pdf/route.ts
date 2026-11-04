import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateWeekReportPdf, getWeekReportPdfFilename } from "@/lib/dashboard/pdf/generate-week-report-pdf";
import { getWeekBounds, parseWeekKey } from "@/lib/dashboard/stats";
import { buildWeekReport } from "@/lib/dashboard/week-report";
import { getExpensesBetween } from "@/lib/expenses/queries";
import { getEventsByEventDateBetween } from "@/lib/events/queries";
import { PROFILE_STATUS } from "@/lib/profiles/constants";
import { getCurrentProfile } from "@/lib/profiles/get-profile";
import { getProfileStatusCode } from "@/lib/profiles/status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function referenceFromWeek(week: string | null): Date | null {
  if (!week) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) return null;
  const date = parseWeekKey(week);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentProfile();

  if (!profile || getProfileStatusCode(profile) !== PROFILE_STATUS.APPROVED) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const week = new URL(request.url).searchParams.get("week");
  const reference = referenceFromWeek(week);

  if (!reference) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const { start, end } = getWeekBounds(reference);

  try {
    const [events, expenses] = await Promise.all([
      getEventsByEventDateBetween(start, end, { includeWonArchived: true }),
      getExpensesBetween(start, end),
    ]);
    const report = buildWeekReport({ reference, events, expenses });
    const pdfBuffer = await generateWeekReportPdf(report);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${getWeekReportPdfFilename(report.weekKey)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/week-report/pdf]", error);
    return NextResponse.json({ error: "Could not generate PDF" }, { status: 500 });
  }
}
