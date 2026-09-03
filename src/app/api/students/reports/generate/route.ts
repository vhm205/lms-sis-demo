import { NextResponse } from "next/server";
import { generateStudentReport, normalizeReportType } from "@/lib/report-generator";
import { getAuthContext } from "@/lib/auth";

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

function getBaseUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const body = await request.json().catch(() => ({}));
    const studentId = body.studentCode || body.studentId || body.code || body.id;
    const { type = "ACADEMIC_RESULTS" } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp 'studentCode' hoặc 'studentId' (Mã học viên như HV0001)", code: "MISSING_STUDENT_ID" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const baseUrl = getBaseUrl(request);
    const report = await generateStudentReport(studentId, type, { baseUrl });

    // Enforce Parent permission if authenticated as Parent
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
    console.error("[API /api/students/reports/generate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi tạo báo cáo học viên", code: "REPORT_GENERATION_FAILED" },
      { status: error.message?.includes("Không tìm thấy") ? 404 : 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const studentId =
      searchParams.get("studentCode") ||
      searchParams.get("studentId") ||
      searchParams.get("code") ||
      searchParams.get("id");
    const type = searchParams.get("type") || "ACADEMIC_RESULTS";

    if (!studentId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp query parameter 'studentCode' hoặc 'studentId' (VD: ?studentCode=HV0001)", code: "MISSING_STUDENT_ID" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const baseUrl = getBaseUrl(request);
    const report = await generateStudentReport(studentId, type, { baseUrl });

    // Enforce Parent permission if authenticated as Parent
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
    console.error("[API /api/students/reports/generate GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi tạo báo cáo học viên", code: "REPORT_GENERATION_FAILED" },
      { status: error.message?.includes("Không tìm thấy") ? 404 : 500, headers: CORS_HEADERS }
    );
  }
}
