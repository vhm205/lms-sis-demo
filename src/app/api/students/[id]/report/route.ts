import { NextResponse } from "next/server";
import { generateStudentReport } from "@/lib/report-generator";
import { getAuthContext } from "@/lib/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key, X-Orchexa-Signature, X-Orchexa-Timestamp, X-Orchexa-Client-Id, x-parent-phone, x-parent-id",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function getBaseUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "ACADEMIC_RESULTS";

    const baseUrl = getBaseUrl(request);
    const report = await generateStudentReport(id, type, { baseUrl });

    if (auth.isParent && auth.parent && report.student.parent?.id !== auth.parent.id) {
      return NextResponse.json(
        { error: "Forbidden: Bạn không có quyền truy cập báo cáo của học sinh này.", code: "FORBIDDEN_ACCESS" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        reportId: report.id,
        type: report.type,
        typeName: report.typeName,
        title: report.title,
        previewUrl: report.previewUrl,
        pdfUrl: report.pdfUrl,
        summaryText: report.summaryText,
        shortHighlights: report.shortHighlights,
        student: report.student,
        data: report.academic || report.progress,
        generatedAt: report.generatedAt,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Lỗi tạo báo cáo học viên", code: "REPORT_ERROR" },
      { status: error.message?.includes("Không tìm thấy") ? 404 : 500, headers: CORS_HEADERS }
    );
  }
}
