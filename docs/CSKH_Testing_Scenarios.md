# Kịch bản Kiểm thử (Test Scenarios) - Hệ thống CSKH Post-Sales (SIS/LMS)

## 1. Tổng quan
Tài liệu này cung cấp các kịch bản (scenarios) để kiểm thử luồng Chăm sóc khách hàng (CSKH) bằng AI Agent trên hệ thống SIS/LMS hiện tại, tập trung vào giai đoạn sau khi chốt deal (Post-sales). 

- **Đối tượng:** Phụ huynh (hỏi cho con), Học sinh độ tuổi trưởng thành (học cao học, MBA, chứng chỉ), Giáo viên.
- **Mục tiêu:** Kiểm thử các nghiệp vụ CSKH thường ngày, giải quyết sự cố, báo cáo học tập và thúc đẩy tỷ lệ duy trì (retention), học tiếp (upsell) hoặc học bổ trợ (cross-sell).
- **Phạm vi (In-scope):** Các hoạt động diễn ra *trong và sau* khóa học. Không bao gồm quy trình tuyển sinh ban đầu.
- **Kênh tương tác (Channels):** Web, PWA (Progressive Web App), Zalo Mini App / Zalo OA.

---

## 2. Kịch bản 1: Thông tin Học tập & Quản lý Lịch (Daily Operations)

### 2.1. Tra cứu lịch học, lịch thi
- **User Intent:** Học viên (MBA) hoặc Phụ huynh muốn biết lịch trình sắp tới.
- **Kịch bản (Prompt):** *"Tuần này tôi/con tôi có lịch thi hay thay đổi phòng học nào không? Gửi cho tôi lịch học chi tiết từ giờ đến cuối tháng."*
- **Kỳ vọng (Expected Behavior):** 
  - Trích xuất đúng dữ liệu lịch học/thi từ SIS.
  - Không tự suy đoán lịch. Trả lời rõ ràng ngày, giờ, phòng học, giáo viên.

### 2.2. Xin phép nghỉ học và sắp xếp học bù
- **User Intent:** Xin nghỉ đột xuất và muốn đảm bảo quyền lợi học bù.
- **Kịch bản (Prompt):** *"Hôm nay thứ 3 con tôi bị ốm không đi học được. Xin cho cháu nghỉ và sắp xếp học bù vào cuối tuần này. Trung tâm xem có lớp nào trống không?"*
- **Kỳ vọng:** 
  - Ghi nhận trạng thái "Xin nghỉ phép".
  - Chạy luồng `Chính sách Học bù` (Kiểm tra eligibility, tìm lớp bù cùng level, check capacity và trùng lịch).
  - Đề xuất 2-3 ca học bù khả thi để user xác nhận. Không tự ý chốt lớp khi chưa có confirm.

### 2.3. Yêu cầu đổi lớp/ca học cố định
- **User Intent:** Học viên MBA bị đổi lịch công tác nên không thể học ca tối thứ 2-4-6.
- **Kịch bản (Prompt):** *"Lịch làm việc của tôi thay đổi, tôi không học được tối 2-4-6 nữa. Có lớp nào tương đương dạy vào cuối tuần hoặc học online không để tôi chuyển sang?"*
- **Kỳ vọng:** 
  - Agent thu thập thông tin khóa học hiện tại, level hiện tại.
  - Tìm kiếm các lớp có cùng level/khóa học với lịch học cuối tuần/online.
  - Cung cấp thông tin và hướng dẫn quy trình chuyển lớp.

---

## 2.4 Kịch bản 2: Báo cáo Tiến độ & Cảnh báo Học tập (Learning Progress)

### 2.1. Tra cứu điểm số và nhận xét
- **User Intent:** Phụ huynh muốn biết tình hình học tập sau kỳ thi giữa kỳ.
- **Kịch bản (Prompt):** *"Gửi cho tôi bảng điểm thi giữa kỳ vừa rồi và nhận xét của giáo viên. Tôi thấy dạo này cháu làm bài tập về nhà có vẻ chểnh mảng."*
- **Kỳ vọng:** 
  - Trích xuất điểm thi và nhận xét thực tế (nếu có) từ LMS.
  - Nếu thiếu dữ liệu, phải thông báo rõ (VD: *"Giáo viên chưa cập nhật nhận xét..."*). Không bịa nhận xét.
  - Phản hồi khéo léo về vấn đề "chểnh mảng", đề xuất gửi cảnh báo cho giáo viên chủ nhiệm/cố vấn học tập (Academic Review).

### 2.2. Agent chủ động xử lý Cảnh báo rủi ro (Risk Intervention)
- **User Intent:** Học viên MBA bỏ học 3 buổi liên tiếp hoặc điểm số rớt xuống dưới chuẩn.
- **Kịch bản (Context):** Agent nhận tín hiệu "At Risk" từ hệ thống và chủ động nhắn tin qua Zalo.
- **Agent Prompt:** *"Chào anh/chị, hệ thống ghi nhận anh/chị đã vắng 3 buổi liên tiếp môn [Tên môn]. Để đảm bảo tiến độ bảo vệ luận án, anh/chị có gặp khó khăn gì cần bộ phận học vụ hỗ trợ học bù hoặc tài liệu không?"*
- **Kỳ vọng:** 
  - Khơi gợi vấn đề một cách hỗ trợ (supportive), không trách móc.
  - Áp dụng `Student risk and intervention playbook` để đưa ra giải pháp (học bù, bảo lưu tạm thời, gửi tài liệu).

---

