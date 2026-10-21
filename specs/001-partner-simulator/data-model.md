# Data Model: CRM LMS Simulator & External Partner Integration Module

**Feature**: `001-partner-simulator`  
**Date**: 2026-10-21  

---

## 1. Prisma Schema Changes

### 1.1 New Model: `Entitlement`

```prisma
model Entitlement {
  id          String    @id @default(cuid())
  studentId   String
  student     Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id])
  orderId     String?
  order       Order?    @relation(fields: [orderId], references: [id])
  type        String    @default("OFFICIAL") // TRIAL, OFFICIAL, RENEWAL
  status      String    @default("ACTIVE")   // ACTIVE, EXPIRED, SUSPENDED, REVOKED
  startsAt    DateTime  @default(now())
  expiresAt   DateTime
  source      String    @default("BILLING_MOCK") // BILLING_MOCK, MANUAL, LMS_SYNC
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([studentId])
  @@index([courseId])
  @@index([status])
}
```

### 1.2 Model Relations Updated

- In `model Student`:
  ```prisma
  entitlements Entitlement[]
  ```
- In `model Course`:
  ```prisma
  entitlements Entitlement[]
  ```
- In `model Order`:
  ```prisma
  entitlements Entitlement[]
  ```

---

## 2. Webhook & Event Payload Schemas (Zod)

### 2.1 Billing Payment Confirmation Schema (`BillingPaymentPayload`)

```typescript
export interface BillingPaymentPayload {
  event: "payment_success" | "payment_failed" | "refund_processed";
  order_code: string;
  order_id?: string;
  transaction_id: string;
  amount: number;
  currency?: string; // default "VND"
  payment_method?: string; // "BANK_TRANSFER", "CARD", "E_WALLET"
  paid_at?: string; // ISO 8601
  dedup_key?: string;
  source?: string;
  notes?: string;
}
```

### 2.2 LMS Activity & Progress Payload (`LmsProgressPayload`)

```typescript
export interface LmsProgressPayload {
  event: "lms.first_login" | "lms.lesson_completed" | "lms.progress_updated";
  learner_id: string; // studentId or student code
  course_id?: string;
  lesson_id?: string;
  lesson_title?: string;
  progress_percent?: number;
  external_reference?: string;
  timestamp?: string; // ISO 8601
  dedup_key?: string;
}
```

### 2.3 LMS Trial Account Provisioning Payload & Response

- **Request**:
  ```typescript
  export interface LmsTrialRequestPayload {
    name: string;
    phone: string;
    course_id: string;
    facility_id?: string;
    trial_days?: number; // default 7
    notes?: string;
  }
  ```
- **Response**:
  ```typescript
  export interface LmsTrialResponsePayload {
    success: boolean;
    learner_id: string;
    student_code: string;
    username: string;
    temp_password?: string;
    trial_token: string;
    access_url: string;
    starts_at: string;
    expires_at: string;
    status: "TRIAL_PROVISIONED";
  }
  ```
