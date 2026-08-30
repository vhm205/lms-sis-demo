import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { prisma } from "./lib/prisma";
const server = new Server(
  { name: "educenter-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_students",
        description: "Tìm kiếm học viên theo tên, mã hoặc số điện thoại phụ huynh",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Từ khóa tìm kiếm (tên, mã HV, SĐT)" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_student_info",
        description: "Lấy thông tin tổng hợp của một học viên (lịch học, điểm danh, kết quả, yêu cầu)",
        inputSchema: {
          type: "object",
          properties: {
            studentId: { type: "string" },
          },
          required: ["studentId"],
        },
      },
      {
        name: "create_makeup_request",
        description: "Tạo yêu cầu học bù cho học viên",
        inputSchema: {
          type: "object",
          properties: {
            studentId: { type: "string" },
            missedScheduleId: { type: "string", description: "ID của buổi học đã nghỉ" },
            targetScheduleId: { type: "string", description: "ID của buổi học muốn học bù" },
            notes: { type: "string" },
          },
          required: ["studentId", "missedScheduleId", "targetScheduleId"],
        },
      },
      {
        name: "find_available_classes",
        description: "Tìm các lớp còn chỗ trống cho một khóa học cụ thể",
        inputSchema: {
          type: "object",
          properties: {
            courseId: { type: "string" },
          },
          required: ["courseId"],
        },
      },
      {
        name: "create_order",
        description: "Tạo đơn đăng ký khóa học (Order) cho khách hàng",
        inputSchema: {
          type: "object",
          properties: {
            parentName: { type: "string" },
            parentPhone: { type: "string" },
            courseId: { type: "string" },
            facilityId: { type: "string" },
            amount: { type: "number" },
            notes: { type: "string" }
          },
          required: ["parentName", "parentPhone", "courseId", "facilityId"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_students") {
      const query = args?.query as string;
      const students = await prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
            { phone: { contains: query } },
            { parent: { phone: { contains: query } } },
            { parent: { name: { contains: query } } }
          ],
        },
        include: { parent: true, facility: true }
      });
      return { content: [{ type: "text", text: JSON.stringify(students, null, 2) }] };
    }

    if (name === "get_student_info") {
      const studentId = args?.studentId as string;
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          parent: true,
          facility: true,
          classes: { include: { course: true } },
          attendances: { include: { schedule: { include: { room: true } } }, orderBy: { updatedAt: 'desc' }, take: 10 },
          assignments: { orderBy: { date: 'desc' } },
          supportRequests: true
        }
      });
      if (!student) throw new Error("Student not found");
      return { content: [{ type: "text", text: JSON.stringify(student, null, 2) }] };
    }

    if (name === "find_available_classes") {
      const courseId = args?.courseId as string;
      const classes = await prisma.class.findMany({
        where: { courseId, status: 'ONGOING' },
        include: { students: true, schedules: true }
      });
      
      const availableClasses = classes.filter(c => c.students.length < c.capacity).map(c => ({
        id: c.id,
        name: c.name,
        capacity: c.capacity,
        enrolled: c.students.length,
        available: c.capacity - c.students.length
      }));
      return { content: [{ type: "text", text: JSON.stringify(availableClasses, null, 2) }] };
    }

    if (name === "create_makeup_request") {
      const { studentId, missedScheduleId, targetScheduleId, notes } = args as any;
      
      // Check if attendance was ABSENT or EXCUSED
      const attendance = await prisma.attendance.findUnique({
        where: { scheduleId_studentId: { scheduleId: missedScheduleId, studentId } }
      });
      if (!attendance || (attendance.status !== 'ABSENT' && attendance.status !== 'EXCUSED')) {
        return { content: [{ type: "text", text: "Lỗi: Học viên không vắng mặt buổi này, không thể học bù." }] };
      }

      // Check for duplicate request
      const existing = await prisma.makeUpRequest.findFirst({
        where: { studentId, missedScheduleId }
      });
      if (existing) {
        return { content: [{ type: "text", text: "Lỗi: Đã có yêu cầu học bù cho buổi này." }] };
      }

      const req = await prisma.makeUpRequest.create({
        data: { studentId, missedScheduleId, targetScheduleId, notes: notes || "" }
      });
      return { content: [{ type: "text", text: `Đã tạo yêu cầu học bù thành công: ${req.id}` }] };
    }

    if (name === "create_order") {
      const { parentName, parentPhone, courseId, facilityId, amount, notes } = args as any;
      const code = `ORD-${Date.now().toString().slice(-6)}`;
      const order = await prisma.order.create({
        data: {
          code, parentName, parentPhone, courseId, facilityId, 
          amount: amount || 0, notes: notes || "", status: "PENDING"
        }
      });
      return { content: [{ type: "text", text: `Đã tạo đơn đăng ký thành công: ${order.code} (ID: ${order.id})` }] };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server is running on stdio");
}

main().catch(console.error);
