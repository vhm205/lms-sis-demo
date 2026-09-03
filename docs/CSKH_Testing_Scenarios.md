# Kịch bản Kiểm thử (Test Scenarios) - Hệ thống CSKH Post-Sales (SIS/LMS)

## 1. Tổng quan

Tài liệu này cung cấp các kịch bản (scenarios) để kiểm thử luồng Chăm sóc khách hàng (CSKH) bằng AI Agent trên hệ thống SIS/LMS hiện tại, tập trung vào giai đoạn sau khi chốt deal (Post-sales). 

- **Đối tượng:** Phụ huynh (hỏi cho con), Học sinh độ tuổi trưởng thành (học cao học, MBA, chứng chỉ), Giáo viên.
- **Mục tiêu:** Kiểm thử các nghiệp vụ CSKH thường ngày, giải quyết sự cố, báo cáo học tập và thúc đẩy tỷ lệ duy trì (retention), học tiếp (upsell) hoặc học bổ trợ (cross-sell).
- **Phạm vi (In-scope):** Các hoạt động diễn ra *trong và sau* khóa học. Không bao gồm quy trình tuyển sinh ban đầu.
- **Kênh tương tác (Channels):** Web, PWA (Progressive Web App), Zalo Mini App / Zalo OA.

---

## 2. Kịch bản 1: Thông tin Học tập &amp; Quản lý Lịch (Daily Operations)

### 2.1 Tra cứu lịch học, lịch thi

- **User Intent:** Học viên (MBA) hoặc Phụ huynh muốn biết lịch trình sắp tới.
- **Kịch bản (Prompt):** *"Tuần này tôi/con tôi có lịch thi hay thay đổi phòng học nào không? Gửi cho tôi lịch học chi tiết từ giờ đến cuối tháng."*
- **Kỳ vọng (Expected Behavior):** 
  - Trích xuất đúng dữ liệu lịch học/thi từ SIS.
  - Không tự suy đoán lịch. Trả lời rõ ràng ngày, giờ, phòng học, giáo viên.

### 2.2 Xin phép nghỉ học và sắp xếp học bù

- **User Intent:** Xin nghỉ đột xuất và muốn đảm bảo quyền lợi học bù.
- **Kịch bản (Prompt):** *"Thứ 3 tuần sau con tôi bị ốm không đi học được. Xin cho cháu nghỉ và sắp xếp học bù. Trung tâm xem có lớp nào trống không?"*
- **Kỳ vọng:** 
  - Ghi nhận trạng thái "Xin nghỉ phép".
  - Chạy luồng `Chính sách Học bù` (Kiểm tra eligibility, tìm lớp bù cùng level, check capacity và trùng lịch).
  - Đề xuất 2-3 ca học bù khả thi để user xác nhận. Không tự ý chốt lớp khi chưa có confirm.

---

## 3. Kịch bản 2: Báo cáo Tiến độ &amp; Cảnh báo Học tập (Learning Progress)

### 3.1 Tra cứu điểm số và nhận xét

- **User Intent:** Phụ huynh muốn biết tình hình học tập trong quá trình tham gia khóa học.
- **Kịch bản (Prompt):** *"Gửi cho tôi bảng báo cáo học tập của em Đặng Gia Huy. Tôi thấy dạo này cháu làm bài tập về nhà có vẻ chểnh mảng."*
- **Kỳ vọng:** 
  - Trích xuất điểm thi và nhận xét thực tế (nếu có) từ LMS.
  - Nếu thiếu dữ liệu, phải thông báo rõ (VD: *"Giáo viên chưa cập nhật nhận xét..."*). Không bịa nhận xét.
  - Phản hồi khéo léo về vấn đề "chểnh mảng", đề xuất gửi cảnh báo cho giáo viên chủ nhiệm/cố vấn học tập (Academic Review).

### 3.2 Agent chủ động xử lý Cảnh báo rủi ro (Risk Intervention)

