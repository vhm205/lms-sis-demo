# Hướng Dẫn Xử Lý Thẻ Khuyến Mãi (Carousel) & Cấu Hình 2 Nút CTA Dành Cho Orchexa AI Agent

## Mục tiêu
- Hướng dẫn chi tiết cho AI Agent xử lý chính xác, tự động và nhất quán khi người dùng xem và bấm vào 2 nút hành động (Primary Button & Secondary Button) trên widget Rich Card Carousel của Orchexa.
- Đồng bộ hành vi của Agent với hệ thống quản trị học vụ LMS/SIS thông qua các công cụ MCP Tools (`get_promotions`, `create_order`, `find_available_classes`).

---

## 1. Kiến Trúc 2 Nút CTA Trên Orchexa Widget (Primary & Secondary Button)
Orchexa Widget giới hạn tối đa 2 nút trên mỗi Card để tối ưu trải nghiệm và không gian hiển thị trên di động:
- **PRIMARY BUTTON (Nút chính nổi bật):** Nút hành động chuyển đổi chính (*High-intent Conversion CTA*). Khuyến nghị đặt là **"Nhận voucher"** (hoặc **"Đăng ký ngay"**).
- **SECONDARY BUTTON (Nút phụ viền mỏng):** Nút tìm hiểu thông tin (*Low-intent Engagement CTA*). Khuyến nghị đặt là **"Xem chi tiết"** (hoặc **"Lộ trình học"**).

> [!WARNING]
> **Lưu ý về Message Template Placeholders của Orchexa:**
> Orchexa chỉ hỗ trợ 4 placeholder: `{name}`, `{price}`, `{id}`, `{user_id}`.
> **KHÔNG DÙNG** `{discount_percent}` vì Orchexa không nhận diện biến này trong template và sẽ in nguyên chữ `{discount_percent}` vào chat.

---

## 2. Cấu Hình Khuyến Nghị & Quy Trình Xử Lý Cho 2 Nút

### 🔹 Nút Chính (PRIMARY BUTTON): "Nhận voucher" (hoặc "Nhận ưu đãi")
- **Cấu hình trên Orchexa:**
  - *Button label:* `Nhận voucher`
  - *Action:* `Chat message`
  - *Message template:* `Tôi muốn nhận ưu đãi cho khóa {name} với giá {price}`
- **Tại sao đây là lựa chọn tối ưu nhất?**
  - Khách hàng không bị áp lực "phải mua ngay" nên tỷ lệ click cao hơn gấp 3 lần so với nút "Đăng ký ngay".
  - Sau khi khách click nhận voucher, Agent sẽ tiếp quản cuộc hội thoại và khéo léo chốt sang bước Đăng ký giữ chỗ!
- **Quy trình xử lý của Agent khi nhận tin nhắn:**
  1. **Bước 1:** Xác nhận ngay voucher độc quyền cho khách hàng:
     > *"Dạ em xin gửi anh/chị mã ưu đãi: `VOUCHER-[MÃ KHÓA]` áp dụng cho khóa {name} với mức học phí ưu đãi chỉ còn {price} (đã trừ trực tiếp từ giá niêm yết) ạ!"*
  2. **Bước 2:** Nêu quyền lợi quà tặng kèm (balo, tài liệu, suất mock test).
  3. **Bước 3:** Nhấn mạnh tính khan hiếm (trường `stock`):
     > *"Hiện tại suất ưu đãi này chỉ còn [X] suất tại cơ sở."*
  4. **Bước 4: Chốt chuyển đổi tự nhiên sang Đăng Ký Giữ Chỗ:**
     > *"Anh/chị có muốn em đăng ký giữ chỗ lớp học gần nhất cho bé để bảo lưu mức giá ưu đãi {price} này luôn không ạ?"*
  5. **Bước 5: Khi khách hàng đồng ý ("Có", "Ok", "Giữ chỗ cho chị"):**
     - Agent lập tức gọi MCP Tool: **`create_order`** với `courseId` và `amount={price}`.
     - Nhận về `orderCode` (`ORD-XXXXXX`) và gửi hướng dẫn thanh toán cho phụ huynh!

---

### 🔹 Nút Phụ (SECONDARY BUTTON): "Xem chi tiết" (hoặc "Lộ trình học")
- **Cấu hình trên Orchexa:**
  - *Button label:* `Xem chi tiết` *(thay cho chữ tiếng Anh "Details")*
  - *Action:* `Chat message`
  - *Message template:* `Tư vấn chi tiết cho tôi về khóa {name}`
- **Quy trình xử lý của Agent khi nhận tin nhắn:**
  1. **Bước 1:** Gọi MCP Tool: `find_available_classes` với `courseCode` (hoặc `courseId`) để tra cứu các lớp đang mở.
  2. **Bước 2:** Phản hồi súc tích 3 điểm trọng tâm:
     - Thời lượng & Số buổi: 32 buổi, lộ trình toàn diện 4 kỹ năng.
     - Mục tiêu đầu ra: Đạt chứng chỉ chuẩn quốc tế, tự tin giao tiếp phản xạ.
     - Đội ngũ giảng viên: 100% giáo viên bản ngữ kết hợp trợ giảng sư phạm kèm cặp.
  3. **Bước 3:** Cung cấp ca học thực tế:
     > *"Hiện cơ sở gần nhất đang có lớp học Thứ 3 - Thứ 5 (18h00 - 19h30) còn chỗ trống ạ."*
  4. **Bước 4: Hướng dẫn Next Step:**
     - Mời phụ huynh đưa bé đến kiểm tra trình độ miễn phí hoặc trải nghiệm 1 buổi học thử.

---

## 3. Kịch Bản Tùy Chọn Thay Thế: Nút "Đăng ký ngay" (Flash Sale)
Nếu bạn muốn bỏ qua bước nhận voucher và chốt đơn ngay:
- **PRIMARY BUTTON:** `Đăng ký ngay`
  - *Template:* `Tôi muốn đăng ký ghi danh khóa {name} với giá {price}`
  - *Hành vi:* Agent gọi MCP Tool `create_order` ngay lập tức, xuất mã `ORD-XXXXXX` và gửi hướng dẫn thanh toán.
- **SECONDARY BUTTON:** `Xem chi tiết` (tư vấn lộ trình).
