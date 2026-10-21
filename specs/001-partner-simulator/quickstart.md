# Quickstart: Partner Simulator Console

## 1. Chạy ứng dụng
```bash
npm run dev
```
Truy cập: `http://localhost:3000/developer` và chuyển sang tab **"Partner Simulator"**.

## 2. Kịch bản 1: Giả lập Xác nhận Thanh toán Billing (S04 -> S05)
1. Trong màn hình Admin `/orders`, tạo một đơn hàng mới (hoặc dùng AI Agent để tạo đơn qua Webhook).
2. Mở tab **Partner Simulator** trong `/developer`.
3. Trong ô **Billing Simulator**:
   - Chọn mã đơn hàng vừa tạo (`PENDING`).
   - Nhấp nút **"Kích hoạt Thanh toán Thành công (payment_success)"**.
4. Quan sát:
   - Đơn hàng tự động đổi sang `PAID`.
   - Một `Entitlement` gói học được cấp với thời hạn 90 ngày.
   - `ActivityLog` ghi nhận giao dịch từ `BILLING_MOCK`.

## 3. Kịch bản 2: Giả lập Hoạt động Học tập LMS (S02 / S03 / S05)
1. Trong tab **Partner Simulator**:
   - Chọn một học viên trong danh sách.
   - Nhấp nút **"Giả lập Đăng nhập lần đầu (lms.first_login)"** hoặc **"Hoàn thành Bài học 1"**.
2. Quan sát:
   - Webhook gửi tới `/api/webhooks/lms/progress`.
   - Hệ thống ghi nhận mốc **"Bắt đầu học"** với timestamp từ LMS, làm bằng chứng xác thực KPI.

## 4. Kịch bản 3: Tra cứu & Kiểm tra Gia hạn Entitlement (S06)
1. Trong tab **Partner Simulator**:
   - Xem bảng **Entitlement Management**.
   - Kiểm tra ngày hết hạn (`expiresAt`), số ngày còn lại (`daysRemaining`).
   - Thử click nút **"Mô phỏng Hết hạn ngay"** hoặc **"Gia hạn thêm 30 ngày"**.
