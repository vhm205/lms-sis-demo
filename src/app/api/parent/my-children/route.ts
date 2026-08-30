import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getParentFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const parent = await getParentFromRequest(request);

    if (!parent) {
      return NextResponse.json({ 
        error: "Unauthorized: Không tìm thấy thông tin xác thực phụ huynh (Thiếu Bearer Token hoặc x-parent-phone/id)",
        code: "UNAUTHORIZED_PARENT"
      }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      where: { parentId: parent.id },
      include: {
        facility: true,
        classes: {
          include: {
            course: true,
            teacher: true
          }
        },
        attendances: {
          include: { schedule: { include: { room: true } } },
          orderBy: { schedule: { date: 'desc' } },
          take: 5
        },
        assignments: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json({
      data: {
        parent: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          email: parent.email
        },
        childrenCount: students.length,
        children: students
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
