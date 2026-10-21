import { NextRequest, NextResponse } from "next/server";
import {
  getStudentEntitlements,
  listAllEntitlements,
  issueEntitlement,
  forceExpireEntitlement,
  renewEntitlement,
} from "@/lib/entitlement";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("studentId");
    const studentCodeParam = searchParams.get("studentCode");

    if (studentIdParam || studentCodeParam) {
      let resolvedStudentId: string | null | undefined = studentIdParam;
      if (!resolvedStudentId && studentCodeParam) {
        const student = await prisma.student.findUnique({
          where: { code: studentCodeParam },
        });
        resolvedStudentId = student?.id;
      }

      if (!resolvedStudentId) {
        return NextResponse.json(
          { success: false, error: "Học viên không tồn tại" },
          { status: 404 }
        );
      }

      const entitlements = await getStudentEntitlements(resolvedStudentId);
      return NextResponse.json({ success: true, entitlements });
    }

    // Default: list all entitlements
    const entitlements = await listAllEntitlements(100);
    return NextResponse.json({ success: true, entitlements });
  } catch (error: any) {
    console.error("[Entitlements API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch entitlements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "expire") {
      if (!body.id) {
        return NextResponse.json({ success: false, error: "Missing entitlement id" }, { status: 400 });
      }
      const updated = await forceExpireEntitlement(body.id);
      return NextResponse.json({ success: true, entitlement: updated });
    }

    if (action === "renew") {
      if (!body.id) {
        return NextResponse.json({ success: false, error: "Missing entitlement id" }, { status: 400 });
      }
      const days = typeof body.additionalDays === "number" ? body.additionalDays : 30;
      const updated = await renewEntitlement(body.id, days);
      return NextResponse.json({ success: true, entitlement: updated });
    }

    if (action === "issue") {
      if (!body.studentId || !body.courseId) {
        return NextResponse.json(
          { success: false, error: "Missing studentId or courseId" },
          { status: 400 }
        );
      }
      const created = await issueEntitlement({
        studentId: body.studentId,
        courseId: body.courseId,
        orderId: body.orderId,
        type: body.type || "OFFICIAL",
        durationDays: body.durationDays,
        source: body.source || "MANUAL_API",
        notes: body.notes,
      });
      return NextResponse.json({ success: true, entitlement: created });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: 'issue', 'expire', 'renew'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Entitlements POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process entitlement action" },
      { status: 500 }
    );
  }
}
