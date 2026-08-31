import { NextRequest, NextResponse } from "next/server";
import { handleMcpJsonRpc } from "@/lib/mcp-core";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key, X-Orchexa-Signature, X-Orchexa-Timestamp, X-Orchexa-Client-Id, x-parent-phone, x-parent-id",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const sessionId = `mcp_sse_${Date.now().toString(36)}`;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial endpoint event required by MCP SSE specification
      controller.enqueue(
        encoder.encode(`event: endpoint\ndata: /api/mcp/sse?sessionId=${sessionId}\n\n`)
      );

      // 2. Keepalive comments
      const timer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(timer);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await handleMcpJsonRpc(body, request.headers);

    return NextResponse.json(result.body, {
      status: result.status,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: `Parse error: ${error.message}` },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
