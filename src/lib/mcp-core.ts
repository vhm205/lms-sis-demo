import { prisma } from "@/lib/prisma";
import { getValidAdminKeys } from "@/lib/auth";
import { generateStudentReport, normalizeReportType } from "@/lib/report-generator";

export interface McpToolDefinition {
  name: string;
  aliases?: string[];
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
  sampleArguments: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: "search_students",
    description: "Tìm kiếm học viên theo họ tên, mã học viên (VD: HV0001), số điện thoại học viên hoặc số điện thoại phụ huynh.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Từ khóa tìm kiếm (tên học viên, mã HV0001, hoặc số điện thoại phụ huynh)" },
      },
      required: ["query"],
    },
    sampleArguments: {
      query: "Minh"
    },
    sampleResponse: {
      students: [
        {
          id: "cmtgpg6vo000up6z8a3fnbb5n",
          code: "HV0001",
          name: "Nguyễn Văn Bé Minh",
          parent: {
            name: "Nguyễn Văn Phụ Huynh A",
            phone: "0901234567"
          },
          facility: {
            name: "Cơ sở Cầu Giấy"
          }
        }
      ]
    }
  },
  {
    name: "get_student_info",
    aliases: ["get_student_profile"],
    description: "Lấy chi tiết hồ sơ học viên: thông tin cá nhân, lớp học đang tham gia, kết quả điểm danh gần đây, điểm bài tập và yêu cầu hỗ trợ.",
    inputSchema: {
      type: "object",
      properties: {
        studentId: { type: "string", description: "ID học viên hoặc Mã học viên (ví dụ: HV0001 hoặc cuid)" },
      },
      required: ["studentId"],
    },
    sampleArguments: {
      studentId: "HV0001"
    },
    sampleResponse: {
      id: "cmtgpg6vo000up6z8a3fnbb5n",
      code: "HV0001",
      name: "Nguyễn Văn Bé Minh",
      classes: [{ name: "Lớp Tiếng Anh Kids Cầu Giấy 1", code: "ENG-HN-01" }],
      attendances: [{ status: "PRESENT", schedule: { date: "2024-10-01T08:00:00Z" } }],
      assignments: [{ title: "Bài tập Unit 1", score: 8.5 }]
    }
  },
  {
    name: "get_parent_children",
    description: "Tra cứu danh sách các con và tình hình học tập thuộc số điện thoại phụ huynh (Self-Service).",
    inputSchema: {
      type: "object",
      properties: {
        phone: { type: "string", description: "Số điện thoại phụ huynh (VD: 0901234567)" },
      },
      required: ["phone"],
    },
    sampleArguments: {
      phone: "0901234567"
    },
    sampleResponse: {
      parent: { name: "Nguyễn Văn Phụ Huynh A", phone: "0901234567" },
      childrenCount: 2,
      children: [
        { code: "HV0001", name: "Nguyễn Văn Bé Minh", class: "Lớp Tiếng Anh Kids Cầu Giấy 1" },
        { code: "HV0002", name: "Nguyễn Thị Bé Lan", class: "Lớp Tiếng Anh Kids Cầu Giấy 1" }
      ]
    }
  },
  {
    name: "find_available_classes",
    description: "Tìm các lớp học đang mở và còn chỗ trống cho một khóa học cụ thể.",
    inputSchema: {
      type: "object",
      properties: {
        courseId: { type: "string", description: "ID hoặc Mã khóa học (VD: ENG-KID-01, IELTS-INT, MATH-TUDUY)" },
      },
      required: ["courseId"],
    },
    sampleArguments: {
      courseId: "ENG-KID-01"
    },
    sampleResponse: {
      availableClasses: [
        {
          id: "cmtgpg6vl000op6z88spd7a7x",
          name: "Lớp Tiếng Anh Kids Cầu Giấy 1",
          capacity: 15,
          enrolled: 2,
          available: 13
        }
      ]
    }
  },
  {
    name: "create_makeup_request",
    aliases: ["request_makeup_class"],
    description: "Tạo yêu cầu xếp lịch học bù cho học viên đã nghỉ có phép (tự động kiểm tra tính hợp lệ của buổi vắng).",
    inputSchema: {
      type: "object",
      properties: {
        studentId: { type: "string", description: "ID hoặc Mã học viên (VD: HV0001)" },
        missedScheduleId: { type: "string", description: "ID buổi học đã nghỉ (trạng thái ABSENT hoặc EXCUSED)" },
        targetScheduleId: { type: "string", description: "ID buổi học mục tiêu muốn học bù" },
        notes: { type: "string", description: "Lý do học bù hoặc ghi chú của phụ huynh" },
      },
      required: ["studentId", "missedScheduleId", "targetScheduleId"],
    },
    sampleArguments: {
      studentId: "HV0001",
      missedScheduleId: "cmtgpg6vr0012p6z8r16vxfuu",
      targetScheduleId: "cmtgpg6vr0014p6z8ig04sa86",
      notes: "Xin học bù buổi nghỉ ngày 03/10 do bận việc gia đình"
    },
    sampleResponse: {
      success: true,
      requestId: "cmtgpg6vx001ep6z8req01",
      status: "PENDING",
      message: "Đã tạo yêu cầu học bù thành công."
    }
  },
  {
    name: "create_order",
    aliases: ["create_lead_or_order"],
    description: "Tạo đơn đăng ký khóa học (Order) hoặc ghi danh mới khi tư vấn chốt ghi danh học viên thành công.",
    inputSchema: {
      type: "object",
      properties: {
        parentName: { type: "string", description: "Họ tên phụ huynh" },
        parentPhone: { type: "string", description: "Số điện thoại phụ huynh" },
        courseId: { type: "string", description: "ID hoặc Mã khóa học (VD: IELTS-INT, ENG-KID-01)" },
        facilityId: { type: "string", description: "ID hoặc tên cơ sở học (VD: Cầu Giấy, Bình Thạnh)" },
        amount: { type: "number", description: "Số tiền học phí (VND)" },
        notes: { type: "string", description: "Ghi chú đơn hàng" }
      },
      required: ["parentName", "parentPhone", "courseId", "facilityId"]
    },
    sampleArguments: {
      parentName: "Trần Thị Mai",
      parentPhone: "0912345678",
      courseId: "IELTS-INT",
      facilityId: "Cơ sở Cầu Giấy",
      amount: 8000000,
      notes: "Tư vấn qua AI Voice Agent - hẹn đóng phí tại cơ sở"
    },
    sampleResponse: {
      success: true,
      orderCode: "ORD-998812",
      orderId: "cmtgpg6vy001fp6z8ord01",
      amount: 8000000,
      status: "PENDING"
    }
  },
  {
    name: "create_support_request",
    description: "Tạo ticket yêu cầu hỗ trợ, thắc mắc học phí hoặc xin nghỉ phép từ phụ huynh hoặc học viên.",
    inputSchema: {
      type: "object",
      properties: {
        studentId: { type: "string", description: "ID hoặc Mã học viên (VD: HV0001)" },
        type: { type: "string", enum: ["LEAVE", "INFO", "SUPPORT", "COMPLAINT", "CALL_BACK"], description: "Loại yêu cầu hỗ trợ" },
        content: { type: "string", description: "Nội dung chi tiết yêu cầu" },
        priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "URGENT"], description: "Mức độ ưu tiên" }
      },
      required: ["studentId", "type", "content"]
    },
    sampleArguments: {
      studentId: "HV0001",
      type: "LEAVE",
      content: "Xin nghỉ phép buổi ngày 08/10 do bận việc gia đình",
      priority: "NORMAL"
    },
    sampleResponse: {
      success: true,
      ticketId: "cmtgpg6vz001gp6z8sup01",
      status: "NEW",
      type: "LEAVE"
    }
  },
  {
    name: "generate_student_report",
    aliases: ["export_student_report", "get_student_report", "view_student_report"],
    description: "Tạo và xuất báo cáo học tập hoặc nhận xét về học sinh chỉ định (trả về tóm tắt kèm preview link và PDF link). Hỗ trợ 2 loại báo cáo: ACADEMIC_RESULTS (Báo cáo kết quả học tập, điểm số, nhận xét chi tiết) và PROGRESS_OVERVIEW (Báo cáo tổng quan quá trình, chuyên cần, tiến độ và tình hình hiện tại).",
    inputSchema: {
      type: "object",
      properties: {
        studentId: {
          type: "string",
          description: "Mã học viên (VD: HV0001), ID hoặc tên học viên",
        },
        type: {
          type: "string",
          enum: ["ACADEMIC_RESULTS", "PROGRESS_OVERVIEW"],
          description: "Loại báo cáo cần xuất: 'ACADEMIC_RESULTS' (Kết quả học tập, điểm số) hoặc 'PROGRESS_OVERVIEW' (Tổng quan quá trình, chuyên cần, tình hình hiện tại)",
        },
      },
      required: ["studentId"],
    },
    sampleArguments: {
      studentId: "HV0001",
      type: "ACADEMIC_RESULTS",
    },
    sampleResponse: {
      success: true,
      reportId: "REP-ACAD-HV0001-XXXX",
      type: "ACADEMIC_RESULTS",
      typeName: "Báo cáo Kết quả Học tập",
      title: "Báo cáo Kết quả Học tập - Nguyễn Văn Bé Minh (HV0001)",
      previewUrl: "/reports/preview/HV0001?type=academic&reportId=REP-ACAD-HV0001-XXXX",
      pdfUrl: "/reports/preview/HV0001?type=academic&reportId=REP-ACAD-HV0001-XXXX&print=true",
      summaryText: "Báo cáo Kết quả Học tập của học viên Nguyễn Văn Bé Minh (HV0001): Điểm trung bình đạt 8.8/10...",
      shortHighlights: [
        "Điểm trung bình: 8.8/10 (Xếp loại: Giỏi)",
        "Số bài kiểm tra đã hoàn thành: 7/7",
        "Tỷ lệ đạt chuẩn: 100% | Điểm Giỏi: 85%"
      ]
    },
  }
];

