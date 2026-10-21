# Feature Specification: CRM LMS Simulator & External Partner Integration Module

**Feature Branch**: `001-partner-simulator`  
**Created**: 2026-10-21  
**Status**: Specified  
**Input**: Feature Brief and requirements from `docs/briefs/00-crm-lms-simulator-module.md`, `01-brief-outcomes-and-kpis.md`, `02-journey-automation-and-operations.md`

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mock Billing Gateway & Payment Confirmation (Priority: P1)

Là một Solution Consultant hoặc Kỹ sư Tích hợp thực hiện kịch bản demo Biến thể EDU-02-A (Có hệ thống), tôi muốn có một hệ thống Mock Billing độc lập có khả năng phát Webhook xác nhận thanh toán (`payment_success`) hoặc hoàn tiền (`refund_processed`) về SIS, để chứng minh quy trình dòng tiền được xác nhận khách quan từ cổng thanh toán thay vì nhân viên bấm tay hoặc dựa trên lời tự khai của khách.

**Why this priority**: Đây là điều kiện tiên quyết để tính toán mốc KPI "Dùng thử -> Mua" và "Doanh thu thuần cohort" (Brief 01). Xác nhận thanh toán độc lập là cổng kích hoạt chuyển đổi sang bước S05 (Học chính thức).

**Independent Test**:
- Tạo một đơn hàng mới (`PENDING`).
- Gửi webhook giả lập từ Billing Mock tới endpoint `/api/webhooks/billing/payment-confirmation`.
- Kiểm tra đơn hàng tự động chuyển sang `PAID`, phát sinh `ActivityLog` có nguồn `BILLING_MOCK`, và tự động kích hoạt `Entitlement`.

**Acceptance Scenarios**:
1. **Given** một đơn hàng ở trạng thái `PENDING` với mã `ORD-123456`, **When** Mock Billing gửi webhook `payment_success` kèm `transaction_id` và `amount` khớp đơn hàng, **Then** đơn hàng chuyển thành `PAID`, `ActivityLog` lưu bằng chứng giao dịch, và hệ thống kích hoạt gói học chính thức.
2. **Given** một đơn hàng đã thanh toán `PAID`, **When** Mock Billing gửi webhook `refund_processed`, **Then** đơn hàng chuyển thành `REFUNDED` (hoặc `CANCELLED`), hệ thống hạ quyền `Entitlement` và ghi nhận doanh thu điều chỉnh.
3. **Given** webhook gửi với `dedup_key` đã tồn tại, **When** gửi lại webhook lặp, **Then** hệ thống trả về phản hồi bỏ qua trùng lặp mà không thay đổi trạng thái lần 2.

---

### User Story 2 - Mock LMS Progress & "Bắt đầu học" Event (Priority: P1)

Là một Solution Consultant hoặc Quản lý Vận hành, tôi muốn có Mock LMS Simulator có khả năng cấp quyền dùng thử (Trial Provisioning) và phát sự kiện tiến độ học tập (`lms.first_login`, `lms.lesson_completed`) về SIS qua Webhook, để làm bằng chứng khách quan cho mốc "Bắt đầu học" (Start of Learning) phục vụ KPI chuyển đổi.

**Why this priority**: Không thể tính mốc KPI "Mua -> Bắt đầu học" (Brief 01) nếu thiếu dữ liệu hoạt động học từ LMS/App. Đồng thời, Journey S02 yêu cầu tự động cấp quyền dùng thử khi khách đăng ký.

**Independent Test**:
- Gọi API cấp tài khoản thử `/api/mock/lms/trial-accounts` -> Nhận thông tin tài khoản và link học thử.
- Kích hoạt event giả lập `lms.first_login` qua Webhook `/api/webhooks/lms/progress` -> SIS ghi nhận mốc bắt đầu học của học viên với `external_reference`.

**Acceptance Scenarios**:
1. **Given** một Lead ở trạng thái `TRIAL_BOOKED`, **When** hệ thống gọi API cấp quyền thử Mock LMS, **Then** trả về `learner_id`, `trial_token`, link truy cập với hạn dùng 7 ngày, cập nhật trạng thái Lead sang `TRIAL_PROVISIONED`.
2. **Given** học viên đã mua gói học chính thức hoặc đang dùng thử, **When** Mock LMS phát webhook sự kiện `lms.first_login` hoặc `lms.lesson_completed`, **Then** SIS cập nhật bản ghi hoạt động học tập, đánh dấu mốc "Bắt đầu học" kèm timestamp xác nhận từ LMS.

