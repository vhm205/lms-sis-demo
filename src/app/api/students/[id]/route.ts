import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await getAuthContext(request);

    if (auth.role === "ANONYMOUS") {
      return NextResponse.json(
        {
          error: "Unauthorized: Yêu cầu quyền Quản trị viên (Admin API Key) hoặc Phụ huynh đã xác thực để xem hồ sơ học sinh.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: true,
        facility: true,
        classes: {
          include: { course: true, teacher: true }
        },
        attendances: {
          include: { schedule: { include: { room: true } } },
          orderBy: { schedule: { date: 'desc' } },
          take: 10
        },
        assignments: {
          orderBy: { date: 'desc' }
        },
        supportRequests: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // If Parent, ensure this student belongs to this parent
    if (auth.isParent && auth.parent && student.parentId !== auth.parent.id) {
      return NextResponse.json({
        error: "Forbidden: Bạn không có quyền xem thông tin của học sinh này.",
        code: "FORBIDDEN_PARENT_ACCESS"
      }, { status: 403 });
    }

    return NextResponse.json({
      role: auth.role,
      data: student,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

