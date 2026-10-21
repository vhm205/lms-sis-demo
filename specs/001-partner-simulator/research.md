# Research: CRM LMS Simulator & External Partner Integration Module

**Feature**: `001-partner-simulator`  
**Date**: 2026-10-21  
**Status**: Completed  

---

## 1. Technical Context & Feasibility

### 1.1 Existing Architecture
- **Framework**: Next.js 15 with React 19, TypeScript, Tailwind CSS.
- **ORM / Database**: Prisma with SQLite (`prisma/dev.db`), `prisma-client-js` with `driverAdapters`.
- **Existing Webhooks**: `/api/webhooks/orchexa/lead-created`, `/api/webhooks/orchexa/order-created`, and `/api/webhooks/orchexa` (dispatcher).
- **Existing Event Logging**: Table `ActivityLog` in Prisma records actions (`action`, `entityType`, `entityId`, `details`, `source: UI | API | AI_AGENT`).
- **Developer Hub**: `/developer` (implemented with `developer-client.tsx`), provides REST API & MCP tool inspection.

### 1.2 Key Architectural Decisions

1. **In-App Mock Partner Services vs. External Mock Servers**:
   - *Decision*: Triển khai Mock Partner Services trực tiếp bên trong ứng dụng Next.js dưới dạng các API route và Server Actions, đi kèm với tab điều khiển trong Developer Hub.
   - *Rationale*: Giữ cho demo self-contained (chạy gọn trong `npm run dev`), không đòi hỏi người dùng phải khởi chạy WireMock hay Docker bên ngoài. Phù hợp hoàn hảo với kiến trúc demo hiện có.

2. **Entitlement Data Model**:
   - *Decision*: Tạo bảng mới `Entitlement` trong `prisma/schema.prisma` liên kết với `Student` (`learnerId`), `Course` (`courseId`), và tùy chọn `Order` (`orderId`).
   - *Fields*:
     - `id`: CUID
     - `studentId`: String (references Student)
     - `courseId`: String (references Course)
     - `orderId`: String? (references Order)
     - `type`: String (`TRIAL`, `OFFICIAL`, `RENEWAL`)
     - `status`: String (`ACTIVE`, `EXPIRED`, `SUSPENDED`, `REVOKED`)
     - `startsAt`: DateTime
     - `expiresAt`: DateTime
     - `source`: String (default: `PARTNER_SIMULATOR`)
     - `createdAt`, `updatedAt`: DateTime

3. **Billing Webhook Handlers (`/api/webhooks/billing/payment-confirmation`)**:
   - *Payload Events*:
     - `payment_success`: Chuyển `Order.status = "PAID"`, tự động cấp `Entitlement` (90 ngày cho gói chuẩn), ghi `ActivityLog` với source `BILLING_MOCK`.
     - `refund_processed`: Chuyển `Order.status = "CANCELLED"` hoặc `REFUNDED`, thu hồi hoặc chuyển trạng thái `Entitlement` sang `REVOKED`.
     - `payment_failed`: Ghi log lỗi, giữ trạng thái `Order.status = "PENDING"`.
   - *Idempotency*: Kiểm tra `dedup_key` qua bảng `ActivityLog` (action `WEBHOOK_BILLING_CONFIRMATION`).

4. **LMS Progress Webhook Handlers (`/api/webhooks/lms/progress`)**:
   - *Payload Events*:
     - `lms.first_login`: Đánh dấu học viên đã đăng nhập LMS lần đầu (mốc "Bắt đầu học" cho KPI).
     - `lms.lesson_completed`: Ghi nhận hoàn thành bài học 1, 2, 3...
   - *Audit Trail*: Ghi `ActivityLog` với action `LMS_ACTIVITY_RECORDED`, lưu trữ `external_reference`, `learner_id`, `timestamp`.

5. **Trial Account Provisioning (`/api/mock/lms/trial-accounts`)**:
   - Nhận `leadId` hoặc `phone`, `name`, `courseId`.
   - Tạo `Entitlement` loại `TRIAL` với thời hạn 7 ngày.
   - Cập nhật `Lead.status = "TRIAL_DONE"` hoặc `TRIAL_BOOKED`.
   - Trả về credentials giả lập và `access_url`.

6. **Partner Simulator Console in `/developer`**:
   - Bổ sung Tab `"Partner Simulator"` vào `src/app/(admin)/developer/developer-client.tsx`.
   - Cung cấp:
     - Form kích hoạt Webhook Billing (chọn đơn hàng `PENDING` -> Bấm "Giả lập Thanh toán thành công" / "Giả lập Hoàn tiền").
     - Form kích hoạt Webhook LMS (chọn học viên -> Bấm "Giả lập Bắt đầu học" / "Giả lập Hoàn thành bài 1").
     - Bảng hiển thị danh sách `Entitlement` hiện hành và nút "Gia hạn +30 ngày" hoặc "Hết hạn ngay".
     - Live Event Log xem payload request/response tức thì.
