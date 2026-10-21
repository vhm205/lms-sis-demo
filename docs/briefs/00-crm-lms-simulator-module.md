1. Các Module / Hệ thống bên ngoài liên quan (Biến thể A)
   Trong Biến thể EDU-02-A (Có hệ thống), Orchexa cần giao tiếp/tích hợp với 5 nhóm hệ thống/module partner chính:
   Hệ thống CRM:
   Đọc: Đọc hồ sơ khách hàng/học viên và danh mục khóa học (catalog).1
   Quản lý thông tin: Quản lý learner_id, contact_id, cơ hội kinh doanh (deal/opportunity), phân biệt đối tượng phụ huynh/học viên hoặc B2B.1
   Hệ thống Tài khoản / App / LMS (Quản lý học tập):
   Cấp tài khoản & Quyền dùng thử: Nhận lệnh khởi tạo tài khoản và tự động cấp quyền truy cập/dùng thử.1
   Ghi nhận Hoạt động & Tiến độ học: Truyền/đồng bộ dữ liệu về hoạt động học tập, tiến độ tham gia của học viên về Orchexa (dùng làm căn cứ xác nhận mốc "Bắt đầu học" cho KPI).12
   Quản lý Đăng ký / Entitlement: Nhận và ghi nhận trạng thái ghi danh (enrollment/entitlement).1
   Hệ thống Billing & Thanh toán:
   Tạo Checkout / Đơn hàng: Khởi tạo yêu cầu/đơn hàng thanh toán cho gói học đã chọn.1
   Webhook Billing / Xác nhận Giao dịch: Tự động phát sự kiện/webhook phản hồi khi thanh toán thành công (hoặc xử lý hoàn tiền/hủy đơn) để làm nguồn xác nhận doanh thu chính thức.12
   Hệ thống Quản lý Cấp quyền (Entitlement System):
   Kích hoạt & Gia hạn: Tiếp nhận lệnh cấp/gia hạn hoặc hạ quyền/khóa tài khoản khi hết hạn gói.1
   Đọc thời hạn gói: Truyền dữ liệu về ngày hết hạn của các gói học.1
   Kênh Chăm sóc & Tiếp thị (Communication Channels):
   Nhận/Gửi tin nhắn: Tích hợp các kênh tương tác để gửi nội dung hỗ trợ, theo dõi lịch hẹn và nhắc nhở tự động.1
2. Yêu cầu về API / Event Mapping & Dữ liệu tối thiểu
   Để giả lập hoặc kết nối thật với các module partner trên, hệ thống cần hỗ trợ đọc/ghi các trường thông tin và sự kiện sau:
   Sự kiện / API bắt buộc (Event/API mapping):
   API Đọc Catalog & Hồ sơ CRM.1
   API Tạo tài khoản & Cấp quyền truy cập thử.1
   Event/Webhook nhận dữ liệu tiến độ/hoạt động học từ LMS/App.1
   API Tạo đơn thanh toán (Checkout) & Webhook Billing xác nhận dòng tiền.1
   Event/API Cấp/Gia hạn Entitlement gói chính thức.1
   API Đọc thời hạn gói & nhận giao dịch gia hạn.1
   Các trường dữ liệu tối thiểu cần trao đổi qua API:
   request_id, learner_id (hoặc account_id/opportunity_id đối với B2B), contact_id.1
   case_variant (A/B), program (Khóa/gói học), preferred_time, confirmed_time.1
   status, assigned_to, due_at, decision_by, decision_at, reason, external_reference, source, version.1
3. Nguyên tắc giả lập (Ngoại lệ & Kiểm soát nguồn xác nhận)
   Nếu xây dựng hệ thống giả lập (Mock System) để thử nghiệm/demo:
   Tách biệt nguồn xác nhận: Xác nhận thanh toán phải đến từ Billing Mock; Kết quả học tập phải đến từ LMS Mock.12
   Xử lý sự kiện lặp (Idempotency): Các thao tác duyệt hoặc Event từ hệ thống Mock gửi lặp lại không được làm nhân đôi kết quả nghiệp vụ hay tạo tin nhắn/việc lặp.12
   Trạng thái Chờ khi Mock lỗi: Khi hệ thống ngoài/Mock chưa xác nhận hoặc bị lỗi, Orchexa phải giữ trạng thái chờ/chuyển người xử lý, tuyệt đối không thông báo hoàn tất giả
