# Implementation Plan: CRM LMS Simulator & External Partner Integration Module

**Branch**: `001-partner-simulator` | **Date**: 2026-10-21 | **Spec**: [spec.md](spec.md)  
**Lane**: NORMAL (new feature across API, database schema, and developer UI; reversible in SQLite)  

---

## Summary

Xây dựng hệ thống Mock Partner Simulator phục vụ Biến thể EDU-02-A (Có hệ thống) bao gồm:
1. **Model `Entitlement`** trong Prisma để quản lý quyền sở hữu gói học/thời hạn (`startsAt`, `expiresAt`, `status`).
2. **Webhook Billing Hub (`/api/webhooks/billing/payment-confirmation`)** tiếp nhận xác nhận thanh toán/hoàn tiền từ Mock Billing và tự động cấp/hạ quyền Entitlement.
3. **Webhook LMS Hub (`/api/webhooks/lms/progress`)** tiếp nhận sự kiện tiến độ học tập từ Mock LMS làm nguồn bằng chứng cho mốc "Bắt đầu học" (Start of Learning) phục vụ KPI chuyển đổi.
4. **Mock API LMS Trial (`/api/mock/lms/trial-accounts`)** cung cấp tài khoản học thử tự động cho học viên.
5. **API & MCP Tool Tra cứu Entitlement (`/api/entitlements`)** phục vụ kiểm tra hạn gói và kích hoạt kịch bản chăm sóc gia hạn (S06).
6. **Partner Simulator Console** trong trang `/developer` cho phép Solution Consultant kích hoạt nhanh mọi mock event trực quan bằng 1 cú nhấp chuột.

---

## Technical Context

- **Language/Version**: TypeScript 5.x, Next.js 15 (App Router), React 19
- **Primary Dependencies**: Prisma ORM, Tailwind CSS, Lucide React, Zod
- **Storage**: SQLite (`prisma/dev.db`)
- **Testing**: Node test / Curl scripts / Simulator UI verification
- **Target Platform**: Node.js Linux server (local demo & cloud deployment)
- **Project Type**: Full-stack Next.js web application
- **Performance Goals**: Xử lý webhook và cập nhật trạng thái trong dưới 200ms
- **Constraints**: Tuân thủ Idempotency qua `dedup_key`, ghi vết audit log đầy đủ trong `ActivityLog`, không báo hoàn tất giả khi lỗi.

---

## Constitution Check

- ✅ **Library-First / Clean Architecture**: Các logic xử lý webhook và entitlement được module hóa trong `src/lib/billing-simulator.ts`, `src/lib/lms-simulator.ts`, và `src/lib/entitlement.ts`.
- ✅ **Testability**: Mọi endpoint webhook và mock API đều có thể test độc lập qua REST cURL, MCP inspector và giao diện Developer Hub.
- ✅ **Observability**: Ghi nhận toàn bộ sự kiện qua `ActivityLog` với trường `details` JSON và nguồn `source`.
- ✅ **Data Integrity**: Khử trùng lặp (Idempotency) dựa trên `dedup_key` / `request_id`.

---

## Project Structure & Deliverables

```text
specs/001-partner-simulator/
├── spec.md              # Requirements & User Stories
├── plan.md              # This plan
├── research.md          # Technical analysis & design decisions
├── data-model.md        # Prisma schema updates & Zod types
├── quickstart.md        # Step-by-step verification guide
├── contracts/           # Webhook & API contracts
│   ├── billing-webhook.json
│   ├── lms-webhook.json
│   └── entitlements-api.json
└── tasks.md             # Task breakdown (generated next)

src/
├── lib/
│   ├── entitlement.ts          # Core Entitlement service (issue, check, expire, renew)
│   ├── billing-simulator.ts    # Billing webhook processor & mock event emitter
│   └── lms-simulator.ts        # LMS progress webhook processor & trial provisioner
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── billing/
│   │   │   │   └── payment-confirmation/route.ts   # Billing Webhook receiver
│   │   │   └── lms/
│   │   │       └── progress/route.ts               # LMS Progress Webhook receiver
│   │   ├── mock/
│   │   │   └── lms/
│   │   │       └── trial-accounts/route.ts         # LMS Trial account provisioning
│   │   └── entitlements/route.ts                   # Entitlement queries & updates
│   └── (admin)/
│       └── developer/
│           ├── developer-client.tsx                # Added Partner Simulator Tab
│           └── partner-simulator-panel.tsx         # Dedicated Simulator UI component
prisma/
└── schema.prisma        # Added model Entitlement and relations
```

---

## Implementation Phases

- **Phase 1: Database & Core Libraries**:
  - Cập nhật `prisma/schema.prisma` với model `Entitlement`.
  - Chạy `npx prisma db push` để sync database.
  - Xây dựng `src/lib/entitlement.ts`, `src/lib/billing-simulator.ts`, `src/lib/lms-simulator.ts`.
- **Phase 2: API & Webhook Routes**:
  - Xây dựng Webhook Billing `/api/webhooks/billing/payment-confirmation`.
  - Xây dựng Webhook LMS `/api/webhooks/lms/progress`.
  - Xây dựng Mock LMS Trial API `/api/mock/lms/trial-accounts`.
  - Xây dựng API tra cứu `/api/entitlements`.
  - Tích hợp thêm MCP tool tra cứu hạn gói `check_entitlement` trong `src/lib/mcp-core.ts`.
- **Phase 3: Developer Hub Partner Simulator UI**:
  - Xây dựng component `PartnerSimulatorPanel` với 3 khu vực: Billing Simulator, LMS Simulator, Entitlement Manager, và Event Log.
  - Tích hợp tab vào `DeveloperClient`.
- **Phase 4: Verification & QC**:
  - Chạy kịch bản test theo `quickstart.md`.
  - Kiểm tra tính khử trùng lặp (Idempotency).
  - Kiểm tra lint & typecheck.
