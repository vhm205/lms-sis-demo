"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck,
  Cpu,
  Sparkles,
  Bot,
  Terminal,
  Play,
  Lock,
  Zap,
  RefreshCw,
  Database,
  PhoneCall,
  Server,
  Layers,
  Send,
  ChevronDown,
  ChevronUp,
  KeyRound,
  FileCode2,
  ListTree,
  Network,
  Webhook,
  UserPlus,
  ShoppingCart
} from "lucide-react";

// ==========================================
// REST API Definitions & Test Defaults
// ==========================================
interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  desc: string;
  defaultVal: string;
}

interface ApiHeader {
  name: string;
  value: string;
  required: boolean;
  desc: string;
}

interface ApiDefinition {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  desc: string;
  headers: ApiHeader[];
  params?: ApiParam[];
  bodyTemplate?: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
}

const APIS: ApiDefinition[] = [
  {
    id: "webhook_lead_created",
    method: "POST",
    path: "/api/webhooks/orchexa/lead-created",
    title: "Webhook: Lead Created (Orchexa Event Trigger)",
    desc: "Nhận webhook tự động từ Orchexa khi AI Agent thu thập thông tin khách hàng tiềm năng.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng payload JSON" }
    ],
    bodyTemplate: {
      customer_name: "Nguyễn Văn A",
      phone: "0901234567",
      email: "khach@example.com",
      notes: "Khách cần báo giá gấp",
      conversation_id: "a1b2c3d4-0000",
      agent_id: "a1b2c3d4-0000",
      agent_name: "Nguyễn Văn A",
      channel: "Ví dụ channel",
      timestamp: "2026-08-29T10:30:00+07:00",
      dedup_key: "lead_dedup_01",
      student_name: "Nguyễn Văn A",
      student_class: "Ví dụ student_class"
    },
    sampleResponse: {
      event: "lead_created",
      success: true,
      message: "Đã tiếp nhận và tạo khách hàng tiềm năng (Lead) thành công từ Orchexa Webhook.",
      lead: {
        id: "cmtgvj6960001p6l6fgh1bcr6",
        name: "Nguyễn Văn A",
        phone: "0901234567",
        source: "ORCHEXA_VÍ DỤ CHANNEL",
        status: "NEW"
      },
      dedup_key: "lead_dedup_01"
    }
  },
  {
    id: "webhook_order_created",
    method: "POST",
    path: "/api/webhooks/orchexa/order-created",
    title: "Webhook: Order Created (Orchexa Event Trigger)",
    desc: "Nhận webhook tự động từ Orchexa khi AI Agent tạo đơn hàng hoặc đăng ký khóa học.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng payload JSON" }
    ],
    bodyTemplate: {
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
      dedup_key: "order_dedup_01"
    },
    sampleResponse: {
      event: "order_created",
      success: true,
      message: "Đã tiếp nhận và tạo đơn hàng (Order) thành công từ Orchexa Webhook.",
      order: {
        id: "cmtgvj6oz0004p6l6j9pc1d7n",
        code: "ORD-C3D40000",
        parentName: "Nguyễn Văn A",
        parentPhone: "0901234567",
        amount: 250000,
        status: "PENDING"
      },
      dedup_key: "order_dedup_01"
    }
  },
  {
    id: "search_students",
    method: "GET",
    path: "/api/students/search",
    title: "Tìm kiếm học viên",
    desc: "Tìm kiếm học viên theo họ tên, mã số học viên (VD: HV0001) hoặc số điện thoại phụ huynh.",
    headers: [
      { name: "Content-Type", value: "application/json", required: false, desc: "Kiểu nội dung dữ liệu" }
    ],
    params: [
      { name: "query", type: "string", required: true, desc: "Tên, mã HV hoặc SĐT phụ huynh", defaultVal: "Minh" }
    ],
    sampleResponse: {
      data: [
        {
          id: "cmtgpg6vo000up6z8a3fnbb5n",
          code: "HV0001",
          name: "Nguyễn Văn Bé Minh",
          phone: null,
          parent: {
            name: "Nguyễn Văn Phụ Huynh A",
            phone: "0901234567"
          },
          facility: {
            name: "Cơ sở Cầu Giấy",
            address: "123 Xuân Thủy, Cầu Giấy, Hà Nội"
          }
        }
      ]
    }
  },
  {
    id: "get_student_detail",
    method: "GET",
    path: "/api/students/:id",
    title: "Chi tiết hồ sơ học viên",
    desc: "Lấy chi tiết hồ sơ học viên, danh sách lớp đang theo học, lịch sử điểm danh và điểm bài tập.",
    headers: [
      { name: "Authorization", value: "Bearer 0901234567", required: false, desc: "Bearer Token hoặc SĐT phụ huynh để kiểm tra quyền truy cập Scoped RBAC" },
      { name: "x-parent-phone", value: "0901234567", required: false, desc: "Header nhận diện phụ huynh (User Context mode)" }
    ],
    params: [
      { name: "id", type: "string", required: true, desc: "Mã học viên hoặc CUID (VD: HV0001)", defaultVal: "HV0001" }
    ],
    sampleResponse: {
      data: {
        id: "cmtgpg6vo000up6z8a3fnbb5n",
        code: "HV0001",
        name: "Nguyễn Văn Bé Minh",
        classes: [
          {
            name: "Lớp Tiếng Anh Kids Cầu Giấy 1",
            code: "ENG-HN-01",
            course: { name: "Tiếng Anh Thiếu Nhi Mầm Non" }
          }
        ],
        attendances: [
          {
            status: "PRESENT",
            schedule: { date: "2024-10-01T08:00:00.000Z", room: { name: "Phòng 101" } }
          }
        ],
        assignments: [
          { title: "Bài tập Unit 1", score: 8.5, status: "COMPLETED" }
        ]
      }
    }
  },
  {
    id: "parent_my_children",
    method: "GET",
    path: "/api/parent/my-children",
    title: "Hồ sơ con của phụ huynh (Self-Service)",
    desc: "API tự phục vụ dành cho phụ huynh và AI Voice Agent để tra cứu danh sách các con thuộc SĐT phụ huynh.",
    headers: [
      { name: "Authorization", value: "Bearer 0901234567", required: true, desc: "Bearer token hoặc SĐT phụ huynh đã định danh (VD: Bearer 0901234567)" },
      { name: "x-parent-phone", value: "0901234567", required: false, desc: "Header thay thế cho Bearer token (User Context mode)" }
    ],
    sampleResponse: {
      data: {
        parent: {
          id: "cmtgpg6vm000rp6z807812xof",
          name: "Nguyễn Văn Phụ Huynh A",
          phone: "0901234567",
          email: null
        },
        childrenCount: 2,
        children: [
          {
            id: "cmtgpg6vo000up6z8a3fnbb5n",
            code: "HV0001",
            name: "Nguyễn Văn Bé Minh",
            facility: { name: "Cơ sở Cầu Giấy" },
            classes: [{ name: "Lớp Tiếng Anh Kids Cầu Giấy 1" }]
          },
          {
            id: "cmtgpg6vp000wp6z8u0bp9gzr",
            code: "HV0002",
            name: "Nguyễn Thị Bé Lan",
            facility: { name: "Cơ sở Cầu Giấy" },
            classes: [{ name: "Lớp Tiếng Anh Kids Cầu Giấy 1" }]
          }
        ]
      }
    }
  },
  {
    id: "requests_makeup",
    method: "POST",
    path: "/api/requests/makeup",
    title: "Đăng ký xếp lịch học bù",
    desc: "Tạo yêu cầu xếp lịch học bù cho học viên (hệ thống tự động tra cứu buổi nghỉ và buổi học bù mục tiêu theo ngày/lớp nếu không có sẵn CUID). Hỗ trợ truyền studentCode, missedDate, targetDate, targetClassCode, targetScheduleId, missedScheduleId.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng payload JSON" },
      { name: "Authorization", value: "Bearer 0901234567", required: false, desc: "Xác thực phụ huynh để chống gửi yêu cầu trái phép" }
    ],
    bodyTemplate: {
      studentCode: "HV0006",
      targetDate: "2026-09-08",
      targetClassCode: "HCM-MOV-BT01",
      notes: "Xin học bù buổi ngày 03/09"
    },
    sampleResponse: {
      success: true,
      requestId: "cmtgpg6vx001ep6z8req01",
      status: "PENDING",
      studentName: "Đặng Gia Huy",
      studentCode: "HV0006",
      targetClass: "Lớp Tiếng Anh Cambridge Movers 01 (HCM-MOV-BT01)",
      targetFacility: "Cơ sở Bình Thạnh",
      targetDate: "2026-09-08T18:00:00.000Z",
      targetRoom: "Phòng BT-101 (Movers Class)",
      message: "Đã tạo yêu cầu học bù thành công cho học viên Đặng Gia Huy (HV0006) vào Lớp Tiếng Anh Cambridge Movers 01 (HCM-MOV-BT01)."
    }
  },
  {
    id: "requests_support",
    method: "POST",
    path: "/api/requests/support",
    title: "Tạo ticket hỗ trợ & Xin nghỉ phép",
    desc: "Tiếp nhận yêu cầu xin nghỉ phép, bảo lưu, thắc mắc học phí từ AI Voice Agent hoặc Website. Hỗ trợ studentCode (HV0001) hoặc studentId.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng payload JSON" },
      { name: "Authorization", value: "Bearer 0901234567", required: false, desc: "Xác thực phụ huynh (tuỳ chọn)" }
    ],
    bodyTemplate: {
      studentCode: "HV0001",
      type: "LEAVE",
      content: "Xin nghỉ phép buổi ngày 08/10 do gia đình đi du lịch.",
      priority: "NORMAL"
    },
    sampleResponse: {
      data: {
        id: "cmtgpg6vz001gp6z8sup01",
        studentId: "cmtgpg6vo000up6z8a3fnbb5n",
        type: "LEAVE",
        content: "Xin nghỉ phép buổi ngày 08/10 do gia đình đi du lịch.",
        priority: "NORMAL",
        status: "NEW"
      }
    }
  },
  {
    id: "orders_create",
    method: "POST",
    path: "/api/orders",
    title: "Tạo đơn đăng ký khóa học (Direct API)",
    desc: "Tạo đơn hàng đăng ký khóa học mới khi AI Agent hoặc tư vấn viên chốt ghi danh học viên thành công. Hỗ trợ courseCode và facilityName.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng payload JSON" }
    ],
    bodyTemplate: {
      parentName: "Trần Thị Mai",
      parentPhone: "0912345678",
      courseCode: "IELTS-INT",
      facilityName: "Cơ sở Cầu Giấy",
      amount: 8000000,
      notes: "Đăng ký khóa IELTS qua AI Voice Assistant"
    },
    sampleResponse: {
      data: {
        id: "cmtgpg6vy001fp6z8ord01",
        code: "ORD-882194",
        parentName: "Trần Thị Mai",
        parentPhone: "0912345678",
        amount: 8000000,
        status: "PENDING"
      }
    }
  },
  {
    id: "generate_student_report",
    method: "POST",
    path: "/api/students/reports/generate",
    title: "Xuất báo cáo học tập học viên (Preview Link & PDF)",
    desc: "Tạo báo cáo kết quả học tập (Academic Results) hoặc tổng quan quá trình/tình hình hiện tại (Progress Overview) kèm liên kết xem trước (preview link) và bản PDF cho Orchexa Agent / Phụ huynh / Admin. Hỗ trợ studentCode (HV0001) hoặc studentId.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true, desc: "Định dạng payload JSON" },
      { name: "Authorization", value: "Bearer <token>", required: false, desc: "Admin Key hoặc Parent Token" }
    ],
    bodyTemplate: {
      studentCode: "HV0001",
      type: "ACADEMIC_RESULTS"
    },
    sampleResponse: {
      success: true,
      reportId: "REP-ACAD-HV0001-XXXX",
      type: "ACADEMIC_RESULTS",
      typeName: "Báo cáo Kết quả Học tập",
      title: "Báo cáo Kết quả Học tập - Nguyễn Văn Bé Minh (HV0001)",
      previewUrl: "/reports/preview/HV0001?type=academic",
      pdfUrl: "/reports/preview/HV0001?type=academic&print=true",
      summaryText: "Báo cáo Kết quả Học tập của học viên Nguyễn Văn Bé Minh (HV0001): Điểm TB 8.8/10 (Giỏi)...",
      shortHighlights: [
        "Điểm trung bình: 8.8/10 (Xếp loại: Giỏi)",
        "Số bài kiểm tra: 7/7 hoàn thành",
        "Tỷ lệ đạt chuẩn: 100%"
      ]
    }
  },
  {
    id: "get_campaigns",
    method: "GET",
    path: "/api/campaigns",
    title: "Danh sách Chiến dịch & Sự kiện Khuyến Mãi",
    desc: "Lấy danh sách các chiến dịch, sự kiện ưu đãi đang hoạt động hoặc toàn hệ thống.",
    headers: [
      { name: "Content-Type", value: "application/json", required: false, desc: "Định dạng JSON" }
    ],
    params: [
      { name: "status", type: "string", required: false, desc: "Trạng thái chiến dịch (ACTIVE, PAUSED, ALL)", defaultVal: "ACTIVE" }
    ],
    sampleResponse: {
      success: true,
      count: 3,
      data: [
        {
          id: "camp_001",
          code: "CAMP-BACK2SCHOOL-2025",
          title: "Mùa Tựu Trường 2025 - Bứt Phá Cambridge",
          badge: "HOT EVENT 20%",
          status: "ACTIVE",
          itemsCount: 2
        }
      ]
    }
  },
  {
    id: "get_campaign_products",
    method: "GET",
    path: "/api/campaigns/products",
    title: "Sản phẩm Ưu đãi Đề xuất (Rich Card Carousel Feed)",
    desc: "API công khai trả về danh sách các khóa học / sản phẩm ưu đãi theo đúng đặc tả mapping trường của Orchexa Rich Card Carousel.",
    headers: [
      { name: "Content-Type", value: "application/json", required: false, desc: "Định dạng JSON" }
    ],
    params: [
      { name: "targetAudience", type: "string", required: false, desc: "Lọc đối tượng: KIDS, TEEN, ADULT_MBA, ALL", defaultVal: "KIDS" },
      { name: "limit", type: "number", required: false, desc: "Số lượng sản phẩm đề xuất tối đa", defaultVal: "6" }
    ],
    sampleResponse: {
      success: true,
      campaign: {
        code: "CAMP-BACK2SCHOOL-2025",
        title: "Mùa Tựu Trường 2025 - Bứt Phá Cambridge",
        badge: "HOT EVENT 20%"
      },
      count: 2,
      products: [
        {
          id: "prod_001",
          name: "Cambridge Movers Chuẩn Quốc Tế",
          title: "Lớp Movers (7-9 tuổi)",
          course_name: "Cambridge Movers Chuẩn Quốc Tế",
          product_code: "ENG-CAM-MOVERS-PROMO",
          description: "Tặng ngay học bổng 20% học phí + Bộ giáo trình bản quyền và balo phản quang.",
          list_price: 4500000,
          sale_price: 3600000,
          price: 3600000,
          discount_percent: 20,
          stock: 8,
          featured: true
        }
      ]
    }
  }
];

