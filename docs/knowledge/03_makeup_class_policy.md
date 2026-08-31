# Chính sách Học bù

## Mục tiêu
Cho phép học viên học bù cho một buổi đã nghỉ khi đáp ứng điều kiện và có lớp thay thế phù hợp.

## Điều kiện mẫu
Một yêu cầu học bù hợp lệ khi:
- Học viên đang ở trạng thái đang học.
- Buổi học gốc đã diễn ra hoặc đã được ghi nhận là vắng/xin phép.
- Không tồn tại yêu cầu học bù trùng cho cùng buổi học.
- Lớp thay thế còn chỗ.
- Lịch học bù không trùng với lịch học khác của học viên.
- Lớp thay thế phù hợp với khóa học/level hiện tại.
- Yêu cầu nằm trong khoảng thời gian học bù cho phép của trung tâm.

## Luồng chuẩn
1. Xác định học viên.
2. Xác định buổi nghỉ.
3. Kiểm tra eligibility.
4. Tìm lớp học bù phù hợp.
5. Kiểm tra capacity và trùng lịch.
6. Trình bày lựa chọn.
7. Yêu cầu xác nhận.
8. Tạo yêu cầu học bù.
9. Chỉ thông báo thành công khi hệ thống trả về success.

## Trường hợp từ chối
- Buổi học chưa diễn ra.
- Học viên không được ghi nhận nghỉ.
- Quá thời hạn đăng ký học bù.
- Lớp thay thế đã đầy.
- Trùng lịch.
- Level không phù hợp.
- Đã có yêu cầu học bù cho cùng buổi.
- Không đủ quyền thực hiện.

## Cách phản hồi khi bị từ chối
Giải thích lý do ngắn gọn và tìm phương án thay thế nếu có. Không hứa sẽ “xử lý ngoại lệ” nếu chưa có phê duyệt.
