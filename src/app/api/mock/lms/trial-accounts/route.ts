import { NextRequest, NextResponse } from "next/server";
import { provisionTrialAccount } from "@/lib/lms-simulator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const result = await provisionTrialAccount({
      name: body.name || body.student_name || "Học viên Học thử",
      phone: body.phone,
      courseId: body.course_id || body.courseId,
      facilityId: body.facility_id || body.facilityId,
      trialDays: typeof body.trial_days === "number" ? body.trial_days : 7,
      notes: body.notes,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[LMS Trial Provisioning Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to provision trial account",
      },
      { status: 500 }
    );
  }
}
