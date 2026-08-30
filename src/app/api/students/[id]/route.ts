import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getParentFromRequest } from "@/lib/auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const authenticatedParent = await getParentFromRequest(request);

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

    // If request comes with Parent Identity, ensure this student belongs to that parent!
    if (authenticatedParent && student.parentId !== authenticatedParent.id) {
      return NextResponse.json({
        error: "Forbidden: Bạn không có quyền xem thông tin của học sinh này.",
        code: "FORBIDDEN_PARENT_ACCESS"
      }, { status: 403 });
    }

    return NextResponse.json({ data: student });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

