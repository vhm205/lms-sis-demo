import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
          { phone: { contains: query } },
          { parent: { phone: { contains: query } } },
          { parent: { name: { contains: query } } }
        ],
      },
      include: {
        parent: true,
        facility: true
      },
      take: 20
    });

    return NextResponse.json({ data: students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
