# Tasks: CRM LMS Simulator & External Partner Integration Module

**Branch**: `001-partner-simulator` | **Input**: Design documents from `specs/001-partner-simulator/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  

---

## Phase 1: Setup & Data Modeling

**Purpose**: Thêm model Entitlement vào Prisma CSDL và đồng bộ schema.

- [x] T001 Cập nhật `prisma/schema.prisma`: Thêm model `Entitlement` và các quan hệ với `Student`, `Course`, `Order`
- [x] T002 Chạy lệnh `npx prisma db push` để áp dụng schema vào `prisma/dev.db` và sinh lại Prisma Client

---

## Phase 2: Foundational Libraries

**Purpose**: Xây dựng các core services tái sử dụng cho Entitlement, Billing và LMS.

- [x] T003 [P] Tạo `src/lib/entitlement.ts`: Service cấp quyền (issue), kích hoạt (activate), kiểm tra hạn (checkExpiration), gia hạn (renew) và thu hồi (revoke)
- [x] T004 [P] Tạo `src/lib/billing-simulator.ts`: Bộ xử lý webhook thanh toán/hoàn tiền, validate schema, kiểm tra idempotency (`dedup_key`), và cập nhật trạng thái `Order` -> `PAID` kèm phát sinh `Entitlement`
- [x] T005 [P] Tạo `src/lib/lms-simulator.ts`: Bộ xử lý sự kiện tiến độ học tập LMS (`lms.first_login`, `lms.lesson_completed`), cấp tài khoản học thử (trial provisioning), và ghi log bằng chứng KPI vào `ActivityLog`

---

## Phase 3: User Story 1 - Mock Billing Gateway & Payment Confirmation (Priority: P1) 🎯 MVP

**Goal**: Cho phép nhận Webhook xác nhận thanh toán hoặc hoàn tiền độc lập từ Billing Mock, tự động cập nhật đơn hàng và cấp Entitlement.

**Independent Test**:
- Gửi HTTP POST tới `/api/webhooks/billing/payment-confirmation` với payload `payment_success` -> Kiểm tra `Order.status = "PAID"`, tạo `Entitlement` tương ứng.

- [x] T006 [US1] Xây dựng endpoint `POST /api/webhooks/billing/payment-confirmation` trong `src/app/api/webhooks/billing/payment-confirmation/route.ts`
- [x] T007 [US1] Tích hợp xử lý `refund_processed` và `payment_failed` vào webhook handler
- [x] T008 [US1] Thêm cơ chế kiểm tra `dedup_key` (Idempotency) để bỏ qua webhook thanh toán trùng lặp

---

## Phase 4: User Story 2 - Mock LMS Progress & "Bắt đầu học" Event (Priority: P1)

**Goal**: Nhận sự kiện tiến độ học từ LMS để làm bằng chứng khách quan cho mốc "Bắt đầu học" (Start of Learning) phục vụ KPI.

**Independent Test**:
- Gọi `POST /api/mock/lms/trial-accounts` -> Nhận tài khoản thử.
- Gửi `POST /api/webhooks/lms/progress` -> Ghi nhận mốc học và timestamp từ LMS.

- [x] T009 [US2] Xây dựng endpoint `POST /api/webhooks/lms/progress` trong `src/app/api/webhooks/lms/progress/route.ts`
- [x] T010 [US2] Xây dựng mock API cấp quyền dùng thử `POST /api/mock/lms/trial-accounts` trong `src/app/api/mock/lms/trial-accounts/route.ts`

---

## Phase 5: User Story 3 - Entitlement & Subscription Management (Priority: P2)

**Goal**: Cung cấp API tra cứu hạn gói học và kích hoạt gia hạn (Renewal) cho hành trình S06.

**Independent Test**:
- Gọi `GET /api/entitlements?studentId=...` -> Nhận danh sách quyền truy cập kèm số ngày còn lại và cờ cảnh báo sắp hết hạn.

- [x] T011 [US3] Xây dựng API `GET /api/entitlements` và `POST /api/entitlements` trong `src/app/api/entitlements/route.ts`
- [x] T012 [US3] Tích hợp MCP Tool `check_entitlement` vào `src/lib/mcp-core.ts` để AI Agent có thể tra cứu trực tiếp

---

## Phase 6: User Story 4 - Partner Simulator Console in Developer Hub (Priority: P2)

**Goal**: Giao diện trực quan trong `/developer` cho phép Solution Consultant kích hoạt nhanh mọi mock event bằng 1 cú nhấp chuột.

**Independent Test**:
- Mở `/developer`, chuyển tab "Partner Simulator", chọn đơn hàng -> Click "Kích hoạt Thanh toán Thành công", quan sát đơn hàng đổi màu sang xanh (`PAID`) và log hiển thị ngay lập tức.

- [x] T013 [US4] Tạo component `PartnerSimulatorPanel` trong `src/app/(admin)/developer/partner-simulator-panel.tsx`
- [x] T014 [US4] Tích hợp tab "Partner Simulator" vào `src/app/(admin)/developer/developer-client.tsx`
- [x] T015 [US4] Bổ sung bảng quản lý và xem nhanh các Entitlement trực tiếp trên giao diện

---

## Phase 7: Polish, Verification & QC

**Purpose**: Kiểm thử toàn diện, kiểm tra Idempotency và chuẩn hóa TypeScript.

- [x] T016 Chạy kịch bản end-to-end theo `specs/001-partner-simulator/quickstart.md` (`scripts/test-simulator.ts`)
- [x] T017 Kiểm tra `npx tsc --noEmit` đảm bảo không có lỗi TypeScript (Clean compile)
