import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// 1. GET /api/campaigns/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        facility: true,
        items: {
          include: { course: true },
          orderBy: [{ featured: "desc" }, { orderIndex: "asc" }],
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chiến dịch với ID: " + id },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: campaign },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// 2. PUT /api/campaigns/[id] (Full Update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, title, description, badge, type, startDate, endDate, status, bannerUrl, facilityId, items } = body;

    // Check if campaign exists
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chiến dịch cần cập nhật" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Update campaign details
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        code: code || existing.code,
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        badge: badge !== undefined ? badge : existing.badge,
        type: type || existing.type,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        status: status || existing.status,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : existing.bannerUrl,
        facilityId: facilityId === "all" ? null : (facilityId !== undefined ? facilityId : existing.facilityId),
      },
    });

    // If items provided, replace or sync items
    if (items && Array.isArray(items)) {
      // Remove old items and re-create to keep sync
      await prisma.campaignItem.deleteMany({ where: { campaignId: id } });
      if (items.length > 0) {
        await prisma.campaignItem.createMany({
          data: items.map((it: any, idx: number) => ({
            campaignId: id,
            productCode: it.productCode || `${updatedCampaign.code}-ITM-${idx + 1}`,
            courseId: it.courseId || null,
            name: it.name,
            title: it.title || it.name,
            description: it.description || "",
            imageUrl: it.imageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
            listPrice: Number(it.listPrice) || 0,
            salePrice: Number(it.salePrice) || 0,
            discountPercent: it.discountPercent ? Number(it.discountPercent) : null,
            stock: it.stock !== undefined ? Number(it.stock) : 10,
            featured: Boolean(it.featured),
            orderIndex: idx + 1,
            targetAudience: it.targetAudience || "ALL",
            primaryBtnLabel: it.primaryBtnLabel || "Nhận voucher",
            primaryBtnMsg: it.primaryBtnMsg || `Tôi muốn nhận ưu đãi cho khóa ${it.name}`,
            secondaryBtnLabel: it.secondaryBtnLabel || "Xem chi tiết",
            secondaryBtnMsg: it.secondaryBtnMsg || `Tư vấn thêm cho tôi về khóa ${it.name}`,
          })),
        });
      }
    }

    const finalResult = await prisma.campaign.findUnique({
      where: { id },
      include: {
        facility: true,
        items: {
          include: { course: true },
          orderBy: [{ featured: "desc" }, { orderIndex: "asc" }],
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật chiến dịch thành công",
        data: finalResult,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// 3. PATCH /api/campaigns/[id] (Quick toggle status e.g. ACTIVE / PAUSED)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Thiếu trường status" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status },
      include: {
        facility: true,
        items: { include: { course: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đã chuyển trạng thái chiến dịch sang ${status}`,
        data: updated,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// 4. DELETE /api/campaigns/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Chiến dịch không tồn tại hoặc đã bị xóa" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Cascade delete items first (if foreign key constraint requires)
    await prisma.campaignItem.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json(
      {
        success: true,
        message: `Đã xóa chiến dịch '${existing.title}' (${existing.code}) thành công.`,
        deletedId: id,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete campaign" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