---

### User Story 3 - Entitlement & Subscription Management (Priority: P2)

Là một nhân viên CS/Sales hoặc AI Agent thực hiện hành trình S06 (Tư vấn gia hạn), tôi muốn hệ thống có bảng quản lý quyền sở hữu gói học (`Entitlement`) với ngày hết hạn cụ thể (`expires_at`), và API tra cứu hạn gói, để AI Agent có thể phát hiện học viên sắp hết hạn và kích hoạt kịch bản chăm sóc gia hạn.

**Why this priority**: Cần thiết để hỗ trợ trọn vẹn vòng đời học viên (S05 Kích hoạt gói chính thức -> S06 Gia hạn khi gói đến hạn).

**Independent Test**:
- Kiểm tra danh sách Entitlement của học viên sau khi đơn hàng được thanh toán.
- Gọi API `/api/entitlements?studentId=...` -> Trả về hạn gói (`expiresAt`), số ngày còn lại, và trạng thái `ACTIVE` / `EXPIRED`.

**Acceptance Scenarios**:
1. **Given** đơn hàng gói học 3 tháng thanh toán thành công, **When** hệ thống xử lý kích hoạt entitlement, **Then** một bản ghi `Entitlement` được tạo với `status = ACTIVE`, `startsAt = now()`, `expiresAt = now() + 90 days`.
2. **Given** gói học có `expiresAt` còn dưới 7 ngày, **When** truy vấn qua API kiểm tra hạn gói, **Then** hệ thống gắn cờ `EXPIRING_SOON` để kích hoạt kịch bản chăm sóc gia hạn.

---

### User Story 4 - Partner Simulator Console in Developer Hub (Priority: P2)

Là một kỹ sư tích hợp hoặc diễn giả demo, tôi muốn có một giao diện trực quan tại `/developer` (tab Simulator) để kích hoạt tức thì các sự kiện Mock (Thanh toán Billing, Bắt đầu học LMS, Hết hạn Entitlement) chỉ với 1 cú click chuột, và quan sát kết quả phản hồi theo thời gian thực.

**Why this priority**: Giúp việc trình diễn demo liền mạch, không cần dùng Postman/cURL ngoài, dễ dàng thao tác cho cả người dùng phi kỹ thuật.

**Independent Test**:
- Truy cập `/developer`, mở tab "Partner Simulator".
- Chọn một đơn hàng đang `PENDING` -> Click "Mô phỏng Thanh toán Thành công" -> Quan sát trạng thái đơn hàng đổi thành `PAID` và Entitlement được cấp ngay trên giao diện.

**Acceptance Scenarios**:
1. **Given** người dùng ở trang Developer Hub tab Partner Simulator, **When** click nút "Kích hoạt Thanh toán Thành công" cho đơn hàng đã chọn, **Then** hệ thống bắn webhook nội bộ và hiển thị thông báo thành công cùng event log chi tiết.
2. **Given** người dùng click nút "Mô phỏng Học sinh Đăng nhập LMS", **Then** hệ thống bắn webhook tiến độ học và hiển thị kết quả cập nhật mốc học tập.

---

### User Story 5 - Event Mapping Schema, Idempotency & Fallback (Priority: P3)

Là một kiến trúc sư giải pháp SaaS, tôi muốn các webhook và API trao đổi dữ liệu tuân thủ bộ trường chuẩn (`request_id`, `learner_id`, `contact_id`, `case_variant`, `external_reference`), có cơ chế khử trùng lặp (Idempotency) và fallback sang trạng thái chờ khi Mock bị lỗi, để đảm bảo tính an toàn dữ liệu và không làm phát sinh bản ghi lặp.

**Why this priority**: Đảm bảo tuân thủ nghiêm ngặt Section 2 (Event Mapping) và Section 3 (Nguyên tắc giả lập & Ngoại lệ) của Brief 00.

**Independent Test**:
- Gửi 2 request webhook giống hệt nhau có cùng `dedup_key`.
- Kiểm tra hệ thống chỉ xử lý 1 lần, lần 2 trả về `isDuplicate: true`.
- Gửi webhook với cờ lỗi hoặc timeout -> Kiểm tra yêu cầu chuyển sang trạng thái `PENDING_REVIEW` cho nhân viên xử lý.