// ==========================================
// MCP Tools & JSON-RPC Definitions
// ==========================================
interface McpTool {
  name: string;
  aliases?: string[];
  desc: string;
  inputSchema: Record<string, unknown>;
  defaultArgs: Record<string, unknown>;
}

const MCP_TOOLS_CATALOG: McpTool[] = [
  {
    name: "search_students",
    desc: "Tìm kiếm học viên theo họ tên, mã số HV (VD: HV0001) hoặc số điện thoại phụ huynh.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Từ khóa tìm kiếm (tên, mã HV, SĐT phụ huynh)" }
      },
      required: ["query"]
    },
    defaultArgs: { query: "Minh" }
  },
  {
    name: "get_student_info",
    aliases: ["get_student_profile"],
    desc: "Truy xuất đầy đủ hồ sơ học tập, lịch học trong tuần, kết quả điểm danh và điểm bài tập.",
    inputSchema: {
      type: "object",
      properties: {
        studentCode: { type: "string", description: "Mã học viên (VD: HV0001, HV0002)" },
        studentId: { type: "string", description: "ID học viên trong CSDL (cuid, tùy chọn thay thế)" }
      }
    },
    defaultArgs: { studentCode: "HV0001" }
  },
  {
    name: "get_parent_children",
    desc: "Tra cứu danh sách các con và lịch học thuộc số điện thoại phụ huynh (Self-Service).",
    inputSchema: {
      type: "object",
      properties: {
        phone: { type: "string", description: "Số điện thoại phụ huynh (VD: 0901234567)" }
      },
      required: ["phone"]
    },
    defaultArgs: { phone: "0901234567" }
  },
  {
    name: "find_available_classes",
    aliases: ["list_available_classes", "list_makeup_slots", "get_classes_schedule"],
    desc: "Tìm các lớp học đang mở và còn chỗ trống cho một khóa học cụ thể, bao gồm lịch học chi tiết các buổi sắp tới (scheduleId, date, time) để chọn xếp lịch học bù.",
    inputSchema: {
      type: "object",
      properties: {
        courseCode: { type: "string", description: "Mã khóa học (VD: ENG-CAM-MOVERS, ENG-KID-01, IELTS-INT)" },
        courseId: { type: "string", description: "ID khóa học trong CSDL (cuid, tùy chọn thay thế cho courseCode)" },
        facilityName: { type: "string", description: "Tên cơ sở học cần lọc (VD: Bình Thạnh, Cầu Giấy)" }
      }
    },
    defaultArgs: { courseCode: "ENG-CAM-MOVERS" }
  },
  {
    name: "create_makeup_request",
    aliases: ["request_makeup_class", "request_makeup", "create_makeup", "register_makeup_class", "create_makeup_class_request"],
    desc: "Tạo yêu cầu xếp lịch học bù cho học viên (hệ thống tự động kiểm tra và khớp buổi nghỉ cũng như lịch học bù theo ngày/lớp nếu không có sẵn CUID). Hỗ trợ truyền studentCode, missedDate, targetDate, targetClassCode, targetScheduleId, missedScheduleId.",
    inputSchema: {
      type: "object",
      properties: {
        studentCode: { type: "string", description: "Mã học viên (VD: HV0001, HV0006) hoặc ID học viên" },
        studentId: { type: "string", description: "ID học viên trong CSDL (tùy chọn thay thế cho studentCode)" },
        studentName: { type: "string", description: "Họ tên học sinh (VD: Gia Huy, Đặng Gia Huy)" },
        missedScheduleId: { type: "string", description: "ID buổi học đã nghỉ (tùy chọn nếu truyền missedDate hoặc để hệ thống tự động tìm)" },
        missedDate: { type: "string", description: "Ngày nghỉ của học viên (VD: 2026-09-03, 2026-09-01, 03/09) nếu chưa có missedScheduleId" },
        targetScheduleId: { type: "string", description: "ID buổi học mục tiêu muốn học bù (lấy từ find_available_classes)" },
        targetDate: { type: "string", description: "Ngày muốn học bù (VD: 2026-09-08, 08/09) nếu chưa có targetScheduleId" },
        targetClassCode: { type: "string", description: "Mã hoặc tên lớp muốn học bù (VD: HCM-MOV-BT-WK, HCM-MOV-BT01, hoặc Cambridge Movers Bù)" },
        notes: { type: "string", description: "Lý do học bù hoặc ghi chú của phụ huynh" }
      }
    },
    defaultArgs: {
      studentCode: "HV0006",
      targetDate: "2026-09-08",
      targetClassCode: "HCM-MOV-BT01",
      notes: "Xin học bù buổi ngày 03/09"
    }
  },
  {
    name: "create_order",
    aliases: ["create_lead_or_order"],
    desc: "Ghi nhận khách hàng tiềm năng hoặc tạo đơn đặt chỗ khóa học mới khi AI Agent chốt ghi danh.",
    inputSchema: {
      type: "object",
      properties: {
        parentName: { type: "string", description: "Họ tên phụ huynh" },
        parentPhone: { type: "string", description: "Số điện thoại phụ huynh" },
        courseCode: { type: "string", description: "Mã khóa học (VD: IELTS-INT, ENG-CAM-MOVERS, ENG-KID-01)" },
        courseId: { type: "string", description: "ID khóa học trong CSDL (tùy chọn thay thế cho courseCode)" },
        facilityName: { type: "string", description: "Tên cơ sở học (VD: Cơ sở Cầu Giấy, Bình Thạnh)" },
        facilityCode: { type: "string", description: "Mã cơ sở học (VD: CS-CG, CS-BT)" },
        facilityId: { type: "string", description: "ID hoặc mã cơ sở (tùy chọn)" },
        amount: { type: "number", description: "Học phí (VND)" },
        notes: { type: "string", description: "Ghi chú đơn hàng" }
      }
    },
    defaultArgs: {
      parentName: "Trần Thị Mai",
      parentPhone: "0912345678",
      courseCode: "IELTS-INT",
      facilityName: "Cơ sở Cầu Giấy",
      amount: 8000000,
      notes: "Đăng ký qua Orchexa AI Agent"
    }
  },
  {
    name: "create_support_request",
    desc: "Tiếp nhận yêu cầu xin nghỉ phép, hỗ trợ học vụ hoặc thắc mắc học phí.",
    inputSchema: {
      type: "object",
      properties: {
        studentCode: { type: "string", description: "Mã học viên (VD: HV0001)" },
        studentId: { type: "string", description: "ID học viên trong CSDL (tùy chọn thay thế cho studentCode)" },
        type: { type: "string", enum: ["LEAVE", "INFO", "SUPPORT", "COMPLAINT", "CALL_BACK"], description: "Loại yêu cầu" },
        content: { type: "string", description: "Nội dung chi tiết" },
        priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "URGENT"], description: "Mức độ ưu tiên" }
      },
      required: ["content"]
    },
    defaultArgs: {
      studentCode: "HV0001",
      type: "LEAVE",
      content: "Xin nghỉ phép buổi ngày 08/10 do bận việc gia đình",
      priority: "NORMAL"
    }
  },
  {
    name: "generate_student_report",
    aliases: ["export_student_report", "get_student_report", "view_student_report"],
    desc: "Tạo và xuất báo cáo học tập hoặc nhận xét về học sinh chỉ định (trả về tóm tắt kèm preview link và PDF link). Hỗ trợ 2 loại: ACADEMIC_RESULTS (Báo cáo kết quả học tập, điểm số, nhận xét chi tiết) và PROGRESS_OVERVIEW (Báo cáo tổng quan quá trình, chuyên cần, tiến độ, tình hình hiện tại).",
    inputSchema: {
      type: "object",
      properties: {
        studentCode: { type: "string", description: "Mã học viên (VD: HV0001), ID hoặc tên học viên" },
        studentId: { type: "string", description: "ID học viên trong CSDL hoặc tên học viên (tùy chọn)" },
        type: { type: "string", enum: ["ACADEMIC_RESULTS", "PROGRESS_OVERVIEW"], description: "Loại báo cáo: ACADEMIC_RESULTS hoặc PROGRESS_OVERVIEW" }
      }
    },
    defaultArgs: {
      studentCode: "HV0001",
      type: "ACADEMIC_RESULTS"
    }
  },
  {
    name: "get_promotions",
    aliases: ["get_recommended_products", "list_campaign_courses"],
    desc: "Tra cứu danh sách các chiến dịch khuyến mãi, sự kiện giảm giá và danh sách khóa học/sản phẩm đề xuất ưu đãi (chuẩn định dạng Product Carousel Rich Card cho Orchexa AI Agent).",
    inputSchema: {
      type: "object",
      properties: {
        campaignCode: { type: "string", description: "Mã chiến dịch cụ thể (VD: CAMP-BACK2SCHOOL-2025, CAMP-RETENTION-MBA)" },
        targetAudience: { type: "string", enum: ["KIDS", "TEEN", "ADULT_MBA", "ALL"], description: "Đối tượng học viên cần tư vấn ưu đãi (KIDS, TEEN, ADULT_MBA, ALL)" },
        facilityName: { type: "string", description: "Tên cơ sở học (VD: Cầu Giấy, Bình Thạnh, Quận 7)" },
        facilityCode: { type: "string", description: "Mã cơ sở học (VD: CS-CG, CS-BT)" },
        facilityId: { type: "string", description: "ID cơ sở trong CSDL (tùy chọn)" },
        limit: { type: "number", description: "Số lượng sản phẩm tối đa trả về (mặc định 6)" }
      }
    },
    defaultArgs: {
      targetAudience: "KIDS"
    }
  }
];

