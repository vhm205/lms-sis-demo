import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getParentFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, type, content, priority } = body;

    if (!studentId || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authenticatedParent = await getParentFromRequest(request);
    if (authenticatedParent) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student || student.parentId !== authenticatedParent.id) {
        return NextResponse.json({
          error: "Forbidden: Bạn không có quyền gửi yêu cầu cho học sinh này.",
          code: "FORBIDDEN_PARENT_ACCESS"
        }, { status: 403 });
      }
    }

    const req = await prisma.supportRequest.create({
      data: {
        studentId,
        type,
        content,
        priority: priority || "NORMAL",
        status: "NEW"
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_SUPPORT_REQUEST",
        entityType: "SupportRequest",
        entityId: req.id,
        details: JSON.stringify(body),
        source: "API"
      }
    });

    return NextResponse.json({ data: req });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
