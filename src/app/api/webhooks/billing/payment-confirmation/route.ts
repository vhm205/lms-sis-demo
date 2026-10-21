import { NextRequest, NextResponse } from "next/server";
import { handleBillingWebhook, BillingWebhookPayload } from "@/lib/billing-simulator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const payload: BillingWebhookPayload = {
      event: body.event || "payment_success",
      order_code: body.order_code || body.orderCode || body.code,
      order_id: body.order_id || body.orderId,
      transaction_id: body.transaction_id || body.transactionId || `tx_${Date.now()}`,
      amount: typeof body.amount === "number" ? body.amount : parseFloat(body.amount) || 0,
      currency: body.currency || "VND",
      payment_method: body.payment_method || body.paymentMethod || "BANK_TRANSFER",
      paid_at: body.paid_at || body.paidAt || new Date().toISOString(),
      dedup_key: body.dedup_key || body.dedupKey,
      source: body.source || "BILLING_MOCK",
      notes: body.notes,
    };

    const result = await handleBillingWebhook(payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[Billing Webhook Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error during billing webhook processing",
      },
      { status: 500 }
    );
  }
}
