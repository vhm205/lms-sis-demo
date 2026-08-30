"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Key, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Layers, 
  MessageSquare, 
  UserCheck, 
  Database,
  Sparkles,
  Bot
} from "lucide-react";

export function DeveloperClient() {
  const [activeTab, setActiveTab] = useState<"api" | "mcp" | "auth" | "parent-flow" | "orchexa">("orchexa");
  const [selectedApiIndex, setSelectedApiIndex] = useState<number>(0);
  const [selectedMcpIndex, setSelectedMcpIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [bootstrapResult, setBootstrapResult] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const apis = [
    {
      method: "GET",
      path: "/api/students/search",
      summary: "Tìm kiếm học viên",
      desc: "Tìm kiếm danh sách học viên theo họ tên, mã học viên, hoặc số điện thoại phụ huynh.",
      headers: [
        { name: "Authorization", value: "Bearer <API_KEY>", required: true, desc: "Token xác thực API của trung tâm" },
        { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng dữ liệu" },
        { name: "x-facility-id", value: "fac_hn_01", required: false, desc: "Lọc theo cơ sở cụ thể (tùy chọn)" }
      ],
      params: [
        { name: "query", in: "query", type: "string", required: true, desc: "Từ khóa tìm kiếm: Tên bé, Mã HV (HV0001), hoặc SĐT phụ huynh (0901234567)" }
      ],
      requestBody: null,
      responseExample: {
        data: [
          {
            id: "cm4student01",
            code: "HV0001",
            name: "Nguyễn Văn Bé Minh",
            phone: null,
            status: "ACTIVE",
            facility: { id: "fac_cau_giay", name: "Cơ sở Cầu Giấy", address: "123 Cầu Giấy, Hà Nội" },
            parent: { id: "par_01", name: "Nguyễn Văn Phụ Huynh A", phone: "0901234567", email: "parentA@example.com" }
          }
        ]
      },
      curlExample: `curl -X GET "https://api.educenter.vn/api/students/search?query=0901234567" \\
  -H "Authorization: Bearer sec_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json"`
    },
    {
      method: "GET",
      path: "/api/students/:id",
      summary: "Chi tiết hồ sơ & lịch sử học tập",
      desc: "Lấy toàn bộ thông tin chi tiết của 1 học viên: Lớp đang học, kết quả học tập (Assignment), lịch sử điểm danh và các yêu cầu hỗ trợ.",
      headers: [
        { name: "Authorization", value: "Bearer <API_KEY>", required: true, desc: "Token xác thực API" },
        { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng dữ liệu" }
      ],
      params: [
        { name: "id", in: "path", type: "string", required: true, desc: "ID duy nhất của học viên trong hệ thống (VD: cuid / cm4student01)" }
      ],
      requestBody: null,
      responseExample: {
        data: {
          id: "cm4student01",
          code: "HV0001",
          name: "Nguyễn Văn Bé Minh",
          status: "ACTIVE",
          parent: { name: "Nguyễn Văn Phụ Huynh A", phone: "0901234567" },
          facility: { name: "Cơ sở Cầu Giấy" },
          classes: [
            {
              id: "cls_eng_01",
              name: "Lớp Tiếng Anh Kids Cầu Giấy 1",
              course: { name: "Tiếng Anh Thiếu Nhi Mầm Non", duration: 24 },
              teacher: { name: "Trần Thị Giáo Viên 1", email: "teacher1@educenter.vn" }
            }
          ],
          attendances: [
            {
              id: "att_01",
              status: "PRESENT",
              note: "Hăng hái phát biểu, phát âm tốt",
              schedule: { date: "2026-09-01T15:00:00.000Z", duration: 90, room: { name: "Phòng 101" } }
            }
          ],
          assignments: [
            { id: "asg_01", title: "Bài tập từ vựng Unit 3", score: 9.5, maxScore: 10, status: "COMPLETED", teacherNote: "Bài làm rất chuẩn" }
          ]
        }
      },
      curlExample: `curl -X GET "https://api.educenter.vn/api/students/cm4student01" \\
  -H "Authorization: Bearer sec_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json"`
    },
    {
      method: "GET",
      path: "/api/orders",
      summary: "Danh sách đơn đăng ký khóa học",
      desc: "Lấy danh sách các đơn đăng ký khóa học (Orders) kèm trạng thái thanh toán.",
      headers: [
        { name: "Authorization", value: "Bearer <API_KEY>", required: true, desc: "Token xác thực API" },
        { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng dữ liệu" }
      ],
      params: [],
      requestBody: null,
      responseExample: {
        data: [
          {
            id: "ord_01",
            code: "ORD-982134",
            parentName: "Trần Thị Phụ Huynh B",
            parentPhone: "0912345678",
            amount: 8000000,
            status: "PAID",
            course: { name: "Luyện thi IELTS Intermediate" },
            facility: { name: "Cơ sở Bình Thạnh" }
          }
        ]
      },
      curlExample: `curl -X GET "https://api.educenter.vn/api/orders" \\
  -H "Authorization: Bearer sec_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json"`
    },
    {
      method: "POST",
      path: "/api/orders",
      summary: "Tạo đơn đăng ký khóa học mới",
      desc: "AI Agent hoặc hệ thống CRM tạo đơn đăng ký khóa học khi khách hàng đồng ý chốt học.",
      headers: [
        { name: "Authorization", value: "Bearer <API_KEY>", required: true, desc: "Token xác thực API" },
        { name: "Content-Type", value: "application/json", required: true, desc: "Application/json" }
      ],
      params: [],
      requestBody: {
        parentName: "Phạm Văn C",
        parentPhone: "0988776655",
        courseId: "course_ielts_01",
        facilityId: "fac_binh_thanh",
        amount: 8000000,
        notes: "Đăng ký khóa tối 2-4-6, tư vấn bởi AI Agent"
      },
      responseExample: {
        data: {
          id: "ord_new_123",
          code: "ORD-349102",
          status: "PENDING",
          parentName: "Phạm Văn C",
          parentPhone: "0988776655",
          amount: 8000000,
          createdAt: "2026-08-30T16:00:00.000Z"
        }
      },
      curlExample: `curl -X POST "https://api.educenter.vn/api/orders" \\
  -H "Authorization: Bearer sec_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "parentName": "Phạm Văn C",
    "parentPhone": "0988776655",
    "courseId": "course_ielts_01",
    "facilityId": "fac_binh_thanh",
    "amount": 8000000,
    "notes": "Đăng ký qua AI Agent"
  }'`
    },
    {
      method: "POST",
      path: "/api/requests/makeup",
      summary: "Tạo yêu cầu học bù (Có kiểm tra điều kiện)",
      desc: "Tạo phiếu đăng ký học bù. Hệ thống tự động kiểm tra xem học viên có thực sự vắng mặt (ABSENT / EXCUSED) ở buổi học đó hay không.",
      headers: [
        { name: "Authorization", value: "Bearer <API_KEY>", required: true, desc: "Token xác thực API" },
        { name: "Content-Type", value: "application/json", required: true, desc: "Application/json" }
      ],
      params: [],
      requestBody: {
        studentId: "cm4student01",
        missedScheduleId: "sch_missed_01",
        targetScheduleId: "sch_target_02",
        notes: "Phụ huynh xin học bù do bé bị ốm vào thứ 4"
      },
      responseExample: {
        data: {
          id: "mkr_9918",
          studentId: "cm4student01",
          missedScheduleId: "sch_missed_01",
          targetScheduleId: "sch_target_02",
          status: "PENDING",
          createdAt: "2026-08-30T16:05:00.000Z"
        }
      },
      curlExample: `curl -X POST "https://api.educenter.vn/api/requests/makeup" \\
  -H "Authorization: Bearer sec_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "studentId": "cm4student01",
    "missedScheduleId": "sch_missed_01",
    "targetScheduleId": "sch_target_02",
    "notes": "Học bù lớp tối 3-5-7"
  }'`
    },
    {
      method: "POST",
      path: "/api/requests/support",
      summary: "Tạo yêu cầu hỗ trợ chung",
      desc: "Tạo ticket yêu cầu CSKH hoặc Giáo vụ hỗ trợ học viên (xin nghỉ phép, bảo lưu, khiếu nại, hẹn gọi lại).",
      headers: [
        { name: "Authorization", value: "Bearer <API_KEY>", required: true, desc: "Token xác thực API" },
        { name: "Content-Type", value: "application/json", required: true, desc: "Application/json" }
      ],
      params: [],
      requestBody: {
        studentId: "cm4student01",
        type: "LEAVE",
        content: "Phụ huynh xin phép cho bé nghỉ buổi học ngày mai do gia đình có việc",
        priority: "NORMAL"
      },
      responseExample: {
        data: {
          id: "sup_4401",
          studentId: "cm4student01",
          type: "LEAVE",
          content: "Phụ huynh xin phép...",
          status: "NEW",
          priority: "NORMAL",
          createdAt: "2026-08-30T16:08:00.000Z"
        }
      },
      curlExample: `curl -X POST "https://api.educenter.vn/api/requests/support" \\
  -H "Authorization: Bearer sec_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "studentId": "cm4student01",
    "type": "LEAVE",
    "content": "Xin phép nghỉ học ngày mai",
    "priority": "NORMAL"
  }'`
    }
  ];

  const mcps = [
    {
      name: "search_students",
      description: "Tìm kiếm học viên theo tên, mã hoặc số điện thoại phụ huynh. Trả về danh sách hồ sơ rút gọn cho LLM.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Từ khóa tìm kiếm (tên học viên, mã HV như HV0001, hoặc SĐT phụ huynh)" }
        },
        required: ["query"]
      },
      sampleCall: `{\n  "name": "search_students",\n  "arguments": {\n    "query": "0901234567"\n  }\n}`,
      outputDesc: "Danh sách học viên khớp với query kèm quan hệ Parent và Facility."
    },
    {
      name: "get_student_info",
      description: "Lấy thông tin tổng hợp của một học viên gồm: Lớp học hiện tại, lịch sử điểm danh (10 buổi gần nhất), bài tập & điểm số, và các yêu cầu hỗ trợ.",
      inputSchema: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "ID học viên (ID duy nhất)" }
        },
        required: ["studentId"]
      },
      sampleCall: `{\n  "name": "get_student_info",\n  "arguments": {\n    "studentId": "cm4student01"\n  }\n}`,
      outputDesc: "Hồ sơ đầy đủ dạng JSON để LLM phân tích và trả lời trực tiếp cho phụ huynh."
    },
    {
      name: "find_available_classes",
      description: "Tìm các lớp học đang mở còn chỗ trống (enrolled < capacity) cho một khóa học cụ thể.",
      inputSchema: {
        type: "object",
        properties: {
          courseId: { type: "string", description: "ID của khóa học cần tìm lớp" }
        },
        required: ["courseId"]
      },
      sampleCall: `{\n  "name": "find_available_classes",\n  "arguments": {\n    "courseId": "course_ielts_01"\n  }\n}`,
      outputDesc: "Mảng danh sách lớp: id, name, capacity, enrolled, available."
    },
    {
      name: "create_makeup_request",
      description: "AI Agent thực hiện tạo yêu cầu học bù. Tự động kiểm tra điều kiện điểm danh xem học viên có vắng mặt hợp lệ ở buổi học đó không.",
      inputSchema: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "ID học viên" },
          missedScheduleId: { type: "string", description: "ID của buổi học đã nghỉ" },
          targetScheduleId: { type: "string", description: "ID của buổi học muốn chuyển sang học bù" },
          notes: { type: "string", description: "Lý do hoặc ghi chú của phụ huynh" }
        },
        required: ["studentId", "missedScheduleId", "targetScheduleId"]
      },
      sampleCall: `{\n  "name": "create_makeup_request",\n  "arguments": {\n    "studentId": "cm4student01",\n    "missedScheduleId": "sch_01",\n    "targetScheduleId": "sch_02",\n    "notes": "Bé ốm sốt xin học bù sang thứ 7"\n  }\n}`,
      outputDesc: "Kết quả tạo MakeUpRequest hoặc thông báo từ chối nếu không có lịch nghỉ."
    },
    {
      name: "create_order",
      description: "AI Agent thay mặt nhân viên tư vấn tạo đơn đăng ký khóa học (Order) cho khách hàng.",
      inputSchema: {
        type: "object",
        properties: {
          parentName: { type: "string", description: "Họ tên phụ huynh" },
          parentPhone: { type: "string", description: "Số điện thoại phụ huynh" },
          courseId: { type: "string", description: "ID khóa học đăng ký" },
          facilityId: { type: "string", description: "ID cơ sở muốn theo học" },
          amount: { type: "number", description: "Số tiền học phí" },
          notes: { type: "string", description: "Ghi chú thêm" }
        },
        required: ["parentName", "parentPhone", "courseId", "facilityId"]
      },
      sampleCall: `{\n  "name": "create_order",\n  "arguments": {\n    "parentName": "Lê Thị C",\n    "parentPhone": "0911223344",\n    "courseId": "course_math_01",\n    "facilityId": "fac_cau_giay",\n    "amount": 2500000,\n    "notes": "Đăng ký qua Zalo Chatbot"\n  }\n}`,
      outputDesc: "Mã đơn đăng ký mới tạo (ORD-XXXXXX) và trạng thái PENDING."
    }
  ];

  const mcpConfigExample = `{
  "mcpServers": {
    "educenter-lms": {
      "command": "npx",
      "args": ["tsx", "src/mcp.ts"],
      "env": {
        "DATABASE_URL": "file:./prisma/dev.db"
      }
    }
  }
}`;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-primary border-primary">API v1.0 & MCP Standard</Badge>
          <Badge variant="secondary">Production Ready</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Trung tâm Điều hành API & AI Agent Integration</h1>
        <p className="text-muted-foreground mt-1">
          Tài liệu tích hợp REST APIs, cấu hình giao thức Model Context Protocol (MCP), và kiến trúc bảo mật truy vấn cho AI Agent.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button 
          variant={activeTab === "orchexa" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("orchexa")}
          className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        >
          <Bot className="h-4 w-4" /> Orchexa Embedded AI
        </Button>
        <Button 
          variant={activeTab === "api" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("api")}
          className="gap-2"
        >
          <Globe className="h-4 w-4" /> Public REST APIs
        </Button>
        <Button 
          variant={activeTab === "mcp" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("mcp")}
          className="gap-2"
        >
          <Cpu className="h-4 w-4" /> MCP Server Tools
        </Button>
        <Button 
          variant={activeTab === "parent-flow" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("parent-flow")}
          className="gap-2"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Flow Chat Phụ Huynh & Bảo Mật
        </Button>
        <Button 
          variant={activeTab === "auth" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("auth")}
          className="gap-2"
        >
          <Lock className="h-4 w-4" /> Xác thực & Headers
        </Button>
      </div>

      {/* TAB 1: REST APIS */}
      {activeTab === "api" && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left Column: API List */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Danh sách Endpoints</h3>
            <div className="flex flex-col gap-1.5">
              {apis.map((api, idx) => {
                const isSelected = selectedApiIndex === idx;
                return (
                  <button
                    key={api.path + api.method}
                    onClick={() => setSelectedApiIndex(idx)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? "bg-card border-primary ring-1 ring-primary shadow-sm" 
                        : "bg-card/50 border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={api.method === "GET" ? "default" : "destructive"} className="text-xs px-1.5 py-0">
                        {api.method}
                      </Badge>
                      <span className="font-mono text-xs font-semibold truncate text-foreground">{api.path}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{api.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Endpoint Documentation */}
          <div className="flex flex-col gap-6">
            {apis[selectedApiIndex] && (() => {
              const api = apis[selectedApiIndex];
              return (
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={api.method === "GET" ? "default" : "destructive"} className="text-sm font-mono px-2.5 py-0.5">
                          {api.method}
                        </Badge>
                        <code className="text-base font-mono font-bold text-primary">{api.path}</code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(api.curlExample, "curl-" + selectedApiIndex)}
                        className="gap-1.5 text-xs"
                      >
                        {copiedKey === "curl-" + selectedApiIndex ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === "curl-" + selectedApiIndex ? "Đã copy cURL" : "Copy cURL"}
                      </Button>
                    </div>
                    <CardDescription className="text-sm mt-2 text-foreground font-medium">
                      {api.summary} — <span className="text-muted-foreground font-normal">{api.desc}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6 flex flex-col gap-6">
                    {/* Headers required */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-amber-500" /> Headers xác thực bắt buộc
                      </h4>
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50 border-b">
                            <tr>
                              <th className="text-left p-2.5 font-semibold">Header</th>
                              <th className="text-left p-2.5 font-semibold">Mẫu giá trị</th>
                              <th className="text-left p-2.5 font-semibold">Bắt buộc</th>
                              <th className="text-left p-2.5 font-semibold">Mô tả</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-mono">
                            {api.headers.map((h, i) => (
                              <tr key={i} className="hover:bg-muted/20">
                                <td className="p-2.5 text-primary font-semibold">{h.name}</td>
                                <td className="p-2.5 text-muted-foreground">{h.value}</td>
                                <td className="p-2.5">
                                  <Badge variant={h.required ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                                    {h.required ? "Required" : "Optional"}
                                  </Badge>
                                </td>
                                <td className="p-2.5 font-sans text-muted-foreground">{h.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Params if any */}
                    {api.params.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Parameters</h4>
                        <div className="rounded-md border overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50 border-b">
                              <tr>
                                <th className="text-left p-2.5 font-semibold">Tên</th>
                                <th className="text-left p-2.5 font-semibold">Vị trí</th>
                                <th className="text-left p-2.5 font-semibold">Kiểu dữ liệu</th>
                                <th className="text-left p-2.5 font-semibold">Mô tả</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y font-mono">
                              {api.params.map((p, i) => (
                                <tr key={i} className="hover:bg-muted/20">
                                  <td className="p-2.5 font-bold text-foreground">{p.name}</td>
                                  <td className="p-2.5 text-muted-foreground">{p.in}</td>
                                  <td className="p-2.5 text-primary">{p.type}</td>
                                  <td className="p-2.5 font-sans text-muted-foreground">{p.desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Request Body if POST */}
                    {api.requestBody && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Request Body (JSON)</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs gap-1"
                            onClick={() => copyToClipboard(JSON.stringify(api.requestBody, null, 2), "reqbody-" + selectedApiIndex)}
                          >
                            {copiedKey === "reqbody-" + selectedApiIndex ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            Copy Body
                          </Button>
                        </div>
                        <pre className="p-3.5 rounded-md bg-muted/80 text-xs font-mono overflow-x-auto border text-foreground">
                          {JSON.stringify(api.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* cURL snippet */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-primary" /> cURL Example
                      </h4>
                      <pre className="p-3.5 rounded-md bg-slate-950 text-slate-50 text-xs font-mono overflow-x-auto border">
                        {api.curlExample}
                      </pre>
                    </div>

                    {/* Response Example */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500">200 OK</Badge> Response Example
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs gap-1"
                          onClick={() => copyToClipboard(JSON.stringify(api.responseExample, null, 2), "res-" + selectedApiIndex)}
                        >
                          {copiedKey === "res-" + selectedApiIndex ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy Response
                        </Button>
                      </div>
                      <pre className="p-3.5 rounded-md bg-muted/60 text-xs font-mono overflow-x-auto border max-h-[300px]">
                        {JSON.stringify(api.responseExample, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: MCP SERVER TOOLS */}
      {activeTab === "mcp" && (
        <div className="flex flex-col gap-6">
          {/* Top banner: How to connect MCP */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Cấu hình kết nối MCP Server (`src/mcp.ts`)</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(mcpConfigExample, "mcp-config")}
                  className="gap-1.5 text-xs bg-background"
                >
                  {copiedKey === "mcp-config" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy JSON Config
                </Button>
              </div>
              <CardDescription>
                Thêm khối cấu hình sau vào tệp `claude_desktop_config.json`, `.cursor/mcp.json` hoặc cấu hình Agent CLI để cấp quyền cho AI Agent gọi tool trực tiếp:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-3.5 rounded-md bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border">
                {mcpConfigExample}
              </pre>
            </CardContent>
          </Card>

          {/* Tools Explorer */}
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Tool list */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Danh sách Tools ({mcps.length})</h3>
              <div className="flex flex-col gap-1.5">
                {mcps.map((mcp, idx) => {
                  const isSelected = selectedMcpIndex === idx;
                  return (
                    <button
                      key={mcp.name}
                      onClick={() => setSelectedMcpIndex(idx)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? "bg-card border-primary ring-1 ring-primary shadow-sm" 
                          : "bg-card/50 border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-primary border-primary text-xs px-1.5 py-0">Tool</Badge>
                        <span className="font-mono text-xs font-bold text-foreground">{mcp.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mcp.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tool detail */}
            <div>
              {mcps[selectedMcpIndex] && (() => {
                const tool = mcps[selectedMcpIndex];
                return (
                  <Card>
                    <CardHeader className="pb-4 border-b">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <Badge variant="outline" className="text-primary border-primary text-sm font-mono">MCP TOOL</Badge>
                          <code className="text-lg font-bold font-mono text-foreground">{tool.name}</code>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(tool.sampleCall, "tool-call-" + selectedMcpIndex)}
                          className="gap-1.5 text-xs"
                        >
                          {copiedKey === "tool-call-" + selectedMcpIndex ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          Copy Call Payload
                        </Button>
                      </div>
                      <CardDescription className="text-sm mt-2 text-foreground font-normal">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 flex flex-col gap-6">
                      {/* Input Schema Parameters */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Input Parameters (Schema)</h4>
                        <div className="rounded-md border overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50 border-b">
                              <tr>
                                <th className="text-left p-2.5 font-semibold">Tham số</th>
                                <th className="text-left p-2.5 font-semibold">Kiểu dữ liệu</th>
                                <th className="text-left p-2.5 font-semibold">Bắt buộc</th>
                                <th className="text-left p-2.5 font-semibold">Mô tả cho LLM</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y font-mono">
                              {Object.entries(tool.inputSchema.properties).map(([paramName, paramObj]: [string, any]) => {
                                const isRequired = tool.inputSchema.required?.includes(paramName);
                                return (
                                  <tr key={paramName} className="hover:bg-muted/20">
                                    <td className="p-2.5 font-bold text-primary">{paramName}</td>
                                    <td className="p-2.5 text-muted-foreground">{paramObj.type}</td>
                                    <td className="p-2.5">
                                      <Badge variant={isRequired ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                                        {isRequired ? "Required" : "Optional"}
                                      </Badge>
                                    </td>
                                    <td className="p-2.5 font-sans text-muted-foreground">{paramObj.description || "-"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tool Call Payload */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Mẫu Tool Call từ LLM</h4>
                        <pre className="p-3.5 rounded-md bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border">
                          {tool.sampleCall}
                        </pre>
                      </div>

                      {/* Return Payload Info */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Kết quả trả về cho LLM Context</h4>
                        <div className="p-3.5 rounded-md bg-muted/60 text-xs text-foreground border">
                          <p className="font-medium">{tool.outputDesc}</p>
                          <p className="text-muted-foreground text-xs mt-1">Dữ liệu được chuyển đổi thành chuỗi văn bản JSON cấu trúc để Agent dễ dàng trích xuất thông tin trả lời người dùng mà không tràn token.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARENT CHAT FLOW & SECURITY ARCHITECTURE */}
      {activeTab === "parent-flow" && (
        <div className="flex flex-col gap-8">
          {/* Overview Callout */}
          <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-xl">Kiến Trúc Truy Vấn An Toàn & Phân Quyền Dữ Liệu Phụ Huynh (RBAC/ABAC)</CardTitle>
              </div>
              <CardDescription className="text-base text-foreground/80">
                Làm thế nào để khi phụ huynh hỏi: <em>&ldquo;Con tôi hôm nay có đi học không và điểm thi vừa rồi thế nào?&rdquo;</em>, AI Agent chỉ truy cập đúng dữ liệu con của phụ huynh đó mà không bao giờ lộ thông tin của học sinh khác?
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 4 Pillars of Parent Data Security */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 font-bold">1</div>
                <CardTitle className="text-base">Identity Binding</CardTitle>
                <CardDescription className="text-xs">Xác thực kênh chat</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Phụ huynh chat qua Zalo OA, SMS OTP, hoặc Mobile App. Kênh chat tự động xác định và verify số điện thoại `parent_phone` được liên kết chính xác trong DB.
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2 font-bold">2</div>
                <CardTitle className="text-base">Context Injection</CardTitle>
                <CardDescription className="text-xs">Tiêm ngữ cảnh đã xác thực</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Hệ thống Backend (API Gateway) tự động tìm danh sách con (`children: [id1, id2]`) và tiêm vào System Prompt của Agent, không cho Agent tự do search toàn bảng.
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 font-bold">3</div>
                <CardTitle className="text-base">Scoped Tool Execution</CardTitle>
                <CardDescription className="text-xs">Bảo vệ tầng Tool / DB (RLS)</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Ở tầng MCP/API, mọi câu lệnh truy vấn đều bắt buộc có điều kiện `WHERE student.id IN (:verifiedChildrenIds)`. Kể cả khi LLM bị jailbreak cũng không thể đọc data khác.
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 font-bold">4</div>
                <CardTitle className="text-base">Disambiguation Flow</CardTitle>
                <CardDescription className="text-xs">Làm rõ khi có nhiều con</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Nếu 1 phụ huynh có từ 2 con trở lên đang theo học (VD: Bé Minh và Bé Lan), Agent sẽ hỏi lại phụ huynh muốn tra cứu thông tin của bé nào trước khi gọi chi tiết.
              </CardContent>
            </Card>
          </div>

          {/* End-to-End Chat Flow Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Quy trình Chat Flow chi tiết trong thực tế (Step-by-Step)
              </CardTitle>
              <CardDescription>Các bước xử lý từ lúc phụ huynh gửi tin nhắn đến khi nhận câu trả lời</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-sm text-foreground">Xác thực phụ huynh & Khởi tạo phiên hội thoại (Auth & Session Init)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Phụ huynh mở Zalo OA hoặc đăng nhập Web App EduCenter. Session được gắn liền với Token chứa `parentId` và `parentPhone: "0901234567"`.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-sm text-foreground">Backend tải danh sách học sinh thuộc quyền sở hữu (Pre-fetching Children)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Backend chạy truy vấn: <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-primary">SELECT id, code, name FROM Student WHERE parentId = :parentId</code>.
                    Kết quả trả về danh sách con: <code>[{`id: "cm4student01", name: "Nguyễn Văn Bé Minh"`}, {`id: "cm4student02", name: "Nguyễn Thị Bé Lan"`}]</code>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-sm text-foreground">Phụ huynh gửi câu hỏi & Phân luồng nhận diện (Intent & Student Disambiguation)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    • <strong>Trường hợp A (1 con):</strong> Phụ huynh chỉ có 1 bé &rarr; Agent tự động gán `studentId` của bé đó.<br/>
                    • <strong>Trường hợp B (Nhiều con):</strong> Phụ huynh hỏi chung &ldquo;Xem lịch học con tôi&rdquo; &rarr; Agent phản hồi lịch sự: &ldquo;Dạ phụ huynh muốn xem lịch học của bé Nguyễn Văn Bé Minh hay bé Nguyễn Thị Bé Lan ạ?&rdquo;.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-sm text-foreground">Agent gọi Tool truy vấn có kiểm tra bảo vệ (Scoped Tool Execution)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agent gọi tool: <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-primary">get_student_info(studentId: "cm4student01")</code>. Middleware kiểm tra `studentId` nằm trong danh sách con được phép của Session. Nếu cố tình truyền ID học sinh khác &rarr; Server trả về lỗi 403 Forbidden.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">5</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">Agent tổng hợp và phản hồi tự nhiên, gợi ý hành động (Synthesis & Actionable Help)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agent trình bày ngắn gọn, dễ hiểu: Buổi học hôm nay, tình trạng điểm danh, nhận xét của giáo viên, bài tập gần nhất, và chủ động hỏi phụ huynh có cần xin học bù hoặc hỗ trợ gì thêm không.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-World Conversation Example */}
          <Card className="border bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Kịch bản hội thoại thực tế (Ví dụ mẫu)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message 1: Parent */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">PH</div>
                <div className="bg-background p-3 rounded-2xl rounded-tl-none border text-sm max-w-lg shadow-sm">
                  <p className="font-semibold text-xs text-muted-foreground mb-1">Phụ huynh (SĐT: 0901234567)</p>
                  Cô ơi hôm nay bé Minh đi học tình hình thế nào? Tuần này có bài tập gì không cô?
                </div>
              </div>

              {/* Message 2: Agent */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">AI</div>
                <div className="bg-primary/10 p-3.5 rounded-2xl rounded-tl-none border border-primary/20 text-sm max-w-xl">
                  <p className="font-semibold text-xs text-primary mb-1">Trợ lý AI EduCenter (Đã xác thực Bé Minh - HV0001)</p>
                  <p className="mb-2">Dạ em chào anh/chị! Em đã kiểm tra thông tin lớp học của bé <strong>Nguyễn Văn Bé Minh</strong> hôm nay:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-foreground/90 pl-1 mb-2">
                    <li><strong>Điểm danh:</strong> Bé có mặt đúng giờ ở lớp <em>Tiếng Anh Kids Cầu Giấy 1</em>.</li>
                    <li><strong>Nhận xét của cô giáo:</strong> &ldquo;Bé Minh rất tích cực phát biểu, nhớ nhanh từ vựng chủ đề Unit 3 và phát âm chuẩn.&rdquo;</li>
                    <li><strong>Bài tập về nhà:</strong> Bé đã hoàn thành bài tập Unit 3 đạt <strong>9.5/10 điểm</strong>. Tuần này bé cần ôn thêm 5 từ mới trang 24 sách bài tập ạ.</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">Lịch học tiếp theo của bé là vào <strong>Thứ 4 (15:00 - 16:30)</strong> tại Phòng 101. Anh/chị có cần em hỗ trợ gì thêm không ạ?</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: AUTH & HEADERS */}
      {activeTab === "auth" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Chuẩn Xác Thực API Key
              </CardTitle>
              <CardDescription>Mọi HTTP request đến hệ thống EduCenter đều yêu cầu Authorization Header.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="p-3 bg-muted rounded-md border font-mono text-xs text-foreground">
                <code>Authorization: Bearer sec_live_xxxxxxxxxxxx</code>
              </div>
              <p className="text-xs text-muted-foreground">
                API Key được cấp riêng cho từng đối tác hoặc Agent worker. Token được mã hóa chuẩn HMAC SHA-256 và giới hạn phạm vi quyền (Scopes).
              </p>
              <div className="border rounded-md p-3 text-xs space-y-2 bg-card">
                <div className="font-semibold text-foreground">Danh sách Scopes hỗ trợ:</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">students:read</Badge>
                  <Badge variant="outline">students:write</Badge>
                  <Badge variant="outline">orders:create</Badge>
                  <Badge variant="outline">attendance:read</Badge>
                  <Badge variant="outline">requests:create</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Môi Trường & Giới Hạn (Rate Limits)
              </CardTitle>
              <CardDescription>Thông số hạ tầng và quy định lưu lượng.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Production Base URL:</span>
                  <code className="font-bold text-foreground">https://api.educenter.vn</code>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Local / Staging URL:</span>
                  <code className="font-bold text-foreground">http://localhost:3000</code>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="font-semibold text-foreground">120 requests / phút / API Key</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Timeout:</span>
                  <span className="font-semibold text-foreground">10,000ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dữ liệu trả về (Content-Type):</span>
                  <code className="font-semibold text-foreground">application/json; charset=utf-8</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: ORCHEXA EMBEDDED AI */}
      {activeTab === "orchexa" && (
        <div className="flex flex-col gap-8">
          {/* Header Banner */}
          <Card className="border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Orchexa Embedded AI Platform</CardTitle>
                    <CardDescription className="text-sm">
                      Tích hợp AI Agent (Agent ID: <code className="font-mono font-semibold text-primary">911aa67c-1a89-4418-ac9e-f451c51a0629</code>) qua kiến trúc BFF bảo mật tuyệt đối.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-indigo-500 text-indigo-600 dark:text-indigo-400">
                    HMAC-SHA256 Signed
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    voice-agent.js SDK
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hệ thống BFF (Backend-for-Frontend) thực hiện ký HMAC SHA-256 đối với mọi yêu cầu khởi tạo phiên làm việc (Session Token), tiêm toàn bộ hồ sơ CRM của phụ huynh vào ngữ cảnh đầu tiên (Context Injection). Trình duyệt chỉ nhận `session_token` tạm thời, hoàn toàn không giữ Secret Key.
              </p>
            </CardContent>
          </Card>

          {/* Interactive Tester */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Kiểm thử trực tiếp Endpoint `/api/ai/bootstrap`
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Gửi request POST tới BFF để kiểm tra HMAC Signature và lấy Session Token từ Orchexa API.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  disabled={isBootstrapping}
                  onClick={async () => {
                    setIsBootstrapping(true);
                    setBootstrapResult(null);
                    try {
                      const res = await fetch("/api/ai/bootstrap", { method: "POST" });
                      const json = await res.json();
                      setBootstrapResult(JSON.stringify(json, null, 2));
                    } catch (err: any) {
                      setBootstrapResult(JSON.stringify({ error: err.message }, null, 2));
                    } finally {
                      setIsBootstrapping(false);
                    }
                  }}
                  className="gap-2 text-xs"
                >
                  {isBootstrapping ? "Đang kết nối..." : "Gửi Bootstrap Request"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bootstrapResult ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Kết quả trả về từ `/api/ai/bootstrap`:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => copyToClipboard(bootstrapResult, "bootstrap-res")}
                    >
                      {copiedKey === "bootstrap-res" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy Response
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-md bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border max-h-60">
                    {bootstrapResult}
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-md border border-dashed text-center text-xs text-muted-foreground">
                  Nhấn nút &ldquo;Gửi Bootstrap Request&rdquo; để kiểm tra luồng tạo session token thực tế với Orchexa API.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Security Pillars */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1 font-bold text-xs">1</div>
                <CardTitle className="text-sm">BFF HMAC-SHA256</CardTitle>
                <CardDescription className="text-xs">Bảo mật khóa bí mật ở Server</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Chuỗi canonical <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">POST\n/api/v1/embedded/sessions\n&#123;ts&#125;\n&#123;sha256(body)&#125;</code> được ký bằng <code>ORCHEXA_CLIENT_SECRET</code>. Không bao giờ để lộ secret ra frontend.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1 font-bold text-xs">2</div>
                <CardTitle className="text-sm">Rich Context Injection</CardTitle>
                <CardDescription className="text-xs">Tiêm hồ sơ phụ huynh & học sinh</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Dữ liệu học viên, lớp học, điểm danh gần nhất, bài tập, đơn hàng được đính kèm vào `initial_context.customer` giúp AI hiểu ngay từ tin nhắn đầu tiên.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="h-7 w-7 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-1 font-bold text-xs">3</div>
                <CardTitle className="text-sm">Native VoiceAgent SDK</CardTitle>
                <CardDescription className="text-xs">Quản lý phiên & lịch sử hội thoại</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                SDK tự động quản lý chuyển cuộc trò chuyện (&ldquo;Start new chat&rdquo;), xem lịch sử gần đây (&ldquo;View recent chats&rdquo;), auto-restore và auto-refresh token mỗi 5 phút.
              </CardContent>
            </Card>
          </div>

          {/* Environment Variables Reference */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Cấu hình Môi trường (.env & .env.local)
              </CardTitle>
              <CardDescription className="text-xs">
                Các biến môi trường cần thiết đã được thêm vào `.env` và `.env.example`.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-3.5 rounded-md bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border">
{`# Backend (BFF)
ORCHEXA_API_BASE=https://api.orchexa.io
ORCHEXA_CLIENT_ID=ocx_client_b4b15422d65cc136acab8ec5
ORCHEXA_CLIENT_SECRET=<paste from Orchexa Dashboard → Agent → Embedded AI → Embedded Clients tab>
ORCHEXA_AGENT_ID=911aa67c-1a89-4418-ac9e-f451c51a0629

# Frontend
NEXT_PUBLIC_ORCHEXA_AGENT_ID=911aa67c-1a89-4418-ac9e-f451c51a0629
NEXT_PUBLIC_ORCHEXA_API_BASE=https://api.orchexa.io
NEXT_PUBLIC_ORCHEXA_SDK_URL=https://api.orchexa.io/sdk/voice-agent.js`}
              </pre>
            </CardContent>
          </Card>

          {/* Mobile Embedding Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Tích hợp Mobile App (WebView)
              </CardTitle>
              <CardDescription className="text-xs">
                Đối với ứng dụng React Native hoặc Flutter trên mobile, sử dụng token lấy từ BFF để mở WebView trực tiếp.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1.5">React Native</h4>
                <pre className="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto border text-foreground">
{`import { WebView } from 'react-native-webview'

// sessionToken nhận từ API /api/ai/bootstrap
<WebView 
  source={{ 
    uri: \`https://chat.orchexa.io/c/\${sessionToken}\` 
  }} 
/>`}
                </pre>
              </div>
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Flutter</h4>
                <pre className="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto border text-foreground">
{`import 'package:webview_flutter/webview_flutter.dart';

// sessionToken nhận từ API /api/ai/bootstrap
WebViewController()
  ..loadRequest(
    Uri.parse('https://chat.orchexa.io/c/$sessionToken')
  );`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