- **User Intent:** Học viên MBA bỏ học 3 buổi liên tiếp hoặc điểm số rớt xuống dưới chuẩn.
- **Kịch bản (Context):** Agent nhận tín hiệu "At Risk" từ hệ thống và chủ động nhắn tin qua Zalo.
- **Agent Prompt:** *"Chào anh/chị, hệ thống ghi nhận anh/chị đã vắng 3 buổi liên tiếp môn [Tên môn]. Để đảm bảo tiến độ bảo vệ luận án, anh/chị có gặp khó khăn gì cần bộ phận học vụ hỗ trợ học bù hoặc tài liệu không?"*
- **Kỳ vọng:** 
  - Khơi gợi vấn đề một cách hỗ trợ (supportive), không trách móc.
  - Áp dụng `Student risk and intervention playbook` để đưa ra giải pháp (học bù, bảo lưu tạm thời, gửi tài liệu).

---

## 4. Kịch bản 3: Hỗ trợ Dịch vụ, Sự cố &amp; Khiếu nại (Service &amp; Support)

### 4.1 Yêu cầu chuyển cơ sở / Đổi lớp dài hạn

- **User Intent:** Chuyển nhà, đổi lịch học ở trường, phụ huynh yêu cầu chuyển lớp.
- **Kịch bản (Prompt):** *"Tháng sau nhà chị chuyển sang Quận 7, chị muốn chuyển cơ sở cho bé Minh qua đó học luôn. Bên đó có lớp nào cùng trình độ và học tối 3-5 không em?"*
- **Kỳ vọng:** 
  - Check level và khóa học hiện tại của học viên.
  - Search các lớp phù hợp ở cơ sở Quận 7.
  - Nêu rõ policy (phí chuyển cơ sở, bảo lưu công nợ, cần form xác nhận) và tạo request chuyển lớp pending.

### 4.2 Lỗi hệ thống PWA / Web (Technical Support)

- **User Intent:** Học viên không nộp được bài tập trên LMS.
- **Kịch bản (Prompt):** *"App bị lỗi à? Tôi không tải file luận văn lên hệ thống PWA được, cứ báo quá dung lượng dù file chỉ có 5MB."*
- **Kỳ vọng:** 
  - Hướng dẫn xử lý cơ bản (clear cache, format file).
  - Ghi nhận lỗi kỹ thuật, chuyển sang team IT. Thông báo phương án nộp bài tạm thời (qua email giáo vụ).

### 4.3 Khiếu nại thái độ dịch vụ &amp; Yêu cầu gặp người thật (Human Handoff)

- **User Intent:** Bức xúc về chất lượng, yêu cầu gặp quản lý.
- **Kịch bản (Prompt):** *"Phòng học hôm nay nóng không có điều hòa. Báo mấy lần không sửa. Nối máy cho tôi gặp quản lý trung tâm ngay, không nói chuyện với máy nữa!"*
- **Kỳ vọng:** 
  - Nhận diện sentiment tức giận/tiêu cực. Xoa dịu và ghi nhận phàn nàn.
  - Dừng luồng bot tự động.
  - Tự động tạo ticket (Service Request) mức độ ưu tiên cao (`High Priority`) và thực hiện **Handoff** cho Human Agent kèm toàn bộ lịch sử chat (context).

---

## 5. Kịch bản 4: Tra cứu Học phí &amp; Thanh toán (Finance / Payment)

### 5.1 Tra cứu công nợ và số buổi học dư

- **User Intent:** Kiểm tra thông tin thanh toán đầu/cuối tháng.
- **Kịch bản (Prompt):** *"Tháng này bé Minh đóng bao nhiêu tiền học phí vậy em? Còn nợ hay dư buổi nào từ tháng trước không?"*
- **Kỳ vọng:** 
  - Gọi API Billing/Finance để lấy chính xác số tiền cần đóng / số dư / nợ.

### 5.2 Độ trễ xác nhận chuyển khoản

