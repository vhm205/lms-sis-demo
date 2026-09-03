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
    const campaignCode = searchParams.get("campaignCode");
    const targetAudience = searchParams.get("targetAudience");
    const facilityId = searchParams.get("facilityId");
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const whereCondition: any = { status: "ACTIVE" };
    if (campaignCode) {
      whereCondition.code = campaignCode;
    }

    if (facilityId && facilityId !== "all") {
      const facility = await prisma.facility.findFirst({
        where: { OR: [{ id: facilityId }, { name: { contains: facilityId } }] },
      });
      if (facility) {
        whereCondition.OR = [{ facilityId: facility.id }, { facilityId: null }];
      }
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereCondition,
      include: {
        facility: true,
        items: {
          include: { course: true },
          orderBy: [{ featured: "desc" }, { orderIndex: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          campaign: null,
          products: [],
          message: "Không tìm thấy chương trình khuyến mãi phù hợp.",
        },
        { headers: CORS_HEADERS }
      );
    }

    let allItems: any[] = [];
    const primaryCampaign = campaigns[0];

    for (const camp of campaigns) {
      for (const item of camp.items) {
        if (targetAudience && targetAudience !== "ALL") {
          if (item.targetAudience && item.targetAudience !== targetAudience && item.targetAudience !== "ALL") {
            continue;
          }
        }
        allItems.push({
          campaignCode: camp.code,
          campaignTitle: camp.title,
          campaignBadge: camp.badge,
          ...item,
        });
      }
    }

    if (limit && allItems.length > limit) {
      allItems = allItems.slice(0, limit);
    }

    // Map to Orchexa Rich Card Carousel fields
    const products = allItems.map((item) => ({
      id: item.id,
      name: item.name,
      title: item.title || item.name,
      course_name: item.course?.name || item.name,
      product_code: item.productCode,
      description: item.description,
      list_price: item.listPrice,
      sale_price: item.salePrice,
      price: item.salePrice,
      price_numeric: item.salePrice,
      discount_percent: item.discountPercent,
      image: item.imageUrl,
      image_url: item.imageUrl,
      stock: item.stock,
      inventory_count: item.stock,
      featured: item.featured,
      campaign_id: item.campaignId,
      campaign_name: item.campaignTitle,
      badge: item.campaignBadge,
      primary_button: {
        label: item.primaryBtnLabel || "Nhận voucher",
        action: "Chat message",
        message: (item.primaryBtnMsg || "Tôi muốn nhận ưu đãi cho khóa {name}").replace("{name}", item.name).replace("{price}", item.salePrice.toLocaleString("vi-VN") + "đ"),
      },
      secondary_button: {
        label: item.secondaryBtnLabel || "Xem chi tiết",
        action: "Chat message",
        message: (item.secondaryBtnMsg || "Tư vấn thêm cho tôi về khóa {name}").replace("{name}", item.name),
      },
    }));

    return NextResponse.json(
      {
        success: true,
        campaign: {
          code: primaryCampaign.code,
          title: primaryCampaign.title,
          badge: primaryCampaign.badge,
        },
        count: products.length,
        data: products,
        products,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to query promotional products",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
