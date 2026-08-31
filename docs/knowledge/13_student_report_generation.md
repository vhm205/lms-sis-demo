# Quy định Xuất Báo cáo Học tập & Nhận xét Học viên

## 1. Mục tiêu
Khi phụ huynh hoặc admin yêu cầu báo cáo học tập, bảng điểm, nhận xét quá trình hoặc tình hình học tập hiện tại của học viên, Agent Orchexa cần gọi tool `generate_student_report` và gửi câu trả lời tóm tắt kèm liên kết xem trước (Preview Link) hoặc bản PDF cho người dùng.

## 2. Hai loại báo cáo hỗ trợ

### Loại 1: Báo cáo Kết quả Học tập (`ACADEMIC_RESULTS`)
- **Khi nào sử dụng**:
  - Phụ huynh/Admin hỏi về: "điểm số", "bảng điểm", "kết quả thi", "nhận xét bài kiểm tra", "học lực", "kết quả học tập".
- **Dữ liệu thể hiện**:
  - Điểm trung bình (GPA /10), xếp loại học lực (Xuất sắc, Giỏi, Khá, Trung bình).
  - Điểm cao nhất, điểm thấp nhất, tỷ lệ đạt chuẩn (>=5.0), tỷ lệ đạt điểm Giỏi (>=8.0).
  - Chi tiết từng bài kiểm tra / bài tập đã chấm kèm nhận xét của giáo viên.
  - Phân tích điểm mạnh & các kỹ năng cần củng cố.
  - Nhận xét tổng hợp từ giáo viên & Hội đồng học vụ.
  - Mục tiêu học tập giai đoạn tiếp theo.

### Loại 2: Báo cáo Tổng quan Quá trình & Tình hình Hiện tại (`PROGRESS_OVERVIEW`)
- **Khi nào sử dụng**:
  - Phụ huynh/Admin hỏi về: "tổng quan quá trình", "tình hình học tập hiện tại", "chuyên cần", "điểm danh", "tiến độ khóa học", "bé học thế nào dạo này", "nhận xét chung".
- **Dữ liệu thể hiện**:
  - Tỷ lệ chuyên cần (%), số buổi có mặt, đi muộn, vắng mặt, có phép.
  - Tiến độ khóa học (% số buổi đã hoàn thành / tổng số buổi).
  - Tỷ lệ nộp bài tập về nhà (%).
  - Lịch sử điểm danh chi tiết các buổi học gần đây.
  - Đánh giá rủi ro học vụ (Risk Level: Low, Medium, High) theo Student Success Playbook.
  - Đề xuất giải pháp và kế hoạch hỗ trợ đồng hành giữa gia đình & trung tâm.

## 3. Quy tắc ứng xử của Agent Orchexa
1. **Bắt buộc đính kèm Preview Link**: Trong câu trả lời, Agent luôn phải cung cấp link xem trực tiếp báo cáo `previewUrl` (ví dụ `[Xem chi tiết báo cáo](...)`) để phụ huynh/admin có thể mở xem trực quan hoặc in/lưu bản PDF.
2. **Tóm tắt ngắn gọn, tích cực & mang tính xây dựng**:
   - Nêu điểm nổi bật (Điểm TB hoặc Tỷ lệ chuyên cần).
   - Nêu điểm mạnh chính.
   - Gợi ý hành động tiếp theo.
3. **Tuân thủ quyền riêng tư (RBAC)**:
   - Phụ huynh chỉ được yêu cầu báo cáo cho con của mình.
   - Admin có quyền xuất báo cáo cho tất cả học viên trong hệ thống.
