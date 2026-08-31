import { NextRequest, NextResponse } from "next/server";
import { handleMcpJsonRpc, listMcpTools } from "@/lib/mcp-core";

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
  const { searchParams } = new URL(request.url);
  const acceptHeader = request.headers.get("accept") || "";

  // If client requested SSE transport via GET
  if (acceptHeader.includes("text/event-stream") || searchParams.get("transport") === "sse") {
    const encoder = new TextEncoder();
    const sessionId = `mcp_sess_${Date.now().toString(36)}`;

    const stream = new ReadableStream({
      start(controller) {
        // Send endpoint discovery event for MCP SSE transport
        controller.enqueue(
          encoder.encode(`event: endpoint\ndata: /api/mcp?sessionId=${sessionId}\n\n`)
        );

        // Send periodic keepalive comment
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

  // Regular GET returns server metadata & available tools info
  const tools = listMcpTools();
  return NextResponse.json(
    {
      name: "EduCenter SIS - Model Context Protocol (MCP) Server",
      protocolVersion: "2024-11-05",
      transports: {
        streamableHttp: {
          endpoint: "/api/mcp",
          method: "POST",
          description: "Recommended for Orchexa Custom MCP Server (Streamable HTTP)",
        },
        sse: {
          endpoint: "/api/mcp/sse",
          method: "GET",
          description: "Server-Sent Events transport endpoint",
        },
      },
      authentication: {
        systemKey: "Header: Authorization: Bearer <system_key> or X-Api-Key: <key>",
        userContextSigned: "Orchexa HMAC signature in headers + _meta.orchexa.actor",
        perUserToken: "Header: Authorization: Bearer <parent_phone_or_token>",
      },
      toolsCount: tools.length,
      tools,
    },
    { headers: CORS_HEADERS }
  );
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
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`,
        },
      },
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }
}
