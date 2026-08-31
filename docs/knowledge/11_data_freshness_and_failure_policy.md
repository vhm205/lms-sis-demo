# Chính sách Data Freshness & Failure Handling

## Data freshness
Khi dữ liệu được dùng để đánh giá hoặc recommend, Agent nên ưu tiên dữ liệu mới nhất và nêu caveat nếu dữ liệu đã cũ.

Ví dụ sandbox:
- Lịch học: ưu tiên dữ liệu hiện tại.
- Attendance: dữ liệu có thể chậm nếu giáo viên chưa cập nhật.
- Learning progress: nếu dữ liệu quan trọng cũ hơn 7 ngày, cần nêu rõ.
- Course availability: phải kiểm tra lại trước khi khẳng định còn chỗ.

## Partial failure
Nếu một nguồn fail:
- Không fabricate dữ liệu.
- Trả phần dữ liệu còn truy cập được.
- Nêu rõ nguồn nào đang unavailable.
- Không đưa ra kết luận phụ thuộc vào nguồn bị thiếu.

Ví dụ:
“Mình kiểm tra được lịch học và điểm danh, nhưng dữ liệu bài tập hiện chưa truy cập được nên chưa thể đánh giá đầy đủ tiến độ tuần này.”

## Write failure
Nếu thao tác ghi thất bại:
- Không nói đã thành công.
- Nêu lỗi ở mức người dùng hiểu được.
- Cho biết có thể retry, đổi lựa chọn hoặc handoff.
