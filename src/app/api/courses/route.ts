import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ACTIVE";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const whereCondition: any = {};
    if (status !== "ALL") {
      whereCondition.status = status;
    }

    const courses = await prisma.course.findMany({
      where: whereCondition,
      orderBy: { id: "desc" },
      take: limit > 0 ? limit : undefined,
    });

    // Format as products for Orchexa / POS catalog sync compatibility
    const products = courses.map((course) => ({
      id: course.id,
      sku: course.code,
      product_code: course.code,
      title: course.name,
      name: course.name,
      type: course.type,
      duration: course.duration,
      duration_label: `${course.duration} buổi`,
      price: course.fee || 0,
      fee: course.fee || 0,
      target_age: course.targetAge,
      level: course.level,
      description: course.description || `${course.name} - ${course.type} (${course.duration} buổi)`,
      status: course.status,
    }));

    return NextResponse.json(
      {
        success: true,
        total: courses.length,
        count: courses.length,
        courses,
        products,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch courses",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
