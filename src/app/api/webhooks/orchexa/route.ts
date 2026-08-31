import { NextRequest, NextResponse } from "next/server";
import { handleOrchexaLeadCreated, handleOrchexaOrderCreated } from "@/lib/webhook-handlers";
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
      name: "Orchexa Unified Webhooks Receiver",
      endpoints: {
        leadCreated: "/api/webhooks/orchexa/lead-created",
        orderCreated: "/api/webhooks/orchexa/order-created",
        unified: "/api/webhooks/orchexa",
      },
      supportedEvents: ["lead_created", "order_created"],
      authentication: {
        type: "Webhook Secret / API Key / Orchexa Client ID Signature",
        supportedHeaders: ["Authorization: Bearer <secret>", "X-Api-Key: <key>", "X-Orchexa-Signature: <hmac>", "X-Orchexa-Client-Id: <id>"],
      },
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

    const payload = await request.json();
    const eventType = payload.event || (payload.order_id || payload.items || payload.total ? "order_created" : "lead_created");

    if (eventType === "order_created") {
      const result = await handleOrchexaOrderCreated(payload);
      return NextResponse.json({ event: "order_created", ...result }, { status: 200, headers: CORS_HEADERS });
    } else {
      const result = await handleOrchexaLeadCreated(payload);
      return NextResponse.json({ event: "lead_created", ...result }, { status: 200, headers: CORS_HEADERS });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
