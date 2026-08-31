import { NextRequest, NextResponse } from "next/server";
import { handleOrchexaOrderCreated, OrchexaOrderWebhookPayload } from "@/lib/webhook-handlers";
import { verifyWebhookRequest } from "@/lib/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key, X-Orchexa-Signature, X-Orchexa-Timestamp, X-Orchexa-Client-Id",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      name: "Orchexa Webhook Endpoint: Order Created",
      description: "Nhận webhook tự động từ Orchexa khi AI Agent tạo đơn hàng hoặc đăng ký khóa học.",
      event: "order_created",
      method: "POST",
      samplePayload: {
        order_id: "a1b2c3d4-0000",
        customer_name: "Nguyễn Văn A",
        phone: "0901234567",
        items: [
          {
            name: "Áo thun in logo",
            quantity: 2,
            price: 125000
          }
        ],
        total: 250000,
        notes: "Khách cần báo giá gấp",
        conversation_id: "a1b2c3d4-0000",
        agent_id: "a1b2c3d4-0000",
        agent_name: "Nguyễn Văn A",
        channel: "Ví dụ channel",
        timestamp: "2026-08-29T10:30:00+07:00",
        dedup_key: "Ví dụ dedup_key"
      }
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = verifyWebhookRequest(request);
    if (!authCheck.valid) {
      return NextResponse.json(
        { error: authCheck.reason || "Unauthorized Webhook Call: Invalid signature or API key." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const payload: OrchexaOrderWebhookPayload = await request.json();
    const result = await handleOrchexaOrderCreated(payload);

    return NextResponse.json(
      {
        event: "order_created",
        receivedAt: new Date().toISOString(),
        ...result,
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to process order_created webhook",
        event: "order_created",
      },
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }
}
