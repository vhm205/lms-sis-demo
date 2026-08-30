# EduCenter VN Sandbox

Nền tảng mô phỏng vận hành trung tâm giáo dục tại Việt Nam, phục vụ làm môi trường sandbox cho AI Agent.

## Yêu cầu hệ thống
- Node.js 18+
- npm hoặc pnpm

## Hướng dẫn cài đặt & chạy local

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Cấu hình môi trường (`.env`):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Tạo cơ sở dữ liệu và seed dữ liệu mẫu:
   ```bash
   npx prisma db push
   npm run seed
   ```
   *Lệnh reset dữ liệu: Xóa file `dev.db`, chạy lại `npx prisma db push` và `npm run seed`.*

4. Chạy ứng dụng Next.js:
   ```bash
   npm run dev
   ```
   Giao diện quản trị sẽ mở tại: [http://localhost:3000](http://localhost:3000)

## Tài khoản Demo (Tham khảo)
- **Quản trị viên**: `admin@demo.com`
- **Tư vấn viên**: `sales@demo.com`
- **Chăm sóc HV**: `cs@demo.com`
- **Giáo viên 1**: `teacher1@demo.com`
- **Giáo viên 2**: `teacher2@demo.com`

## Cấu trúc thư mục
- `/src/app`: Các trang giao diện (Dashboard, Học viên, Lớp học, Lịch học, CRM) và API.
- `/src/app/api`: Các endpoint RESTful cho frontend và AI Agent.
- `/src/components`: UI components (sử dụng shadcn/ui).
- `/src/mcp.ts`: Mã nguồn MCP Server cho AI Agent tích hợp.
- `/prisma/schema.prisma`: Mô hình dữ liệu chuẩn.
- `/seed.ts`: Script tạo dữ liệu mẫu.

## Tài liệu API

Ứng dụng cung cấp các RESTful API tại `/api/*`:

- `GET /api/students/search?query={keyword}`: Tìm học viên theo tên, mã, số ĐT (của học viên hoặc phụ huynh).
- `GET /api/students/{id}`: Lấy chi tiết hồ sơ học viên, lịch học, kết quả bài tập, và điểm danh.
- `POST /api/requests/makeup`: Tạo yêu cầu học bù. (Cần `{studentId, missedScheduleId, targetScheduleId, notes}`). Kiểm tra nghiêm ngặt điều kiện (phải vắng mặt/xin phép, không trùng lặp).
- `POST /api/requests/support`: Tạo yêu cầu hỗ trợ chung. (Cần `{studentId, type, content, priority}`).

## Tài liệu MCP (Model Context Protocol)

MCP Server có thể chạy độc lập dưới dạng stdio để Agent kết nối:

```bash
npm run mcp
```

### Các Tool hỗ trợ:
1. `search_students`: Tìm học viên theo tên, mã hoặc SĐT.
2. `get_student_info`: Lấy thông tin tổng hợp của một học viên cụ thể (id).
3. `find_available_classes`: Tìm lớp còn chỗ trống của một khóa học.
4. `create_makeup_request`: Thực hiện tạo yêu cầu học bù có kiểm tra quy tắc.

*Ví dụ cấu hình Cursor/Claude MCP:*
```json
{
  "mcpServers": {
    "educenter": {
      "command": "npx",
      "args": ["tsx", "src/mcp.ts"]
    }
  }
}
```

## Kiểm thử nghiệp vụ chính
1. Truy cập trang giao diện, xem dữ liệu học viên, lớp học.
2. Tìm học viên "Bé Minh" hoặc bằng số điện thoại "0901234567" qua API `/api/students/search?query=Minh`.
3. Gọi MCP tool `get_student_info` với ID của học viên tìm được để xem học viên nghỉ buổi nào.
4. Gọi MCP tool `create_makeup_request` với `missedScheduleId` của buổi vắng mặt để hệ thống tự động kiểm tra điều kiện học bù (chỉ cho phép nếu học viên đã điểm danh Vắng/Xin phép).

## Tích hợp Orchexa Embedded AI (Voice & Chat Agent)

Hệ thống tích hợp nền tảng **Orchexa Embedded AI** qua kiến trúc BFF (Backend-for-Frontend) an toàn:

### 1. Kiến trúc bảo mật BFF:
- **BFF HMAC-SHA256**: Partner Backend thực hiện ký canonical string `POST\n/api/v1/embedded/sessions\n${ts}\n${bodyHash}` bằng `ORCHEXA_CLIENT_SECRET`. Khóa bí mật không bao giờ lộ ra client.
- **Per-User Session**: Mỗi phụ huynh/người dùng nhận một `session_token` (bắt đầu bằng `ocxs_`).
- **Context Injection**: Backend tự động tải toàn bộ thông tin học viên, lớp học, điểm danh gần nhất, bài tập, đơn hàng và gửi trong `initial_context.customer` để AI Agent hiểu rõ ngữ cảnh trước lượt chat đầu tiên.

### 2. Endpoints & Thành phần:
- `POST /api/ai/bootstrap`: API BFF xác thực phụ huynh và tạo Orchexa session token kèm CRM context.
- `src/lib/orchexa.ts`: Thư viện Node/TypeScript ký HMAC SHA-256 theo chuẩn Orchexa.
- `src/components/OrchexaWidget.tsx`: Widget frontend tải SDK `voice-agent.js` và khởi tạo tự động.

### 3. Kiểm thử Smoke Test:
```bash
# Thiết lập secret trong .env hoặc truyền inline:
ORCHEXA_CLIENT_SECRET="your_secret_here" npm run smoke:orchexa
```

---
*Dự án được xây dựng đặc thù cho môi trường sandbox, ưu tiên sự đơn giản, rõ ràng và sử dụng SQLite để dễ dàng reset.*