**Acceptance Scenarios**:
1. **Given** một webhook với `dedup_key` đã được xử lý trước đó, **When** cùng payload được gửi lại, **Then** hệ thống trả về HTTP 200 kèm `isDuplicate: true`, không cập nhật trùng lặp DB.
2. **Given** Mock Service giả lập lỗi kết nối hoặc phản hồi lỗi, **When** hệ thống tiếp nhận, **Then** trạng thái yêu cầu được giữ ở `PENDING_REVIEW` hoặc gán CS/Admin phụ trách, tuyệt đối không tự động báo hoàn tất giả.

---

## Edge Cases

- **Giao dịch thanh toán không tìm thấy đơn hàng**: Webhook Billing gửi mã đơn hàng không tồn tại trong hệ thống -> Trả về lỗi 404, ghi ActivityLog loại cảnh báo, không làm gián đoạn hệ thống.
- **Số tiền thanh toán lệch với đơn hàng**: Webhook Billing gửi `amount` khác với `Order.amount` -> Đánh dấu đơn hàng `PAYMENT_MISMATCH`, gán CS kiểm tra đối soát, không tự động cấp Entitlement.
- **Tiến độ học của học viên chưa có tài khoản**: LMS gửi tiến độ của `learner_id` chưa liên kết với `Student` -> Hệ thống lưu log và giữ trong hàng đợi đối soát (Unmapped Events).
- **Gia hạn gói khi gói cũ đã hết hạn lâu**: Kích hoạt gia hạn tính ngày bắt đầu từ ngày thanh toán mới thay vì cộng dồn vào hạn cũ đã hết hạn.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI có model `Entitlement` trong Prisma schema để quản lý thời hạn quyền sử dụng dịch vụ/khóa học (`learnerId`, `courseId`, `orderId`, `startsAt`, `expiresAt`, `status`, `source`).
- **FR-002**: Hệ thống PHẢI cung cấp Webhook Endpoint `/api/webhooks/billing/payment-confirmation` để tiếp nhận kết quả thanh toán từ Billing Gateway Mock (`payment_success`, `payment_failed`, `refund_processed`).
- **FR-003**: Hệ thống PHẢI tự động chuyển trạng thái `Order` sang `PAID` và kích hoạt `Entitlement` khi nhận được webhook `payment_success` hợp lệ.
- **FR-004**: Hệ thống PHẢI cung cấp Webhook Endpoint `/api/webhooks/lms/progress` để tiếp nhận sự kiện học tập từ LMS Mock (`lms.first_login`, `lms.lesson_completed`, `lms.progress_updated`).
- **FR-005**: Hệ thống PHẢI cung cấp Mock API `/api/mock/lms/trial-accounts` để cấp tài khoản và quyền học thử cho Lead/Học viên.
- **FR-006**: Hệ thống PHẢI cung cấp API `/api/entitlements` hỗ trợ tra cứu danh sách và thời hạn gói học của học viên theo `studentId` hoặc `learner_id`.
- **FR-007**: Hệ thống PHẢI có giao diện **Partner Simulator Console** trong `/developer` cho phép người dùng kích hoạt các sự kiện Billing, LMS, và Entitlement một cách trực quan.
- **FR-008**: Tất cả các payload webhook PHẢI hỗ trợ chuẩn hóa trường dữ liệu: `request_id`, `learner_id`, `contact_id`, `case_variant`, `external_reference`, `dedup_key`.
- **FR-009**: Hệ thống PHẢI khử trùng lặp (Idempotency) dựa trên `dedup_key` hoặc `request_id`, ghi nhận vào `ActivityLog`.
- **FR-010**: Khi Mock Service xảy ra lỗi hoặc timeout, hệ thống PHẢI duy trì trạng thái chờ duyệt (`PENDING_REVIEW`) hoặc tạo `SupportRequest` chuyển người xử lý, tuyệt đối không thông báo hoàn tất giả.

---

## Non-Functional Requirements

- **NFR-001 (Performance)**: Xử lý webhook và cập nhật trạng thái trong vòng dưới 300ms đối với môi trường demo cục bộ.
- **NFR-002 (Auditability)**: Mọi sự kiện từ Billing Mock và LMS Mock đều được lưu vết đầy đủ trong bảng `ActivityLog` với payload JSON và thời điểm nhận.
- **NFR-003 (Clean Architecture & Type Safety)**: Mã nguồn tuân thủ TypeScript nghiêm ngặt, sử dụng Zod schema để validate webhook payload.
