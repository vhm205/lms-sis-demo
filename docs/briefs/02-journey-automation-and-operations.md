# 02 — Hành trình, Automation và vận hành

> Case: EDU-02 · Tài liệu v0.2 (tinh gọn) Lead và mốc MVP: xem Excel Master. Trạng thái hiện tại chưa đánh giá/nghiệm thu.

Các bước dưới đây là thiết kế nghiệp vụ đề xuất. Event/API phải mapping vào sản phẩm thực tế trước triển khai.

| Bước | Pre-condition | Dẫn dắt/hành động | A: call/nguồn ngoài | B: người xác nhận | Điều kiện chuyển | Automation trong bước |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| EDU-02-S01 Chọn chương trình | Có nhu cầu học | Hỏi mục tiêu và thời gian; đề xuất khóa phù hợp | Đọc catalog và hồ sơ CRM | Nhân viên duy trì catalog được duyệt | Khách chọn khóa/gói trải nghiệm | Bổ sung nhu cầu còn thiếu |
| EDU-02-S02 Đăng ký và cấp quyền | Đủ định danh tối thiểu, khách đăng ký | Tạo yêu cầu cấp quyền dùng thử | Gọi tạo tài khoản/cấp quyền; nhận kết quả | Nhân viên cấp tài khoản/link và ghi xác nhận | Quyền truy cập được xác nhận | Nhắc người cấp quyền; hỗ trợ khách chưa nhận được |
| EDU-02-S03 Trải nghiệm | Đã có quyền | Hỗ trợ bắt đầu; hỏi mục tiêu chưa đạt | Nhận hoạt động/tiến độ từ app/LMS | Người phụ trách ghi tham gia; lời khách tự khai giữ nguồn riêng | Có trải nghiệm/kết quả đủ để tư vấn | Chăm sóc chưa bắt đầu chỉ khi có dữ liệu; không suy tiến độ từ im lặng |
| EDU-02-S04 Mua gói | Khách có nhu cầu tiếp tục | Giải thích gói/giá được duyệt; hướng dẫn thanh toán | Gọi tạo checkout/đơn; nhận billing | Nhân viên tạo yêu cầu và thu ngân xác nhận | Thanh toán được xác nhận | Theo dõi lời hẹn; dừng khi thanh toán/hủy |
| EDU-02-S05 Kích hoạt học chính thức | Thanh toán đã xác nhận | Cấp đúng gói, hướng dẫn bắt đầu | Nhận entitlement/enrollment và hoạt động học | Nhân viên xác nhận cấp gói và việc bắt đầu có bằng chứng | Học viên bắt đầu gói đã mua | Theo dõi đã mua nhưng chưa được cấp quyền |
| EDU-02-S06 Gia hạn | Gói đến hạn | Tư vấn tiếp tục theo nhu cầu và dữ liệu sử dụng | Đọc hạn gói, nhận giao dịch gia hạn | Nhân viên cập nhật hạn và xác nhận gia hạn | Gia hạn hoặc kết thúc | Chăm sóc gia hạn; hết hạn và ngừng hoạt động mới xét win-back |

&nbsp;

## Quy tắc Automation dùng chung

| Loại | Đối tượng | Trigger | Dừng/thoát |
| :---- | :---- | :---- | :---- |
| Bám đuổi bước dở | Đã có ý định, thiếu thông tin hoặc đang chờ hoàn tất | Thiếu dữ liệu, mốc hẹn, inactivity hợp lệ | Hoàn tất, hủy, từ chối, người tiếp quản |
| Nuôi dưỡng | Còn cân nhắc, có nhu cầu/thời điểm dự kiến | Trở ngại hoặc mốc khách hẹn | Mua/đặt, hết chu kỳ, không còn nhu cầu |
| Vòng đời | Có lịch/gói/hợp đồng/mốc thật | Lịch xác nhận, đã mua, đến hạn | Đổi/hủy, hoàn tất, trạng thái mới |
| Win-back | Không hoạt động đủ lâu, không còn luồng đang chờ | Danh sách đủ điều kiện được duyệt | Phản hồi/quay lại luồng, mua/đặt, từ chối, hết nhịp |

&nbsp;

Không đưa khách đang chờ người duyệt, trả kết quả, cấp quyền hoặc xếp lớp vào win-back. Khiếu nại ưu tiên hỗ trợ; dừng tiếp thị không phù hợp. Người đang xử lý thì tránh AI chen tin bán. Khi thay lịch/đơn/gói, hủy nhịp cũ theo đúng đối tượng.

## Tham số cần chốt, không gán mặc định là đã duyệt

| Tham số | Giá trị | Người chốt |
| :---- | :---- | :---- |
| SLA người duyệt/nhận việc | Chưa chốt | Owner \+ Product |
| Mốc nhắc trước lịch | Chưa chốt | Owner |
| Số lần và khoảng cách follow-up | Chưa chốt | Owner \+ Product |
| Ngưỡng ngừng hoạt động vào win-back | Chưa chốt | Owner |
| Giới hạn liên hệ và giờ phù hợp | Chưa chốt | Owner \+ Product |
| Cửa sổ chuyển đổi cohort | Chưa chốt | Owner \+ Product |

&nbsp;

Mỗi chuỗi phải khai đối tượng, trigger, điều kiện, hành động, mode thử/duyệt/live, stop-on, người phụ trách và phiên bản. Không có dữ liệu/nguồn phát thì ghi blocker, không giả lập như production đã hoạt động.

---

## Hệ thống, dữ liệu và human-in-the-loop

## A — Có hệ thống

Hệ liên quan: CRM; tài khoản/app/LMS; billing; hệ cấp quyền; kênh chăm sóc.

