import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            leads: true,
            orders: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ facilities });
  } catch (error: any) {
    console.error("Fetch facilities error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