- **User Intent:** Báo đã chuyển tiền nhưng app chưa cập nhật.
- **Kịch bản (Prompt):** *"Chị vừa chuyển khoản 5 triệu rồi đó, sao trên app vẫn báo chưa đóng tiền?"*
- **Kỳ vọng:** 
  - **Không được phép ảo giác (hallucinate) tự confirm "Đã nhận được tiền"** khi trạng thái hệ thống vẫn là pending.
  - Giải thích về độ trễ đồng bộ (freshness) hoặc yêu cầu khách gửi ảnh biên lai để kế toán đối soát.

---

## 6. Kịch bản 5: Tư vấn Tiếp nối, Tái tục (Retention &amp; Upsell)

### 6.1 Đề xuất lộ trình tiếp theo (Gần cuối khóa)

- **User Intent:** Khóa học sắp kết thúc, tìm hiểu lộ trình tiếp.
- **Kịch bản (Prompt):** *"Tháng sau tôi học xong khóa MBA Cơ sở này rồi, tiếp theo tôi phải đăng ký học những môn chuyên ngành nào? Có ưu đãi gì không?"*
- **Kỳ vọng:** 
  - Phân tích dữ liệu: Độ tuổi, Level hiện tại, Mục tiêu, Lịch học.
  - Đề xuất 2-3 môn/khóa chuyên ngành tiếp theo hợp lý kèm ưu đãi (nếu có).

### 6.2 Tư vấn khóa học bổ trợ (Cross-sell dựa trên điểm yếu)

- **User Intent:** Phụ huynh thắc mắc vì sao con học yếu một kỹ năng và cần giải pháp.
- **Kịch bản (Prompt):** *"Điểm ngữ pháp của cháu rất tốt, nhưng Listening/Speaking lại bị điểm C. Trung tâm có cách nào khắc phục không?"*
- **Kỳ vọng:** 
  - Tư vấn khóa học bổ trợ (VD: Lớp giao tiếp 1:1, Lớp luyện phát âm).
  - Giải thích rõ: *"Tại sao khóa này phù hợp?"* (để cải thiện đúng kỹ năng đang yếu).

### 6.3 Xử lý nguy cơ rớt hạng tái tục (Retention)

- **User Intent:** Phụ huynh phân vân không muốn đăng ký tiếp do chưa thấy tiến bộ.
- **Kịch bản (Prompt):** *"Hết khóa này tôi định cho cháu nghỉ. Học cả năm rồi mà thấy cháu ở nhà vẫn không tự tin giao tiếp, không tiến bộ mấy."*
- **Kỳ vọng:** 
  - **KHÔNG** vội vàng ép mua khóa tiếp hay ném mã giảm giá.
  - Tổng hợp dữ liệu tiến bộ thực tế (điểm số đầu vào vs hiện tại, nhận xét của giáo viên).
  - Đề xuất giải pháp (VD: đổi lớp có phương pháp năng động hơn, trò chuyện 1:1 với giáo viên) để giữ chân khách hàng.

---

## 7. Tiêu chí Đánh giá (Pass/Fail Criteria) chung

1. **Tính chính xác của dữ liệu:** Không ảo giác (hallucinate) đặc biệt ở luồng Lịch học và Thanh toán. Nếu thiếu dữ liệu, phải nói rõ.
2. **Tuân thủ luồng (Workflow Compliance):** Các nghiệp vụ ghi dữ liệu (xin nghỉ, học bù, đổi cơ sở) phải đi qua bước check điều kiện và yêu cầu user xác nhận.
3. **Mức độ cá nhân hóa:** Câu trả lời dựa trên context của user (tuổi, level, lịch sử).
4. **Xử lý Handoff:** Khiếu nại gắt gao hoặc user yêu cầu gặp người thật phải chuyển cho human agent với đầy đủ context.
5. **Định hướng giá trị (Value-driven):** Tư vấn Upsell/Cross-sell phải giải quyết đúng nỗi đau (pain point) hoặc lộ trình, không chèo kéo vô lý.