Lead cần bổ sung bảng mapping thực: bước → nguồn chính → thao tác đọc/ghi → event vào → mã liên kết → tài khoản/quyền → người phụ trách. Không điền secret vào Markdown/Excel. Khi nguồn ngoài chưa xác nhận, giữ trạng thái chờ hoặc chuyển người; không thông báo hoàn tất giả.

## B — Chưa có hệ thống

Lưu đăng ký; nhân viên cấp link/tài khoản và xác nhận; người phụ trách cập nhật tham gia; thu ngân xác nhận gói.

Đề xuất sổ nghiệp vụ trong Orchexa là nơi giữ trạng thái chính. Google Sheets là lựa chọn phối hợp, không phải tích hợp đã xác minh. Nếu dùng Sheet làm nơi duyệt, cần kiểm người sửa, giá trị hợp lệ, ghi nhật ký và phát lại kết quả vào hành trình. Chỉ sync một chiều ra Sheet chưa hoàn tất human-in-the-loop.

## Trường tối thiểu

Học viên, mục tiêu, trình độ tự khai, quỹ thời gian, khóa/gói, tài khoản, quyền truy cập, hạn gói, giao dịch.

Mỗi yêu cầu có request\_id, learner\_id (hoặc account/opportunity\_id cho B2B), contact\_id, case\_variant, program, preferred\_time, confirmed\_time khi áp dụng, status, assigned\_to, due\_at, decision\_by, decision\_at, reason, external\_reference, source, version. Đây là đề xuất nghiệp vụ, không khẳng định schema hiện tại.

Tách người liên hệ khỏi học viên và từng yêu cầu. Một SĐT của phụ huynh không đủ để gộp các con. EDU-08 dùng công ty/cơ hội, nhiều người liên hệ không tự sinh nhiều deal.

## Vòng duyệt

| Trạng thái | Quyết định/hành động | Kết quả tiếp nối |
| :---- | :---- | :---- |
| Yêu cầu mới | Ghi đủ dữ liệu và phân công | Hàng đợi có hạn |
| Chờ duyệt | Người có quyền kiểm chỗ/điều kiện | Duyệt, yêu cầu bổ sung, đề xuất khác, từ chối |
| Cần bổ sung | AI hỏi phần thiếu; khách trả lời | Quay về người duyệt với lịch sử |
| Đề xuất khác | Khách chấp nhận lựa chọn mới | Người/hệ xác nhận cuối cùng |
| Đã xác nhận | Lưu người/thời điểm/nguồn | Chuyển bước và lên nhịp tiếp theo |
| Quá hạn | Nhắc/chuyển người dự phòng | Không tự coi là được duyệt |
| Hủy/đổi | Cập nhật phiên bản trạng thái | Hủy nhắc cũ, chạy nhịp mới khi đủ điều kiện |

&nbsp;

## Kiểm soát nguồn xác nhận

Tách tự khai, đề xuất AI, người duyệt và hệ thống xác nhận. Thanh toán cần thu ngân/billing; kết quả học cần giáo viên/LMS; quyết định tuyển sinh/hợp đồng cần người có thẩm quyền. Hai thao tác duyệt lặp không tạo hai lịch/việc/tin. Thay đổi trái thứ tự phải có cách đối soát và xử lý, không ghi đè im lặng.

## Chờ owner chốt

Chốt định nghĩa bắt đầu học, nguồn hoạt động và cơ chế cấp quyền khi chưa có LMS. Bổ sung danh sách người có quyền, người dự phòng, nguồn chính từng dữ liệu và quy tắc khi thông tin hai nơi khác nhau.

---

## Triển khai cấu hình trên platform

Mục tiêu: Người dùng trải nghiệm, mua gói, bắt đầu học và gia hạn.

Template này chưa có ID đã publish trên platform. Không suy từ file này rằng cấu hình đã chạy.

## Thứ tự dựng

1. Chọn A/B, workspace và người owner; ghi phiên bản template.  
2. Khai dữ liệu: Học viên, mục tiêu, trình độ tự khai, quỹ thời gian, khóa/gói, tài khoản, quyền truy cập, hạn gói, giao dịch.  
3. Nạp kiến thức chương trình/giá/chính sách đã được owner duyệt; tách theo cơ sở/chương trình khi cần.  
4. Dựng các bước trong [journey](http://02-journey-automation-and-operations.md), điều kiện chuyển và nguồn xác nhận.  
5. A: nối CRM; tài khoản/app/LMS; billing; hệ cấp quyền; kênh chăm sóc. B: cấu hình sổ yêu cầu, người duyệt, người dự phòng, hạn và kết quả tiếp nối.  
6. Khai các chuỗi bám đuổi, nuôi dưỡng, vòng đời và win-back riêng; chốt stop-on và ưu tiên.  
7. Nối kênh được phép; chạy chế độ thử; kiểm ngoại lệ; owner duyệt trước khi chạy thật.  
8. Lưu ID cấu hình, mapping, phiên bản, evidence và hướng dẫn dừng/khôi phục vào bảng dưới.

## Hồ sơ cấu hình thực — cần điền khi triển khai

| Trường | Giá trị |
| :---- | :---- |
| Workspace / Agent / Template ID | Chưa có |
| Biến thể A/B; phiên bản | Chưa triển khai |
| Event/API mapping thực | Chưa có |
| Người duyệt và dự phòng | Chưa chốt |
| Kênh / mode / quyền | Chưa chốt |
| Cách dừng chuỗi/khôi phục cấu hình | Chưa xác minh |
| Link verification | Chưa thực thi |

&nbsp;

Mọi tên event ở brief là ngữ nghĩa đề xuất. Kiểm catalog thật trước mapping. Secret nhập qua cơ chế quản lý kết nối của sản phẩm, không lưu ở đây.