export interface McpContext {
  parentPhone?: string;
  parentId?: string;
  actorId?: string;
  source?: string;
}

export function listMcpTools() {
  return MCP_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

export async function executeMcpTool(
  name: string,
  args: Record<string, unknown> = {},
  context: McpContext = {}
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean; data?: unknown }> {
  try {
    // Resolve alias
    let toolName = name;
    if (name === "get_student_profile") toolName = "get_student_info";
    if (name === "request_makeup_class") toolName = "create_makeup_request";
    if (name === "create_lead_or_order") toolName = "create_order";
    if (name === "export_student_report" || name === "get_student_report" || name === "view_student_report") toolName = "generate_student_report";

    // 1. search_students
    if (toolName === "search_students") {
      const query = (args?.query as string) || "";
      const students = await prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
            { phone: { contains: query } },
            { parent: { phone: { contains: query } } },
            { parent: { name: { contains: query } } },
          ],
        },
        include: { parent: true, facility: true },
        take: 20,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: students.length, students }, null, 2),
          },
        ],
        data: { count: students.length, students },
      };
    }

    // 2. get_student_info
    if (toolName === "get_student_info") {
      const identifier = (args?.studentId as string) || "";
      if (!identifier) throw new Error("Missing required argument: studentId");

      // Find by ID or code
      const student = await prisma.student.findFirst({
        where: {
          OR: [{ id: identifier }, { code: identifier }],
        },
        include: {
          parent: true,
          facility: true,
          classes: { include: { course: true, teacher: true } },
          attendances: {
            include: { schedule: { include: { room: true } } },
            orderBy: { schedule: { date: "desc" } },
            take: 10,
          },
          assignments: { orderBy: { date: "desc" }, take: 10 },
          supportRequests: { orderBy: { createdAt: "desc" }, take: 5 },
          makeUpRequests: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      });

      if (!student) throw new Error(`Student not found with identifier: ${identifier}`);

      // Enforce Scoped Access if parent context provided
      if (context.parentId && student.parentId !== context.parentId) {
        throw new Error("Forbidden: You do not have permission to access this student profile.");
      }
      if (context.parentPhone && student.parent?.phone !== context.parentPhone) {
        throw new Error("Forbidden: You do not have permission to access this student profile.");
      }

      return {
        content: [{ type: "text", text: JSON.stringify(student, null, 2) }],
        data: student,
      };
    }

    // 3. get_parent_children
    if (toolName === "get_parent_children") {
      const phone = (args?.phone as string) || context.parentPhone;
      if (!phone) throw new Error("Missing required argument: phone");

      const parent = await prisma.parent.findUnique({
        where: { phone },
        include: {
          students: {
            include: {
              facility: true,
              classes: { include: { course: true } },
              attendances: {
                include: { schedule: true },
                orderBy: { schedule: { date: "desc" } },
                take: 3,
              },
            },
          },
        },
      });

      if (!parent) {
        return {
          content: [{ type: "text", text: JSON.stringify({ message: "Parent not found", childrenCount: 0, children: [] }, null, 2) }],
          data: { message: "Parent not found", childrenCount: 0, children: [] },
        };
      }

      const result = {
        parent: { id: parent.id, name: parent.name, phone: parent.phone, email: parent.email },
        childrenCount: parent.students.length,
        children: parent.students,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        data: result,
      };
    }

    // 4. find_available_classes
    if (toolName === "find_available_classes") {
      const courseIdent = (args?.courseId as string) || "";
      if (!courseIdent) throw new Error("Missing required argument: courseId");

      // Find course by ID or code
      const course = await prisma.course.findFirst({
        where: {
          OR: [{ id: courseIdent }, { code: courseIdent }, { name: { contains: courseIdent } }],
        },
      });

      const courseId = course ? course.id : courseIdent;

      const classes = await prisma.class.findMany({
        where: { courseId, status: "ONGOING" },
        include: { students: true, schedules: true, facility: true, course: true },
      });

      const availableClasses = classes.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        course: c.course.name,
        facility: c.facility.name,
        capacity: c.capacity,
        enrolled: c.students.length,
        availableSlots: Math.max(0, c.capacity - c.students.length),
        status: c.status,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify({ availableClasses }, null, 2) }],
        data: { availableClasses },
      };
    }

    // 5. create_makeup_request
    if (toolName === "create_makeup_request") {
      const { studentId: studentIdent, missedScheduleId, targetScheduleId, notes } = args as Record<string, string>;

      if (!studentIdent || !missedScheduleId || !targetScheduleId) {
        throw new Error("Missing required arguments: studentId, missedScheduleId, targetScheduleId");
      }

      const student = await prisma.student.findFirst({
        where: { OR: [{ id: studentIdent }, { code: studentIdent }] },
      });

      if (!student) throw new Error(`Student not found: ${studentIdent}`);

      // Check attendance
      const attendance = await prisma.attendance.findUnique({
        where: { scheduleId_studentId: { scheduleId: missedScheduleId, studentId: student.id } },
      });

      if (!attendance || (attendance.status !== "ABSENT" && attendance.status !== "EXCUSED")) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Học viên không vắng mặt buổi này (hoặc chưa được ghi nhận vắng), không thể đăng ký học bù.",
                code: "INVALID_ATTENDANCE_STATUS",
              }),
            },
          ],
          isError: true,
        };
      }

      // Check for duplicate request
      const existing = await prisma.makeUpRequest.findFirst({
        where: { studentId: student.id, missedScheduleId },
      });

      if (existing) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Đã có yêu cầu học bù cho buổi nghỉ này.",
                code: "DUPLICATE_REQUEST",
                existingRequestId: existing.id,
              }),
            },
          ],
          isError: true,
        };
      }

      const req = await prisma.makeUpRequest.create({
        data: {
          studentId: student.id,
          missedScheduleId,
          targetScheduleId,
          notes: notes || "",
          status: "PENDING",
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "CREATE_MAKEUP_REQUEST_MCP",
          entityType: "MakeUpRequest",
          entityId: req.id,
          details: JSON.stringify(args),
          source: "MCP_ORCHEXA",
        },
      });

      const resObj = {
        success: true,
        requestId: req.id,
        status: req.status,
        message: `Đã tạo yêu cầu học bù thành công cho học viên ${student.name} (${student.code})`,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(resObj, null, 2) }],
        data: resObj,
      };
    }

    // 6. create_order
    if (toolName === "create_order") {
      const { parentName, parentPhone, courseId: courseIdent, facilityId: facilityIdent, amount, notes } = args as any;

      if (!parentName || !parentPhone || !courseIdent || !facilityIdent) {
        throw new Error("Missing required arguments: parentName, parentPhone, courseId, facilityId");
      }

      // Resolve course
      const course = await prisma.course.findFirst({
        where: { OR: [{ id: courseIdent }, { code: courseIdent }, { name: { contains: courseIdent } }] },
      });
      if (!course) throw new Error(`Course not found: ${courseIdent}`);

      // Resolve facility
      const facility = await prisma.facility.findFirst({
        where: { OR: [{ id: facilityIdent }, { name: { contains: facilityIdent } }] },
      });
      if (!facility) throw new Error(`Facility not found: ${facilityIdent}`);

      const code = `ORD-${Date.now().toString().slice(-6)}`;
      const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount) || course.fee || 0;

      const order = await prisma.order.create({
        data: {
          code,
          parentName,
          parentPhone,
          courseId: course.id,
          facilityId: facility.id,
          amount: parsedAmount,
          notes: notes || "",
          status: "PENDING",
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "CREATE_ORDER_MCP",
          entityType: "Order",
          entityId: order.id,
          details: JSON.stringify(args),
          source: "MCP_ORCHEXA",
        },
      });

      const resObj = {
        success: true,
        orderCode: order.code,
        orderId: order.id,
        amount: order.amount,
        status: order.status,
        message: `Đã tạo đơn đăng ký khóa học ${course.name} thành công cho phụ huynh ${parentName}.`,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(resObj, null, 2) }],
        data: resObj,
      };
    }

    // 7. create_support_request
    if (toolName === "create_support_request") {
      const { studentId: studentIdent, type, content, priority } = args as Record<string, string>;

      if (!studentIdent || !type || !content) {
        throw new Error("Missing required arguments: studentId, type, content");
      }

      const student = await prisma.student.findFirst({
        where: { OR: [{ id: studentIdent }, { code: studentIdent }] },
      });
      if (!student) throw new Error(`Student not found: ${studentIdent}`);

      const req = await prisma.supportRequest.create({
        data: {
          studentId: student.id,
          type: type || "INFO",
          content,
          priority: priority || "NORMAL",
          status: "NEW",
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "CREATE_SUPPORT_REQUEST_MCP",
          entityType: "SupportRequest",
          entityId: req.id,
          details: JSON.stringify(args),
          source: "MCP_ORCHEXA",
        },
      });

      const resObj = {
        success: true,
        ticketId: req.id,
        type: req.type,
        status: req.status,
        message: `Đã tiếp nhận yêu cầu hỗ trợ (${req.type}) cho học viên ${student.name}.`,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(resObj, null, 2) }],
        data: resObj,
      };
    }

    // 8. generate_student_report
    if (toolName === "generate_student_report") {
      const studentIdent =
        (args?.studentId as string) ||
        (args?.studentCode as string) ||
        (args?.studentName as string) ||
        (args?.query as string) ||
        "";
      const rawType = (args?.type as string) || "ACADEMIC_RESULTS";

      if (!studentIdent) {
        throw new Error("Missing required argument: studentId (Mã học viên hoặc Tên/ID học viên)");
      }

      const hostBase = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
      const report = await generateStudentReport(studentIdent, rawType, { baseUrl: hostBase });

      // Enforce Scoped Access if parent context provided
      if (context.parentId && report.student.parent?.id !== context.parentId) {
        throw new Error("Forbidden: Bạn không có quyền truy cập báo cáo học tập của học viên này.");
      }
      if (context.parentPhone && report.student.parent?.phone !== context.parentPhone) {
        throw new Error("Forbidden: Bạn không có quyền truy cập báo cáo học tập của học viên này.");
      }

      await prisma.activityLog.create({
        data: {
          action: "GENERATE_STUDENT_REPORT_MCP",
          entityType: "StudentReport",
          entityId: report.id,
          details: JSON.stringify({ studentCode: report.student.code, type: report.type }),
          source: "MCP_ORCHEXA",
        },
      });

      // Construct readable Markdown response for Agent Orchexa to speak or display
      let formattedText = `### 📊 ${report.title}\n\n`;
      formattedText += `**Loại báo cáo:** ${report.typeName}\n`;
      formattedText += `**Học viên:** ${report.student.name} (Mã: \`${report.student.code}\`) • **Cơ sở:** ${report.student.facility.name}\n\n`;
      formattedText += `> 📝 **Tóm tắt đánh giá:** ${report.summaryText}\n\n`;
      formattedText += `**Điểm nổi bật:**\n`;
      report.shortHighlights.forEach((h) => {
        formattedText += `- ${h}\n`;
      });
      formattedText += `\n🔗 **Link xem chi tiết báo cáo (Preview):** [Bấm vào đây để xem bản đầy đủ](${report.previewUrl})\n`;
      formattedText += `📄 **Link in / Lưu PDF:** [Bấm vào đây để mở bản in PDF](${report.pdfUrl})\n`;

      return {
        content: [{ type: "text", text: formattedText }],
        data: report,
      };
    }

    throw new Error(`Tool '${name}' is not supported.`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error executing tool '${name}': ${error.message}` }],
      isError: true,
      data: { error: error.message },
    };
  }
}

export async function handleMcpJsonRpc(body: any, headers?: Headers): Promise<{ status: number; body: any }> {
  // Extract auth/context from headers if present
  const authHeader = headers?.get("authorization") || "";
  const apiKeyHeader = headers?.get("x-api-key") || "";
  const parentPhoneHeader = headers?.get("x-parent-phone") || "";
  const parentIdHeader = headers?.get("x-parent-id") || "";

  const context: McpContext = {
    source: "HTTP_STREAMABLE",
  };

  if (parentPhoneHeader) context.parentPhone = parentPhoneHeader;
  if (parentIdHeader) context.parentId = parentIdHeader;

  // List of accepted System Keys
  const validSystemKeys = getValidAdminKeys();

  let extractedToken = "";
  if (authHeader.startsWith("Bearer ")) {
    extractedToken = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    extractedToken = apiKeyHeader.trim();
  }

  let isSystemAuth = false;
  let isParentAuth = false;

  if (extractedToken) {
    if (extractedToken.startsWith("phone_") || extractedToken.match(/^0\d{9}$/)) {
      context.parentPhone = extractedToken.replace("phone_", "");
      isParentAuth = true;
    } else if (extractedToken.startsWith("parent_") || extractedToken.startsWith("cm")) {
      context.parentId = extractedToken.replace("parent_", "");
      isParentAuth = true;
    } else {
      // Any valid Bearer token provided in header acts as System / Agent Token
      isSystemAuth = true;
    }
  }

  // Handle Orchexa actor context in tool call _meta if injected
  if (body?.params?._meta?.orchexa?.actor) {
    const actor = body.params._meta.orchexa.actor;
    if (actor.phone) context.parentPhone = actor.phone;
    if (actor.id) context.actorId = actor.id;
    if (actor.phone || actor.id) isParentAuth = true;
  }

  if (parentPhoneHeader || parentIdHeader) {
    isParentAuth = true;
  }

  // JSON-RPC 2.0 Request parsing
  const { jsonrpc, id, method, params } = body || {};

  if (jsonrpc !== "2.0") {
    return {
      status: 400,
      body: {
        jsonrpc: "2.0",
        id: id ?? null,
        error: { code: -32600, message: "Invalid Request: Expected JSON-RPC 2.0" },
      },
    };
  }

  // MCP Protocol Discovery & Handshake methods (Always allowed for client discovery)
  if (method === "initialize") {
    return {
      status: 200,
      body: {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: {
            name: "educenter-sis-mcp",
            version: "1.0.0",
          },
          instructions: "EduCenter SIS Model Context Protocol server. Provides student management, attendance, makeup classes, and order registration tools for Orchexa AI Agents.",
        },
      },
    };
  }

  if (method === "notifications/initialized" || method === "initialized") {
    return {
      status: 200,
      body: {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {},
      },
    };
  }

  if (method === "ping") {
    return {
      status: 200,
      body: {
        jsonrpc: "2.0",
        id,
        result: {},
      },
    };
  }

  if (method === "tools/list") {
    return {
      status: 200,
      body: {
        jsonrpc: "2.0",
        id,
        result: {
          tools: listMcpTools(),
        },
      },
    };
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    if (!toolName) {
      return {
        status: 400,
        body: {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Invalid params: 'name' is required for tools/call" },
        },
      };
    }

    const result = await executeMcpTool(toolName, toolArgs, context);

    return {
      status: 200,
      body: {
        jsonrpc: "2.0",
        id,
        result: {
          content: result.content,
          isError: result.isError ?? false,
          _meta: {
            executedAt: new Date().toISOString(),
            tool: toolName,
          },
        },
      },
    };
  }

  return {
    status: 404,
    body: {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    },
  };
}
