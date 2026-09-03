import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const status = searchParams.get("status");
    const facilityId = searchParams.get("facilityId");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (facilityId && facilityId !== "all") {
      where.OR = [{ facilityId: facilityId }, { facilityId: null }];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        facility: true,
        items: {
          include: {
            course: true,
          },
          orderBy: [{ featured: "desc" }, { orderIndex: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        count: campaigns.length,
        data: campaigns,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch campaigns",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, title, description, badge, type, startDate, endDate, status, bannerUrl, facilityId, items } = body;

    if (!code || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: code, title" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        code,
        title,
        description: description || null,
        badge: badge || null,
        type: type || "PROMOTION",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: status || "ACTIVE",
        bannerUrl: bannerUrl || null,
        facilityId: facilityId || null,
        items: items && Array.isArray(items)
          ? {
              create: items.map((it: any, idx: number) => ({
                productCode: it.productCode || `${code}-ITM-${idx + 1}`,
                courseId: it.courseId || null,
                name: it.name,
                title: it.title || it.name,
                description: it.description || "",
                imageUrl: it.imageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
                listPrice: Number(it.listPrice) || 0,
                salePrice: Number(it.salePrice) || 0,
                discountPercent: it.discountPercent ? Number(it.discountPercent) : null,
                stock: it.stock ? Number(it.stock) : 10,
                featured: Boolean(it.featured),
                orderIndex: idx + 1,
                targetAudience: it.targetAudience || "ALL",
                primaryBtnLabel: it.primaryBtnLabel || "Nhận voucher",
                primaryBtnMsg: it.primaryBtnMsg || `Tôi muốn nhận ưu đãi cho khóa ${it.name}`,
                secondaryBtnLabel: it.secondaryBtnLabel || "Xem chi tiết",
                secondaryBtnMsg: it.secondaryBtnMsg || `Tư vấn thêm cho tôi về khóa ${it.name}`,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
      },
    });

    try {
      revalidatePath("/campaigns");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tạo chiến dịch khuyến mãi thành công",
        data: campaign,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create campaign" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
