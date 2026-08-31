import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const auth = await getAuthContext(request);

    if (auth.role === "ANONYMOUS") {
      return NextResponse.json(
        {
          error: "Unauthorized: Yêu cầu quyền Quản trị viên (Admin API Key) hoặc Phụ huynh đã đăng nhập để tìm kiếm học sinh.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const whereClause: any = {
      OR: [
        { name: { contains: query } },
        { code: { contains: query } },
        { phone: { contains: query } },
        { parent: { phone: { contains: query } } },
        { parent: { name: { contains: query } } },
      ],
    };

    // If Parent, restrict search strictly to their own children
    if (auth.isParent && auth.parent) {
      whereClause.parentId = auth.parent.id;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        parent: true,
        facility: true,
        classes: {
          include: { course: true },
        },
      },
      take: 20,
    });

    return NextResponse.json({
      role: auth.role,
      count: students.length,
      data: students,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