export function DeveloperClient() {
  const [activeTab, setActiveTab] = useState<"orchexa" | "api" | "mcp" | "webhooks" | "auth">("orchexa");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Orchexa Bootstrap Test State
  const [bootstrapResult, setBootstrapResult] = useState<Record<string, unknown> | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(false);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Webhook Tab Dedicated State & Collapse Controls
  const [openWebhookGuide, setOpenWebhookGuide] = useState<boolean>(true);
  const [openWebhooks, setOpenWebhooks] = useState<Record<string, boolean>>({
    "lead-created": true,
    "order-created": true,
  });
  const [leadWebhookPayload, setLeadWebhookPayload] = useState<string>(JSON.stringify({
    customer_name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "khach@example.com",
    notes: "Khách cần báo giá gấp",
    conversation_id: "a1b2c3d4-0000",
    agent_id: "a1b2c3d4-0000",
    agent_name: "Nguyễn Văn A",
    channel: "Ví dụ channel",
    timestamp: "2026-08-29T10:30:00+07:00",
    dedup_key: "lead_dedup_01",
    student_name: "Nguyễn Văn A",
    student_class: "Ví dụ student_class"
  }, null, 2));
  const [leadWebhookLoading, setLeadWebhookLoading] = useState(false);
  const [leadWebhookResult, setLeadWebhookResult] = useState<Record<string, unknown> | null>(null);
  const [leadWebhookStatus, setLeadWebhookStatus] = useState<number | null>(null);
  const [leadWebhookLatency, setLeadWebhookLatency] = useState<number | null>(null);

  const [orderWebhookPayload, setOrderWebhookPayload] = useState<string>(JSON.stringify({
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
    dedup_key: "order_dedup_01"
  }, null, 2));
  const [orderWebhookLoading, setOrderWebhookLoading] = useState(false);
  const [orderWebhookResult, setOrderWebhookResult] = useState<Record<string, unknown> | null>(null);
  const [orderWebhookStatus, setOrderWebhookStatus] = useState<number | null>(null);
  const [orderWebhookLatency, setOrderWebhookLatency] = useState<number | null>(null);

  // REST API Tester State
  const [apiStates, setApiStates] = useState<Record<string, {
    authMode: string;
    customAuth: string;
    params: Record<string, string>;
    bodyText: string;
    loading: boolean;
    response: Record<string, unknown> | null;
    status: number | null;
    latency: number | null;
    openTester: boolean;
  }>>(() => {
    const initial: Record<string, any> = {};
    APIS.forEach(api => {
      const initialParams: Record<string, string> = {};
      api.params?.forEach(p => {
        initialParams[p.name] = p.defaultVal;
      });
      initial[api.id] = {
        authMode: api.id === "parent_my_children" ? "bearer_parent_a" : "none",
        customAuth: "",
        params: initialParams,
        bodyText: api.bodyTemplate ? JSON.stringify(api.bodyTemplate, null, 2) : "",
        loading: false,
        response: null,
        status: null,
        latency: null,
        openTester: true,
      };
    });
    return initial;
  });

  // MCP Tester State
  const [selectedMcpTool, setSelectedMcpTool] = useState<string>("search_students");
  const [mcpMethod, setMcpMethod] = useState<string>("tools/call");
  const [mcpAuthMode, setMcpAuthMode] = useState<string>("bearer_system");
  const [mcpCustomHeader, setMcpCustomHeader] = useState<string>("");
  const [mcpArgsText, setMcpArgsText] = useState<string>(
    JSON.stringify(MCP_TOOLS_CATALOG[0].defaultArgs, null, 2)
  );
  const [mcpTransport, setMcpTransport] = useState<"http" | "sse">("http");
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [mcpResult, setMcpResult] = useState<Record<string, unknown> | null>(null);
  const [mcpStatus, setMcpStatus] = useState<number | null>(null);
  const [mcpLatency, setMcpLatency] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Bootstrap Orchexa
  const handleTestBootstrap = async () => {
    setIsBootstrapping(true);
    setBootstrapResult(null);
    setTestLatency(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/ai/bootstrap", { method: "POST" });
      const duration = Math.round(performance.now() - start);
      setTestLatency(duration);
      const json = await res.json();
      setBootstrapResult(json as Record<string, unknown>);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setBootstrapResult({ error: errorMsg });
    } finally {
      setIsBootstrapping(false);
    }
  };

  // Test Lead Webhook
  const handleTestLeadWebhook = async () => {
    setLeadWebhookLoading(true);
    setLeadWebhookResult(null);
    setLeadWebhookStatus(null);
    setLeadWebhookLatency(null);
    const start = performance.now();
    try {
      const parsed = JSON.parse(leadWebhookPayload);
      const res = await fetch("/api/webhooks/orchexa/lead-created", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const duration = Math.round(performance.now() - start);
      const json = await res.json();
      setLeadWebhookLatency(duration);
      setLeadWebhookStatus(res.status);
      setLeadWebhookResult(json as Record<string, unknown>);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setLeadWebhookLatency(duration);
      setLeadWebhookStatus(500);
      setLeadWebhookResult({ error: errorMsg });
    } finally {
      setLeadWebhookLoading(false);
    }
  };

  // Test Order Webhook
  const handleTestOrderWebhook = async () => {
    setOrderWebhookLoading(true);
    setOrderWebhookResult(null);
    setOrderWebhookStatus(null);
    setOrderWebhookLatency(null);
    const start = performance.now();
    try {
      const parsed = JSON.parse(orderWebhookPayload);
      const res = await fetch("/api/webhooks/orchexa/order-created", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const duration = Math.round(performance.now() - start);
      const json = await res.json();
      setOrderWebhookLatency(duration);
      setOrderWebhookStatus(res.status);
      setOrderWebhookResult(json as Record<string, unknown>);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setOrderWebhookLatency(duration);
      setOrderWebhookStatus(500);
      setOrderWebhookResult({ error: errorMsg });
    } finally {
      setOrderWebhookLoading(false);
    }
  };

  // Execute REST API Call
  const handleExecuteApi = async (api: ApiDefinition) => {
    const state = apiStates[api.id];
    if (!state) return;

    setApiStates(prev => ({
      ...prev,
      [api.id]: { ...prev[api.id], loading: true, response: null, status: null, latency: null }
    }));

    // Build URL
    let url = api.path;
    if (api.path.includes(":id")) {
      url = api.path.replace(":id", encodeURIComponent(state.params.id || "cmtgpg6vo000up6z8a3fnbb5n"));
    } else if (api.method === "GET" && api.params) {
      const searchParams = new URLSearchParams();
      api.params.forEach(p => {
        const val = state.params[p.name];
        if (val) searchParams.append(p.name, val);
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    // Build Headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (state.authMode === "bearer_system") {
      headers["Authorization"] = "Bearer ocx_sys_educenter_9f3b8a1c7e6d4205bb9910f8";
    } else if (state.authMode === "bearer_parent_a") {
      headers["Authorization"] = "Bearer 0901234567";
    } else if (state.authMode === "bearer_parent_b") {
      headers["Authorization"] = "Bearer 0912345678";
    } else if (state.authMode === "bearer_parent_nga") {
      headers["Authorization"] = "Bearer 0945678901";
    } else if (state.authMode === "header_parent_phone") {
      headers["x-parent-phone"] = "0901234567";
    } else if (state.authMode === "custom" && state.customAuth) {
      headers["Authorization"] = state.customAuth.startsWith("Bearer ") ? state.customAuth : `Bearer ${state.customAuth}`;
    }

    const start = performance.now();
    try {
      const fetchOpts: RequestInit = {
        method: api.method,
        headers,
      };

      if (api.method === "POST" && state.bodyText) {
        fetchOpts.body = state.bodyText;
      }

      const res = await fetch(url, fetchOpts);
      const duration = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));

      setApiStates(prev => ({
        ...prev,
        [api.id]: {
          ...prev[api.id],
          loading: false,
          response: data as Record<string, unknown>,
          status: res.status,
          latency: duration
        }
      }));
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setApiStates(prev => ({
        ...prev,
        [api.id]: {
          ...prev[api.id],
          loading: false,
          response: { error: errorMsg },
          status: 500,
          latency: duration
        }
      }));
    }
  };

  // Execute MCP JSON-RPC Call
  const handleExecuteMcp = async () => {
    setMcpLoading(true);
    setMcpResult(null);
    setMcpStatus(null);
    setMcpLatency(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (mcpAuthMode === "bearer_system") {
      headers["Authorization"] = "Bearer ocx_sys_educenter_9f3b8a1c7e6d4205bb9910f8";
    } else if (mcpAuthMode === "bearer_parent_a") {
      headers["Authorization"] = "Bearer 0901234567";
    } else if (mcpAuthMode === "header_parent_phone") {
      headers["x-parent-phone"] = "0901234567";
    } else if (mcpAuthMode === "custom" && mcpCustomHeader) {
      headers["Authorization"] = mcpCustomHeader.startsWith("Bearer ") ? mcpCustomHeader : `Bearer ${mcpCustomHeader}`;
    }

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(mcpArgsText);
    } catch {
      parsedArgs = {};
    }

    const jsonRpcPayload: Record<string, unknown> = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: mcpMethod,
    };

    if (mcpMethod === "tools/call") {
      jsonRpcPayload.params = {
        name: selectedMcpTool,
        arguments: parsedArgs,
        _meta: {
          orchexa: {
            actor: {
              phone: "0901234567",
              channel: "voice_agent"
            }
          }
        }
      };
    } else if (mcpMethod === "initialize") {
      jsonRpcPayload.params = {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "orchexa-web-tester", version: "1.0.0" }
      };
    } else {
      jsonRpcPayload.params = {};
    }

    const endpoint = mcpTransport === "sse" ? "/api/mcp/sse" : "/api/mcp";
    const start = performance.now();

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(jsonRpcPayload)
      });
      const duration = Math.round(performance.now() - start);
      const json = await res.json();

      setMcpLatency(duration);
      setMcpStatus(res.status);
      setMcpResult(json as Record<string, unknown>);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMcpLatency(duration);
      setMcpStatus(500);
      setMcpResult({ error: errorMsg });
    } finally {
      setMcpLoading(false);
    }
  };

  const handleSelectTool = (toolName: string) => {
    setSelectedMcpTool(toolName);
    setMcpMethod("tools/call");
    const found = MCP_TOOLS_CATALOG.find(t => t.name === toolName);
    if (found) {
      setMcpArgsText(JSON.stringify(found.defaultArgs, null, 2));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5ED] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2A1E16] dark:via-[#211D1A] dark:to-[#0F242C] border-2 border-[#EEDBCC] dark:border-[#3E3228] p-6 sm:p-10 shadow-[0_12px_32px_rgba(215,160,120,0.12)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="orange" className="font-extrabold px-3 py-1 text-xs">
                <Bot className="h-3.5 w-3.5 mr-1" /> Orchexa Embedded AI
              </Badge>
              <Badge variant="pink" className="font-extrabold px-3 py-1 text-xs">
                <Webhook className="h-3.5 w-3.5 mr-1" /> Event Trigger Webhooks
              </Badge>
              <Badge variant="aqua" className="font-extrabold px-3 py-1 text-xs">
                <Cpu className="h-3.5 w-3.5 mr-1" /> MCP Protocol Ready
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
              Trung tâm Tích hợp & Điều hành AI Agent
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl font-medium leading-relaxed">
              Tài liệu kỹ thuật, bộ công cụ kiểm thử trực tiếp Webhooks Event Trigger (Lead & Order Created), Model Context Protocol (Streamable HTTP / SSE) và REST APIs với đầy đủ Headers & Body payload.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-3xl bg-card border-2 border-border/80 text-xs shadow-md space-y-1.5">
              <div className="text-muted-foreground text-[11px] font-bold font-heading">AI AGENT ID:</div>
              <div className="font-mono font-bold text-primary flex items-center gap-2">
                <span className="text-xs">911aa67c-1a89-4418-ac9e-f451c51a0629</span>
                <button 
                  onClick={() => copyToClipboard("911aa67c-1a89-4418-ac9e-f451c51a0629", "agent-id")}
                  className="hover:text-foreground text-muted-foreground transition-colors p-1 hover:bg-muted rounded-lg"
                  title="Sao chép Agent ID"
                >
                  {copiedKey === "agent-id" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#F2994A]/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Modern Clay Tabs Navigation */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-border/70 pb-3">
        <Button 
          variant={activeTab === "orchexa" ? "default" : "outline"} 
          size="default"
          onClick={() => setActiveTab("orchexa")}
          className={`gap-2 rounded-2xl text-xs font-extrabold h-10 px-4 ${
            activeTab === "orchexa" 
              ? "clay-btn-primary" 
              : "clay-btn-outline"
          }`}
        >
          <Bot className="h-4 w-4" /> Orchexa Embedded AI
        </Button>
        <Button 
          variant={activeTab === "webhooks" ? "default" : "outline"} 
          size="default"
          onClick={() => setActiveTab("webhooks")}
          className={`gap-2 rounded-2xl text-xs font-extrabold h-10 px-4 ${
            activeTab === "webhooks" ? "clay-btn-primary" : "clay-btn-outline"
          }`}
        >
          <Webhook className="h-4 w-4" /> Event Trigger Webhooks
        </Button>
        <Button 
          variant={activeTab === "api" ? "default" : "outline"} 
          size="default"
          onClick={() => setActiveTab("api")}
          className={`gap-2 rounded-2xl text-xs font-extrabold h-10 px-4 ${
            activeTab === "api" ? "clay-btn-primary" : "clay-btn-outline"
          }`}
        >
          <Globe className="h-4 w-4" /> REST APIs Explorer
        </Button>
        <Button 
          variant={activeTab === "mcp" ? "default" : "outline"} 
          size="default"
          onClick={() => setActiveTab("mcp")}
          className={`gap-2 rounded-2xl text-xs font-extrabold h-10 px-4 ${
            activeTab === "mcp" ? "clay-btn-primary" : "clay-btn-outline"
          }`}
        >
          <Cpu className="h-4 w-4" /> Model Context Protocol (MCP)
        </Button>
        <Button 
          variant={activeTab === "auth" ? "default" : "outline"} 
          size="default"
          onClick={() => setActiveTab("auth")}
          className={`gap-2 rounded-2xl text-xs font-extrabold h-10 px-4 ${
            activeTab === "auth" ? "clay-btn-primary" : "clay-btn-outline"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Security & HMAC Auth
        </Button>
      </div>

      {/* =========================================================
          Tab 1: Orchexa Embedded AI
         ========================================================= */}
      {activeTab === "orchexa" && (
        <div className="flex flex-col gap-6">
          {/* Architecture Flow Banner */}
          <Card className="clay-card border-2 border-[#FCDCC8] dark:border-[#523824] bg-gradient-to-br from-[#FFF0E6] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2B1B11] dark:via-[#211D1A] dark:to-[#0D242C] shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="clay-icon-tile h-10 w-10 bg-gradient-to-tr from-[#F2994A] to-[#E08E58] text-white shadow-md border border-white/40">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black font-heading">Kiến trúc Tích hợp Embedded AI 4 Bước</CardTitle>
                  <CardDescription className="text-xs font-semibold text-muted-foreground">
                    Mô hình bảo mật tuyệt đối BFF (Backend-For-Frontend) giúp giữ bí mật khóa API và tiêm ngữ cảnh CRM chính xác.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                <div className="p-4 rounded-2xl bg-card border-2 border-border/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#D97736] font-heading">BƯỚC 1</span>
                    <Lock className="h-4 w-4 text-[#D97736]" />
                  </div>
                  <div className="font-extrabold text-xs text-foreground font-heading">BFF HMAC Ký Token</div>
                  <p className="text-[11px] text-muted-foreground font-medium leading-snug">
                    Next.js API Route ký chữ ký SHA-256 an toàn bằng khóa bí mật phía máy chủ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border-2 border-border/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FDF2F8] text-[#DB2777] font-heading">BƯỚC 2</span>
                    <Database className="h-4 w-4 text-[#DB2777]" />
                  </div>
                  <div className="font-extrabold text-xs text-foreground font-heading">Context Injection</div>
                  <p className="text-[11px] text-muted-foreground font-medium leading-snug">
                    Tự động đính kèm hồ sơ học viên, lớp học, điểm số vào <code>initial_context</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border-2 border-border/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E6F8FB] text-[#0284C7] font-heading">BƯỚC 3</span>
                    <PhoneCall className="h-4 w-4 text-[#0284C7]" />
                  </div>
                  <div className="font-extrabold text-xs text-foreground font-heading">VoiceAgent SDK</div>
                  <p className="text-[11px] text-muted-foreground font-medium leading-snug">
                    SDK Client khởi chạy voice widget tương tác thời gian thực với độ trễ thấp (&lt;500ms).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border-2 border-border/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] font-heading">BƯỚC 4</span>
                    <Server className="h-4 w-4 text-[#16A34A]" />
                  </div>
                  <div className="font-extrabold text-xs text-foreground font-heading">Tool & Webhooks Calling</div>
                  <p className="text-[11px] text-muted-foreground font-medium leading-snug">
                    Agent tự động bắn Webhooks tạo Lead, tạo Order hoặc gọi MCP tools theo thời gian thực.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Interactive Test Console */}
          <Card className="clay-card overflow-hidden">
            <CardHeader className="border-b-2 border-border/70 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="clay-icon-tile h-10 w-10 bg-[#FFF0E6] text-[#D97736]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
                      Kiểm thử trực tiếp Endpoint <code className="font-mono text-xs px-2 py-0.5 rounded-lg bg-muted border border-border text-primary font-bold">POST /api/ai/bootstrap</code>
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">
                      Gửi yêu cầu tới BFF để kiểm tra HMAC Signature và lấy Session Token từ Orchexa API.
                    </CardDescription>
                  </div>
                </div>

                <Button
                  size="default"
                  disabled={isBootstrapping}
                  onClick={handleTestBootstrap}
                  className="clay-btn-primary gap-2 h-10 px-5 rounded-2xl text-xs font-extrabold shrink-0"
                >
                  {isBootstrapping ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Đang kết nối...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" /> Gửi Bootstrap Request
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {bootstrapResult !== null ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="green" className="font-mono text-xs">
                        HTTP 200 OK
                      </Badge>
                      {testLatency !== null && (
                        <span className="text-muted-foreground font-mono text-[11px] font-bold">
                          Độ trễ: <strong className="text-[#D97736] font-mono">{testLatency}ms</strong>
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground font-bold hover:bg-[#FFF0E6] rounded-xl"
                      onClick={() => copyToClipboard(JSON.stringify(bootstrapResult, null, 2), "bootstrap-res")}
                    >
                      {copiedKey === "bootstrap-res" ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Sao chép JSON
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border-2 border-slate-800 max-h-72 leading-relaxed shadow-inner">
                    {JSON.stringify(bootstrapResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 text-center space-y-2">
                  <Terminal className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-bold text-foreground font-heading">Console kiểm thử sẵn sàng</p>
                  <p className="text-[11px] text-muted-foreground max-w-md mx-auto font-medium">
                    Nhấn nút &ldquo;Gửi Bootstrap Request&rdquo; phía trên để gửi request ký thực tế và kiểm tra payload session token trả về từ Orchexa API.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================
          Tab 2: Event Trigger Webhooks (NEW!)
         ========================================================= */}
      {activeTab === "webhooks" && (
        <div className="flex flex-col gap-6">
          {/* Webhook Collapse Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-card border-2 border-border/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-[#DB2777]" />
              <span className="text-xs font-black font-heading text-foreground">
                Danh sách Event Trigger Webhooks (2)
              </span>
              <Badge variant="aqua" className="text-[10px] font-mono font-bold">
                {Object.values(openWebhooks).filter(Boolean).length}/2 đang mở
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpenWebhooks({ "lead-created": false, "order-created": false });
                  setOpenWebhookGuide(false);
                }}
                className="h-7 text-[11px] font-bold px-2.5 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Thu gọn tất cả
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpenWebhooks({ "lead-created": true, "order-created": true });
                  setOpenWebhookGuide(true);
                }}
                className="h-7 text-[11px] font-bold px-2.5 rounded-xl text-primary hover:text-primary"
              >
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Mở rộng tất cả
              </Button>
            </div>
          </div>

          {/* Webhook Configuration Guide Banner */}
          <Card className="clay-card border-2 border-[#FBCFE8] dark:border-[#5C1D3E] bg-gradient-to-br from-[#FFF5F8] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2B101E] dark:via-[#211D1A] dark:to-[#0D242C] overflow-hidden">
            <CardHeader
              onClick={() => setOpenWebhookGuide(prev => !prev)}
              className={`pb-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none ${openWebhookGuide ? "border-b border-border/60" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="clay-icon-tile h-10 w-10 bg-[#FDF2F8] text-[#DB2777]">
                    <Webhook className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-black font-heading">
                      Cấu hình Event Trigger Webhooks trên Orchexa
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-muted-foreground">
                      Orchexa tự động phát sự kiện (Auto-fire) đến các endpoint dưới đây khi AI Agent hoàn tất thu thập khách hàng hoặc tạo đơn hàng.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenWebhookGuide(prev => !prev);
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground rounded-lg"
                >
                  {openWebhookGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {openWebhookGuide && (
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl bg-card border-2 border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4 text-[#D97736]" /> Event Trigger: Lead Created
                      </span>
                      <Badge variant="orange" className="text-[10px]">POST</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs flex-1 truncate">
                        {`${baseUrl}/api/webhooks/orchexa/lead-created`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/api/webhooks/orchexa/lead-created`, "wh-lead-url")}
                        className="p-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                        title="Sao chép URL"
                      >
                        {copiedKey === "wh-lead-url" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border-2 border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                        <ShoppingCart className="h-4 w-4 text-[#16A34A]" /> Event Trigger: Order Created
                      </span>
                      <Badge variant="green" className="text-[10px]">POST</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs flex-1 truncate">
                        {`${baseUrl}/api/webhooks/orchexa/order-created`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/api/webhooks/orchexa/order-created`, "wh-order-url")}
                        className="p-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                        title="Sao chép URL"
                      >
                        {copiedKey === "wh-order-url" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Webhook 1: Lead Created */}
          <Card className="clay-card overflow-hidden border-2 border-border/80">
            <CardHeader
              onClick={() => setOpenWebhooks(prev => ({ ...prev, "lead-created": !prev["lead-created"] }))}
              className={`pb-3 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors select-none ${openWebhooks["lead-created"] ? "border-b-2 border-border/70" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant="orange" className="text-xs font-mono font-black px-3 py-1">
                    POST
                  </Badge>
                  <code className="font-mono text-xs sm:text-sm font-extrabold text-foreground bg-card px-2.5 py-1 rounded-xl border border-border/80">
                    /api/webhooks/orchexa/lead-created
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="aqua" className="text-xs font-bold">Event: lead_created</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWebhooks(prev => ({ ...prev, "lead-created": !prev["lead-created"] }));
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground rounded-lg"
                  >
                    {openWebhooks["lead-created"] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground pt-1 font-medium">
                Tự động tiếp nhận và ghi nhận khách hàng tiềm năng vào cơ sở dữ liệu CRM EduCenter kèm lịch sử đàm thoại.
              </CardDescription>
            </CardHeader>

            {openWebhooks["lead-created"] && (
              <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5">
                    <FileCode2 className="h-4 w-4 text-primary" /> Request Body (JSON Template):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadWebhookPayload(JSON.stringify({
                        customer_name: "Nguyễn Văn A",
                        phone: "0901234567",
                        email: "khach@example.com",
                        notes: "Khách cần báo giá gấp",
                        conversation_id: "a1b2c3d4-0000",
                        agent_id: "a1b2c3d4-0000",
                        agent_name: "Nguyễn Văn A",
                        channel: "Ví dụ channel",
                        timestamp: "2026-08-29T10:30:00+07:00",
                        dedup_key: "lead_dedup_" + Date.now(),
                        student_name: "Nguyễn Văn A",
                        student_class: "Ví dụ student_class"
                      }, null, 2));
                    }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Tạo payload mới (New Dedup Key)
                  </button>
                </div>
                <Textarea
                  rows={9}
                  value={leadWebhookPayload}
                  onChange={(e) => setLeadWebhookPayload(e.target.value)}
                  className="font-mono text-xs p-3.5 rounded-2xl bg-card border-border/80"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Headers gửi kèm: <code>Content-Type: application/json</code>
                </div>
                <Button
                  size="default"
                  disabled={leadWebhookLoading}
                  onClick={handleTestLeadWebhook}
                  className="clay-btn-primary gap-2 h-9 px-5 rounded-2xl text-xs font-extrabold"
                >
                  {leadWebhookLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Gửi Webhook Lead
                    </>
                  )}
                </Button>
              </div>

              {leadWebhookResult !== null && (
                <div className="space-y-2 pt-3 border-t border-border/70">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground font-heading">Kết quả phản hồi (Response):</span>
                      <Badge 
                        variant={leadWebhookStatus === 200 ? "green" : "destructive"}
                        className="font-mono text-xs"
                      >
                        HTTP {leadWebhookStatus} {leadWebhookStatus === 200 ? "OK" : "Error"}
                      </Badge>
                      {leadWebhookLatency !== null && (
                        <span className="text-muted-foreground font-mono text-[11px] font-bold">
                          Độ trễ: <strong className="text-[#D97736] font-mono">{leadWebhookLatency}ms</strong>
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground font-bold hover:bg-[#FFF0E6] rounded-xl"
                      onClick={() => copyToClipboard(JSON.stringify(leadWebhookResult, null, 2), "wh-lead-res")}
                    >
                      {copiedKey === "wh-lead-res" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy JSON
                    </Button>
                  </div>

                  <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-52 border border-slate-800 leading-relaxed shadow-inner">
                    {JSON.stringify(leadWebhookResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
            )}
          </Card>

          {/* Webhook 2: Order Created */}
          <Card className="clay-card overflow-hidden border-2 border-border/80">
            <CardHeader
              onClick={() => setOpenWebhooks(prev => ({ ...prev, "order-created": !prev["order-created"] }))}
              className={`pb-3 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors select-none ${openWebhooks["order-created"] ? "border-b-2 border-border/70" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant="green" className="text-xs font-mono font-black px-3 py-1">
                    POST
                  </Badge>
                  <code className="font-mono text-xs sm:text-sm font-extrabold text-foreground bg-card px-2.5 py-1 rounded-xl border border-border/80">
                    /api/webhooks/orchexa/order-created
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="aqua" className="text-xs font-bold">Event: order_created</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenWebhooks(prev => ({ ...prev, "order-created": !prev["order-created"] }));
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground rounded-lg"
                  >
                    {openWebhooks["order-created"] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground pt-1 font-medium">
                Tự động tạo đơn hàng, đăng ký khóa học, tính toán tổng tiền từ danh sách items và lưu Activity Log.
              </CardDescription>
            </CardHeader>

            {openWebhooks["order-created"] && (
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5">
                      <FileCode2 className="h-4 w-4 text-primary" /> Request Body (JSON Template):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderWebhookPayload(JSON.stringify({
                          order_id: "ORD-" + Date.now().toString().slice(-6),
                          customer_name: "Nguyễn Văn A",
                          phone: "0901234567",
                          items: [
                            {
                              name: "Khóa học IELTS Intermediate",
                              quantity: 1,
                              price: 8000000
                            },
                            {
                              name: "Giáo trình trọn bộ",
                              quantity: 1,
                              price: 500000
                            }
                          ],
                          total: 8500000,
                          notes: "Khách cần báo giá gấp & xếp lớp tối 2-4-6",
                          conversation_id: "a1b2c3d4-0000",
                          agent_id: "a1b2c3d4-0000",
                          agent_name: "Nguyễn Văn A",
                          channel: "Ví dụ channel",
                          timestamp: "2026-08-29T10:30:00+07:00",
                          dedup_key: "order_dedup_" + Date.now()
                        }, null, 2));
                      }}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Tạo payload mới (New Dedup Key)
                    </button>
                  </div>
                  <Textarea
                    rows={11}
                    value={orderWebhookPayload}
                    onChange={(e) => setOrderWebhookPayload(e.target.value)}
                    className="font-mono text-xs p-3.5 rounded-2xl bg-card border-border/80"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Headers gửi kèm: <code>Content-Type: application/json</code>
                  </div>
                  <Button
                    size="default"
                    disabled={orderWebhookLoading}
                    onClick={handleTestOrderWebhook}
                    className="clay-btn-primary gap-2 h-9 px-5 rounded-2xl text-xs font-extrabold"
                  >
                    {orderWebhookLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Gửi Webhook Order
                      </>
                    )}
                  </Button>
                </div>

                {orderWebhookResult !== null && (
                  <div className="space-y-2 pt-3 border-t border-border/70">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground font-heading">Kết quả phản hồi (Response):</span>
                        <Badge 
                          variant={orderWebhookStatus === 200 ? "green" : "destructive"}
                          className="font-mono text-xs"
                        >
                          HTTP {orderWebhookStatus} {orderWebhookStatus === 200 ? "OK" : "Error"}
                        </Badge>
                        {orderWebhookLatency !== null && (
                          <span className="text-muted-foreground font-mono text-[11px] font-bold">
                            Độ trễ: <strong className="text-[#D97736] font-mono">{orderWebhookLatency}ms</strong>
                          </span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground font-bold hover:bg-[#FFF0E6] rounded-xl"
                        onClick={() => copyToClipboard(JSON.stringify(orderWebhookResult, null, 2), "wh-order-res")}
                      >
                        {copiedKey === "wh-order-res" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy JSON
                      </Button>
                    </div>

                    <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-52 border border-slate-800 leading-relaxed shadow-inner">
                      {JSON.stringify(orderWebhookResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================
          Tab 3: REST APIs Explorer & Live Tester
         ========================================================= */}
      {activeTab === "api" && (
        <div className="flex flex-col gap-6">
          {/* Header Info Note */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF5ED] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2B1C13] dark:to-[#102730] border-2 border-border/80 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs font-heading">
              <KeyRound className="h-4 w-4 text-[#D97736]" />
              Quy ước Xác thực Headers (Authentication & Scoped Access):
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5 text-[11px] text-muted-foreground font-medium">
              <div className="p-2.5 rounded-xl bg-card border border-border/80">
                <div className="font-bold text-foreground font-mono text-[10px]">1. Per-User Bearer Token:</div>
                <code>Authorization: Bearer 0901234567</code>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/80">
                <div className="font-bold text-foreground font-mono text-[10px]">2. Signed User Context:</div>
                <code>x-parent-phone: 0901234567</code>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/80">
                <div className="font-bold text-foreground font-mono text-[10px]">3. Content Payload:</div>
                <code>Content-Type: application/json</code>
              </div>
            </div>
          </div>

          {/* REST API Collapse Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-card border-2 border-border/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-xs font-black font-heading text-foreground">
                Danh sách REST Endpoints ({APIS.length})
              </span>
              <Badge variant="aqua" className="text-[10px] font-mono font-bold">
                {Object.values(apiStates).filter(s => s.openTester).length}/{APIS.length} đang mở
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApiStates(prev => {
                    const next = { ...prev };
                    APIS.forEach(a => {
                      if (next[a.id]) next[a.id] = { ...next[a.id], openTester: false };
                    });
                    return next;
                  });
                }}
                className="h-7 text-[11px] font-bold px-2.5 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Thu gọn tất cả
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApiStates(prev => {
                    const next = { ...prev };
                    APIS.forEach(a => {
                      if (next[a.id]) next[a.id] = { ...next[a.id], openTester: true };
                    });
                    return next;
                  });
                }}
                className="h-7 text-[11px] font-bold px-2.5 rounded-xl text-primary hover:text-primary"
              >
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Mở rộng tất cả
              </Button>
            </div>
          </div>

          {/* List of APIs */}
          <div className="grid gap-6">
            {APIS.map((api) => {
              const state = apiStates[api.id] || {
                authMode: "none",
                customAuth: "",
                params: {},
                bodyText: "",
                loading: false,
                response: null,
                status: null,
                latency: null,
                openTester: true,
              };

              return (
                <Card key={api.id} className="clay-card overflow-hidden border-2 border-border/80">
                  {/* API Header Bar */}
                  <CardHeader
                    onClick={() => {
                      setApiStates(prev => ({
                        ...prev,
                        [api.id]: { ...prev[api.id], openTester: !prev[api.id].openTester }
                      }));
                    }}
                    className={`pb-3 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors select-none ${state.openTester ? "border-b-2 border-border/70" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge 
                          variant={api.method === "GET" ? "aqua" : "green"}
                          className="text-xs font-mono font-black px-3 py-1"
                        >
                          {api.method}
                        </Badge>
                        <code className="font-mono text-xs sm:text-sm font-extrabold text-foreground bg-card px-2.5 py-1 rounded-xl border border-border/80">
                          {api.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground font-heading">{api.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApiStates(prev => ({
                              ...prev,
                              [api.id]: { ...prev[api.id], openTester: !prev[api.id].openTester }
                            }));
                          }}
                          className="h-7 px-2 text-xs text-muted-foreground rounded-lg"
                        >
                          {state.openTester ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground pt-1 font-medium">
                      {api.desc}
                    </CardDescription>
                  </CardHeader>

                  {state.openTester && (
                    <CardContent className="p-4 sm:p-6 space-y-6">
                    {/* Headers & Specs View */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Left: Headers Spec */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-[#D97736]" /> Request Headers:
                        </div>
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
                          {api.headers.map((h, i) => (
                            <div key={i} className="flex items-start justify-between gap-2 border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                              <div className="space-y-0.5">
                                <div className="font-mono font-bold text-primary flex items-center gap-1.5">
                                  <span>{h.name}:</span>
                                  <span className="text-muted-foreground font-normal text-[11px]">{h.value}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground">{h.desc}</div>
                              </div>
                              {h.required ? (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Bắt buộc</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground">Tuỳ chọn</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Parameters or Body Spec */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                          <FileCode2 className="h-3.5 w-3.5 text-[#0284C7]" />
                          {api.method === "GET" ? "Query Parameters / URL Params:" : "Request Body (JSON Payload):"}
                        </div>

                        {api.method === "GET" && api.params && (
                          <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
                            {api.params.map((p, i) => (
                              <div key={i} className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                                    <code>{p.name}</code>
                                    <span className="text-muted-foreground text-[10px]">({p.type})</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                                </div>
                                {p.required && <Badge variant="orange" className="text-[9px] px-1.5 py-0 h-4">Required</Badge>}
                              </div>
                            ))}
                          </div>
                        )}

                        {api.method === "POST" && api.bodyTemplate && (
                          <div className="relative">
                            <pre className="p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-32 border border-slate-800">
                              {JSON.stringify(api.bodyTemplate, null, 2)}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(api.bodyTemplate, null, 2), `body-${api.id}`)}
                              className="absolute top-2 right-2 text-slate-400 hover:text-slate-100 p-1 bg-slate-800/80 rounded-lg text-[10px] flex items-center gap-1"
                            >
                              {copiedKey === `body-${api.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              Copy Body
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sample Response Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground font-heading">Phản hồi mẫu chuẩn (Sample JSON Output):</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(api.sampleResponse, null, 2), `sample-${api.id}`)}
                          className="hover:text-foreground text-muted-foreground flex items-center gap-1 font-bold"
                        >
                          {copiedKey === `sample-${api.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy JSON
                        </button>
                      </div>
                      <pre className="p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-32 border border-slate-800">
                        {JSON.stringify(api.sampleResponse, null, 2)}
                      </pre>
                    </div>

                    {/* Interactive Live Tester Panel */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-card border-2 border-primary/20 dark:border-primary/30 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-xl bg-[#FFF0E6] text-[#D97736] flex items-center justify-center font-bold">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-black font-heading text-foreground">
                            Kiểm thử trực tiếp trên Website (Live Test Call)
                          </span>
                        </div>

                        <Button
                          size="sm"
                          disabled={state.loading}
                          onClick={() => handleExecuteApi(api)}
                          className="clay-btn-primary gap-1.5 h-8 px-4 text-xs font-bold shrink-0"
                        >
                          {state.loading ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang gửi...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" /> Gửi Request
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Controls: Headers & Inputs */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Auth Selection */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-muted-foreground">Chọn Header Xác thực (Auth Mode):</label>
                          <select
                            value={state.authMode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setApiStates(prev => ({
                                ...prev,
                                [api.id]: { ...prev[api.id], authMode: val }
                              }));
                            }}
                            className="w-full text-xs rounded-xl border border-border/80 bg-background px-3 py-2 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            <option value="none">Không xác thực (No Auth / Public / AI Agent)</option>
                            <option value="bearer_system">System Admin Key (Bearer ocx_sys_educenter_...)</option>
                            <option value="bearer_parent_a">Bearer Token (Phụ huynh A: 0901234567 - HV0001, HV0002)</option>
                            <option value="bearer_parent_b">Bearer Token (Phụ huynh B: 0912345678 - HV0003)</option>
                            <option value="bearer_parent_nga">Bearer Token (Phụ huynh Nga: 0945678901 - HV0006, HV0007)</option>
                            <option value="header_parent_phone">Custom Header: x-parent-phone: 0901234567</option>
                            <option value="custom">Nhập Token tuỳ chỉnh (Custom Token)</option>
                          </select>

                            {state.authMode === "custom" && (
                              <Input
                                placeholder="VD: Bearer 0901234567 hoặc JWT..."
                                value={state.customAuth}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setApiStates(prev => ({
                                    ...prev,
                                    [api.id]: { ...prev[api.id], customAuth: val }
                                  }));
                                }}
                                className="h-8 text-xs font-mono"
                              />
                            )}
                          </div>

                          {/* Editable Inputs / Params */}
                          {api.method === "GET" && api.params && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-muted-foreground">Giá trị tham số (Query Params):</label>
                              <div className="flex gap-2">
                                {api.params.map(p => (
                                  <Input
                                    key={p.name}
                                    placeholder={p.name}
                                    value={state.params[p.name] ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setApiStates(prev => ({
                                        ...prev,
                                        [api.id]: {
                                          ...prev[api.id],
                                          params: { ...prev[api.id].params, [p.name]: val }
                                        }
                                      }));
                                    }}
                                    className="h-9 text-xs font-mono"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {api.method === "POST" && (
                            <div className="space-y-1.5 sm:col-span-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-muted-foreground">Chỉnh sửa Request Body (JSON):</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setApiStates(prev => ({
                                      ...prev,
                                      [api.id]: {
                                        ...prev[api.id],
                                        bodyText: JSON.stringify(api.bodyTemplate, null, 2)
                                      }
                                    }));
                                  }}
                                  className="text-[10px] text-primary font-bold hover:underline"
                                >
                                  Khôi phục mẫu mặc định
                                </button>
                              </div>
                              <Textarea
                                rows={6}
                                value={state.bodyText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setApiStates(prev => ({
                                    ...prev,
                                    [api.id]: { ...prev[api.id], bodyText: val }
                                  }));
                                }}
                                className="font-mono text-xs p-3 rounded-2xl bg-muted/20 border-border/80"
                              />
                            </div>
                          )}
                        </div>

                        {/* Real-time Response Output */}
                        {state.response !== null && (
                          <div className="space-y-2 pt-2 border-t border-border/70">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground font-heading">Kết quả API thực tế:</span>
                                <Badge 
                                  variant={state.status !== null && state.status < 400 ? "green" : "destructive"}
                                  className="font-mono text-xs"
                                >
                                  HTTP {state.status} {state.status === 200 ? "OK" : state.status === 401 ? "Unauthorized" : state.status === 403 ? "Forbidden" : ""}
                                </Badge>
                                {state.latency !== null && (
                                  <span className="text-muted-foreground font-mono text-[11px] font-bold">
                                    Độ trễ: <strong className="text-primary font-mono">{state.latency}ms</strong>
                                  </span>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground font-bold"
                                onClick={() => copyToClipboard(JSON.stringify(state.response, null, 2), `res-${api.id}`)}
                              >
                                {copiedKey === `res-${api.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                Copy
                              </Button>
                            </div>

                            <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-56 border border-slate-800 leading-relaxed shadow-inner">
                              {JSON.stringify(state.response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          Tab 4: Model Context Protocol (MCP) & Orchexa Connect
         ========================================================= */}
      {activeTab === "mcp" && (
        <div className="flex flex-col gap-6">
          {/* Orchexa Connection Specs Card (Matches Orchexa Modal) */}
          <Card className="clay-card border-2 border-[#EEDBCC] dark:border-[#3E3228] bg-gradient-to-br from-[#FFF5ED] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2A1E16] dark:via-[#211D1A] dark:to-[#0F242C] overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="clay-icon-tile h-10 w-10 bg-[#FDF2F8] text-[#DB2777]">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-black font-heading">
                    Hướng dẫn Cấu hình Kết nối MCP Server trên Orchexa Dashboard
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-muted-foreground">
                    Orchexa kết nối trực tiếp đến EduCenter SIS qua chuẩn HTTP / SSE Endpoint và xác thực bằng Headers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Endpoint 1: Streamable HTTP (Recommended) */}
                <div className="p-4 rounded-3xl bg-card border-2 border-primary/30 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="orange" className="font-extrabold text-xs">
                      Khuyên dùng cho Orchexa
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground font-heading">Streamable HTTP</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">1. Server Type:</div>
                    <code className="px-2.5 py-1 rounded-xl bg-muted font-mono font-bold text-xs block text-foreground">
                      Streamable HTTP
                    </code>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">2. Server URL Endpoint:</div>
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs flex-1 truncate">
                        {`${baseUrl}/api/mcp`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/api/mcp`, "mcp-url-http")}
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                        title="Sao chép Endpoint"
                      >
                        {copiedKey === "mcp-url-http" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Endpoint 2: SSE (Server-Sent Events) */}
                <div className="p-4 rounded-3xl bg-card border-2 border-border/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="aqua" className="font-extrabold text-xs">
                      Chuẩn SSE Protocol
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground font-heading">Server-Sent Events</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">1. Server Type:</div>
                    <code className="px-2.5 py-1 rounded-xl bg-muted font-mono font-bold text-xs block text-foreground">
                      SSE
                    </code>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">2. Server URL Endpoint:</div>
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs flex-1 truncate">
                        {`${baseUrl}/api/mcp/sse`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/api/mcp/sse`, "mcp-url-sse")}
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                        title="Sao chép Endpoint"
                      >
                        {copiedKey === "mcp-url-sse" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication Configuration Details */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
                <div className="text-xs font-extrabold text-foreground font-heading flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#16A34A]" /> Cấu hình Xác thực (Authentication Options):
                </div>
                <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1">
                    <div className="font-bold text-foreground text-[11px]">System Key (Bearer Token):</div>
                    <p className="text-[10px] text-muted-foreground">
                      Header: <code>Authorization: Bearer ocx_sys_key_...</code> hoặc <code>X-Api-Key: ...</code>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1">
                    <div className="font-bold text-foreground text-[11px]">User Context Signed (HMAC):</div>
                    <p className="text-[10px] text-muted-foreground">
                      Orchexa tự động inject <code>_meta.orchexa.actor</code> vào mỗi <code>tools/call</code>.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1">
                    <div className="font-bold text-foreground text-[11px]">Per-User Token:</div>
                    <p className="text-[10px] text-muted-foreground">
                      Header <code>Authorization: Bearer 0901234567</code> tự động cô lập dữ liệu gia đình.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Interactive MCP Tester Card */}
          <Card className="clay-card overflow-hidden border-2 border-primary/30">
            <CardHeader className="pb-3 border-b-2 border-border/70 bg-gradient-to-r from-[#FFF5ED] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2B1B11] dark:to-[#0D242C]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="clay-icon-tile h-10 w-10 bg-[#FFF0E6] text-[#D97736]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black font-heading">
                      Kiểm thử trực tiếp Giao thức MCP (Live MCP Protocol Tester)
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-muted-foreground">
                      Thực thi các lệnh JSON-RPC 2.0 (<code className="font-mono text-primary font-bold">initialize</code>, <code className="font-mono text-primary font-bold">tools/list</code>, <code className="font-mono text-primary font-bold">tools/call</code>) trực tiếp trên server qua HTTP/SSE.
                    </CardDescription>
                  </div>
                </div>

                <Button
                  size="default"
                  disabled={mcpLoading}
                  onClick={handleExecuteMcp}
                  className="clay-btn-primary gap-2 h-10 px-5 rounded-2xl text-xs font-extrabold shrink-0"
                >
                  {mcpLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Đang gửi MCP Call...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Gửi MCP Call (JSON-RPC)
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Configuration Controls */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* 1. Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground font-heading">JSON-RPC Method:</label>
                  <select
                    value={mcpMethod}
                    onChange={(e) => setMcpMethod(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border/80 bg-background px-3 py-2 font-mono font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="tools/call">tools/call (Gọi công cụ cụ thể)</option>
                    <option value="tools/list">tools/list (Danh sách 7 công cụ)</option>
                    <option value="initialize">initialize (Bắt tay khởi tạo phiên)</option>
                    <option value="ping">ping (Kiểm tra liveness)</option>
                  </select>
                </div>

                {/* 2. Tool Selector (if tools/call) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground font-heading">Chọn MCP Tool:</label>
                  <select
                    disabled={mcpMethod !== "tools/call"}
                    value={selectedMcpTool}
                    onChange={(e) => handleSelectTool(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border/80 bg-background px-3 py-2 font-mono font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                  >
                    {MCP_TOOLS_CATALOG.map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Transport Endpoint */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground font-heading">Transport & Endpoint:</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={mcpTransport === "http" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMcpTransport("http")}
                      className={`flex-1 text-xs font-bold h-9 rounded-xl ${mcpTransport === "http" ? "clay-btn-primary" : "clay-btn-outline"}`}
                    >
                      Streamable HTTP
                    </Button>
                    <Button
                      type="button"
                      variant={mcpTransport === "sse" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMcpTransport("sse")}
                      className={`flex-1 text-xs font-bold h-9 rounded-xl ${mcpTransport === "sse" ? "clay-btn-primary" : "clay-btn-outline"}`}
                    >
                      SSE Endpoint
                    </Button>
                  </div>
                </div>
              </div>

              {/* Auth Header Selector */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-[#D97736]" /> Headers Xác thực MCP (Authorization Header):
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <select
                    value={mcpAuthMode}
                    onChange={(e) => setMcpAuthMode(e.target.value)}
                    className="text-xs rounded-xl border border-border/80 bg-card px-3 py-2 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="bearer_system">System Key: Authorization: Bearer ocx_sys_educenter_9f3b8a1c7e6d4205bb9910f8</option>
                    <option value="bearer_parent_a">Per-User Bearer: Authorization: Bearer 0901234567</option>
                    <option value="header_parent_phone">Custom Header: x-parent-phone: 0901234567</option>
                    <option value="none">No Auth Header (Public)</option>
                    <option value="custom">Nhập Auth Token tuỳ chỉnh</option>
                  </select>

                  {mcpAuthMode === "custom" && (
                    <Input
                      placeholder="VD: Bearer your_custom_key..."
                      value={mcpCustomHeader}
                      onChange={(e) => setMcpCustomHeader(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Tool Arguments Editor */}
              {mcpMethod === "tools/call" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground font-heading">
                      Tool Arguments (JSON Payload cho <code>{selectedMcpTool}</code>):
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSelectTool(selectedMcpTool)}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Dùng dữ liệu mẫu mặc định
                    </button>
                  </div>
                  <Textarea
                    rows={4}
                    value={mcpArgsText}
                    onChange={(e) => setMcpArgsText(e.target.value)}
                    className="font-mono text-xs p-3 rounded-2xl bg-card border-border/80"
                  />
                </div>
              )}

              {/* Live JSON-RPC Response Console */}
              {mcpResult !== null ? (
                <div className="space-y-2 pt-3 border-t border-border/70">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground font-heading">Kết quả JSON-RPC 2.0 Response:</span>
                      <Badge 
                        variant={mcpStatus === 200 ? "green" : "destructive"}
                        className="font-mono text-xs"
                      >
                        HTTP {mcpStatus} {mcpStatus === 200 ? "OK" : "Error"}
                      </Badge>
                      {mcpLatency !== null && (
                        <span className="text-muted-foreground font-mono text-[11px] font-bold">
                          Độ trễ: <strong className="text-[#D97736] font-mono">{mcpLatency}ms</strong>
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground font-bold hover:bg-[#FFF0E6] rounded-xl"
                      onClick={() => copyToClipboard(JSON.stringify(mcpResult, null, 2), "mcp-res")}
                    >
                      {copiedKey === "mcp-res" ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Sao chép JSON-RPC
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border-2 border-slate-800 max-h-72 leading-relaxed shadow-inner">
                    {JSON.stringify(mcpResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 text-center space-y-1.5">
                  <Terminal className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-xs font-bold text-foreground font-heading">Console MCP sẵn sàng</p>
                  <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                    Chọn tool và nhấn &ldquo;Gửi MCP Call (JSON-RPC)&rdquo; để kiểm tra handshake và phản hồi từ Server qua Streamable HTTP / SSE.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Catalog of Registered MCP Tools */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black font-heading text-foreground flex items-center gap-2">
                <ListTree className="h-4 w-4 text-primary" />
                Danh mục {MCP_TOOLS_CATALOG.length} Công cụ MCP Đã Đăng ký (Registered Tools):
              </h3>
              <Badge variant="aqua" className="font-mono text-xs">{MCP_TOOLS_CATALOG.length} Tools Available</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {MCP_TOOLS_CATALOG.map((tool) => (
                <Card key={tool.name} className="clay-card p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <code className="font-mono text-xs font-black text-primary">{tool.name}</code>
                      {tool.aliases && tool.aliases.length > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          Aliases: {tool.aliases.join(", ")}
                        </div>
                      )}
                    </div>
                    <Badge variant="aqua" className="text-[10px]">MCP Tool</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-foreground font-heading">Input Schema & Sample Arguments:</div>
                    <pre className="p-2.5 rounded-xl bg-muted/70 text-[10px] font-mono text-foreground border border-border/60 overflow-x-auto max-h-28">
                      {JSON.stringify(tool.defaultArgs, null, 2)}
                    </pre>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSelectTool(tool.name);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="w-full h-8 text-xs font-bold clay-btn-outline rounded-xl"
                  >
                    Nạp vào bộ kiểm thử
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Tab 5: Security & Auth
         ========================================================= */}
      {activeTab === "auth" && (
        <div className="flex flex-col gap-6">
          <Card className="clay-card">
            <CardHeader className="pb-3 border-b-2 border-border/70">
              <div className="flex items-center gap-3">
                <div className="clay-icon-tile h-10 w-10 bg-[#F0FDF4] text-[#16A34A]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-black font-heading">Mô hình Bảo mật & Phân quyền Dữ liệu</CardTitle>
                  <CardDescription className="text-xs font-semibold">
                    Kiểm soát truy cập RBAC và cô lập dữ liệu gia đình (Scoped Data Isolation).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs text-muted-foreground font-medium leading-relaxed">
              <p>
                Tất cả request từ phụ huynh tự phục vụ hoặc AI Agent đều được kiểm tra danh tính và giới hạn dữ liệu chỉ trong phạm vi các con của phụ huynh đó thông qua số điện thoại định danh đã ký HMAC.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-1.5">
                  <div className="font-extrabold text-xs text-foreground font-heading">1. Zero Leakage</div>
                  <p className="text-[11px]">
                    Không bao giờ trả về danh sách học sinh của phụ huynh khác, tự động chặn bằng mã <code>403 FORBIDDEN_PARENT_ACCESS</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-1.5">
                  <div className="font-extrabold text-xs text-foreground font-heading">2. HMAC-SHA256 Signatures</div>
                  <p className="text-[11px]">
                    Chuỗi canonical <code className="text-foreground">METHOD\nPATH\nTIMESTAMP\nBODY_HASH</code> được ký bằng khóa bí mật tại Server.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-1.5">
                  <div className="font-extrabold text-xs text-foreground font-heading">3. Auto Token Rotation</div>
                  <p className="text-[11px]">
                    Session Token có thời hạn ngắn (5 phút) và tự động gia hạn an toàn giữa Client SDK và BFF Backend.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