## 3. Kịch bản 3: Hỗ trợ Sự cố & Khiếu nại (Complaints & Escalation)

### 3.1. Phàn nàn về chất lượng giảng dạy
- **User Intent:** Khách hàng không hài lòng với trải nghiệm học.
- **Kịch bản (Prompt):** *"Giáo viên lớp Speaking hiện tại phát âm rất khó nghe, lại hay vào muộn. Tôi muốn đổi giáo viên hoặc đổi lớp, nếu không tôi sẽ rút học phí."*
- **Kỳ vọng:** 
  - Nhận diện thái độ tiêu cực. Xoa dịu và ghi nhận thông tin khiếu nại.
  - Không tự ý hứa hẹn đổi lớp/hoàn tiền ngay.
  - Tạo ticket ưu tiên cao (High Priority) và handoff (chuyển giao) cho Quản lý Trung tâm / Customer Success Manager xử lý. Giữ nguyên context để khách không phải lặp lại.

### 3.2. Lỗi hệ thống PWA / Web (Technical Support)
- **User Intent:** Học viên không nộp được bài tập trên LMS.
- **Kịch bản (Prompt):** *"App bị lỗi à? Tôi không tải file luận văn lên hệ thống PWA được, cứ báo quá dung lượng dù file chỉ có 5MB."*
- **Kỳ vọng:** 
  - Agent hướng dẫn cách xử lý cơ bản (clear cache, đổi định dạng).
  - Ghi nhận lỗi kỹ thuật, chuyển sang team IT. Thông báo phương án nộp bài tạm thời (VD: gửi qua email giáo vụ).

---

## 4. Kịch bản 4: Tư vấn Tiếp nối, Tái tục (Retention, Upsell & Cross-sell)

### 4.1. Đề xuất lộ trình tiếp theo (Gần cuối khóa)
- **User Intent:** Khóa học sắp kết thúc (còn 2-3 tuần), user muốn biết học gì tiếp.
- **Kịch bản (Prompt):** *"Tháng sau tôi học xong khóa MBA Cơ sở này rồi, tiếp theo tôi phải đăng ký học những môn chuyên ngành nào? Có ưu đãi gì nếu tôi đóng học phí sớm không?"*
- **Kỳ vọng:** 
  - Áp dụng `Course recommendation rules`.
  - Phân tích dữ liệu: Độ tuổi, Level hiện tại, Mục tiêu, Lịch học.
  - Đề xuất 2-3 môn/khóa chuyên ngành tiếp theo hợp lý.
  - Trả lời rõ về chính sách ưu đãi (nếu có dữ liệu CRM) hoặc chuyển cho bộ phận Tư vấn.

### 4.2. Tư vấn khóa học bổ trợ (Cross-sell dựa trên Performance)
- **User Intent:** Phụ huynh thắc mắc vì sao con học yếu một kỹ năng và cần giải pháp.
- **Kịch bản (Prompt):** *"Tôi thấy điểm ngữ pháp của cháu rất tốt, nhưng điểm nghe nói (Listening/Speaking) lại bị điểm C. Trung tâm có cách nào khắc phục không?"*
- **Kỳ vọng:** 
  - Xác nhận vấn đề bằng dữ liệu thật từ LMS.
  - Tư vấn khóa học bổ trợ (VD: Lớp giao tiếp 1:1, Lớp luyện phát âm cuối tuần).
  - Giải thích rõ: *"Tại sao khóa này phù hợp?"* (để cải thiện đúng kỹ năng Listening/Speaking đang yếu).

### 4.3. Xử lý nguy cơ rớt hạng tái tục (Churn Risk - Phụ huynh chưa thấy tiến bộ)
- **User Intent:** Phụ huynh phân vân không muốn đăng ký tiếp.
- **Kịch bản (Prompt):** *"Hết khóa này tôi định cho cháu nghỉ. Học cả năm rồi mà tôi thấy cháu ở nhà vẫn không tự tin giao tiếp tiếng Anh, cảm giác không tiến bộ mấy."*
- **Kỳ vọng:** 
  - **KHÔNG** vội vàng ép mua khóa tiếp theo hay ném ra các mã giảm giá (Discount).
  - Áp dụng `Retention policy`: Ưu tiên giải quyết vướng mắc thực tế.
  - Agent cần tổng hợp dữ liệu tiến bộ (Progress report cụ thể: điểm số đầu vào vs hiện tại, nhận xét điểm sáng của giáo viên).
  - Đề xuất giải pháp (VD: sắp xếp buổi nói chuyện trực tiếp với giáo viên nước ngoài để test lại, hoặc đổi lớp có phương pháp năng động hơn).

---

## 5. Tiêu chí Đánh giá (Pass/Fail Criteria) chung cho các test case
1. **Tính chính xác của dữ liệu:** Không ảo giác (hallucinate). Nếu thiếu dữ liệu, phải nói rõ.
2. **Tuân thủ luồng (Workflow Compliance):** Các nghiệp vụ nhạy cảm (xin nghỉ, học bù, đổi lớp) phải đi qua bước check điều kiện và yêu cầu user xác nhận.
3. **Mức độ cá nhân hóa:** Câu trả lời dựa trên context của user (tuổi, level, lịch sử học tập).
4. **Xử lý Handoff:** Khiếu nại gắt gao hoặc vượt quyền phải chuyển cho human agent với đầy đủ context.
5. **Định hướng giá trị (Value-driven):** Việc Upsell/Cross-sell phải giải quyết đúng nỗi đau (pain point) hoặc lộ trình học tập, không chèo kéo vô lý.
