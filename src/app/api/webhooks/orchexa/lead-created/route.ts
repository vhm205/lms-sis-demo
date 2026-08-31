import { NextRequest, NextResponse } from "next/server";
import { handleOrchexaLeadCreated, OrchexaLeadWebhookPayload } from "@/lib/webhook-handlers";
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
      name: "Orchexa Webhook Endpoint: Lead Created",
      description: "Nhận webhook tự động từ Orchexa khi AI Agent thu thập thông tin khách hàng tiềm năng.",
      event: "lead_created",
      method: "POST",
      samplePayload: {
        customer_name: "Nguyễn Văn A",
        phone: "0901234567",
        email: "khach@example.com",
        notes: "Khách cần báo giá gấp",
        conversation_id: "a1b2c3d4-0000",
        agent_id: "a1b2c3d4-0000",
        agent_name: "Nguyễn Văn A",
        channel: "Ví dụ channel",
        timestamp: "2026-08-29T10:30:00+07:00",
        dedup_key: "Ví dụ dedup_key",
        student_name: "Nguyễn Văn A",
        student_class: "Ví dụ student_class"
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

    const payload: OrchexaLeadWebhookPayload = await request.json();
    const result = await handleOrchexaLeadCreated(payload);

    return NextResponse.json(
      {
        event: "lead_created",
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
        error: error.message || "Failed to process lead_created webhook",
        event: "lead_created",
      },
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }
}
