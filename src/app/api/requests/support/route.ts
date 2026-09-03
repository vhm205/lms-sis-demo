import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);

    if (auth.role === "ANONYMOUS") {
      return NextResponse.json(
        {
          error: "Unauthorized: Yêu cầu quyền Quản trị viên (Admin API Key) hoặc Phụ huynh đã xác thực để gửi yêu cầu hỗ trợ.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, type, content, priority } = body;

    if (!studentId || !type || !content) {
      return NextResponse.json({ error: "Missing required fields (studentId, type, content)" }, { status: 400 });
    }

    if (auth.isParent && auth.parent) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student || student.parentId !== auth.parent.id) {
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

    try {
      revalidatePath("/requests");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ data: req });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
