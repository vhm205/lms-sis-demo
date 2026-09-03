# Bộ Prompt Instructions Tạo Slide Bằng AI (NotebookLLM, Gamma, Claude/ChatGPT)

> **Mục đích:** File này chứa các prompt đã được tinh chỉnh tối ưu để bạn copy trực tiếp vào **NotebookLLM**, **Gamma.app**, hoặc **ChatGPT / Claude**, tạo ra bộ slide thuyết trình 5 trang chuyên nghiệp về đề tài:  
> **"Giải Pháp Trợ Lý AI Chăm Sóc Khách Hàng Giáo Dục Qua Chat (Orchexa x EduCenter)"**.  
>  
> **Tiêu chí:**  
> - 100% Tập trung vào **Vấn đề thực tế & Giá trị nghiệp vụ mang lại**.  
> - **Kênh tương tác:** Cổng **Web Portal** và **Mobile App (PWA)** của trung tâm trường học (không dùng Zalo).  
> - **Không dùng thuật ngữ kỹ thuật phức tạp** (không nhắc code, API, database, MCP).  
> - **Không có tính năng tự động cảnh báo nền**; tất cả thao tác đều bắt đầu khi **Người dùng trực tiếp nhắn tin qua Chat**.

---

## 📌 PHẦN 1: PROMPT CHO NOTEBOOKLLM (GOOGLE)

### Các bước thực hiện:
1. Truy cập [notebooklm.google.com](https://notebooklm.google.com).
2. Tạo Notebook mới và tải lên các file nguồn trong dự án:
   - `docs/presentation/CSKH_Orchexa_EduCenter_Slides_Notes.md`
   - `docs/CSKH_Testing_Scenarios.md`
   - `docs/knowledge/13_student_report_generation.md`
   - `docs/knowledge/14_promotions_and_carousel_actions_playbook.md`
3. Copy đoạn prompt dưới đây vào khung chat của NotebookLLM:

```text
Dựa trên tài liệu nguồn về giải pháp Trợ lý AI CSKH Giáo dục (Orchexa x EduCenter), hãy đóng vai trò là một Chuyên gia Tư vấn Giải pháp Giáo dục (Education Solutions Consultant). 

Hãy soạn cho tôi một BỘ DÀN Ý SLIDE THUYẾT TRÌNH CHI TIẾT GỒM ĐÚNG 5 TRANG dành cho khán giả là Ban Giám Đốc Trung Tâm Đào Tạo và Bộ Phận Chăm Sóc Khách Hàng / Giáo Vụ.

Yêu cầu định hướng nội dung:
1. KHÔNG sử dụng các thuật ngữ kỹ thuật (không nhắc API, MCP, database, JSON, code).
2. KHÔNG nhắc đến Zalo. Kênh giao tiếp chuẩn là: Web Portal và Mobile App (PWA) của nhà trường/trung tâm.
3. KHÔNG có tính năng tự động gửi cảnh báo từ hệ thống (bỏ hoàn toàn tính năng tự động cảnh báo vắng/nghỉ học vì chưa có flow automation). Mọi tương tác đều bắt đầu khi Phụ huynh / Học viên CHỦ ĐỘNG NHẮN TIN QUA CHAT trên Web Portal hoặc Mobile App (PWA).
4. Về điểm nghẽn (Slide 1): Thay thế hoàn toàn "can thiệp rủi ro muộn" bằng 2 bài toán nhức nhối thực tế:
   - "Thiếu kênh trả lời 24/7 báo cáo tình hình kết quả học tập của học sinh" (phụ huynh lo lắng, giáo vụ mất nhiều ngày tổng hợp thủ công điểm số và nhận xét).
   - "Chưa tự đề xuất các sự kiện & chiến dịch marketing cho các khóa học liên quan sau khi kết thúc khóa hiện tại" (bỏ lỡ cơ hội tái tục, sụt giảm doanh thu khóa mới).
5. Về các tình huống thực tế đã hỗ trợ sẵn (Slide 3): Bổ sung đầy đủ các kịch bản sẵn có trong hệ thống:
   - Xin nghỉ phép & tự động xếp học bù trong 30 giây.
   - Trả lời 24/7 báo cáo kết quả học tập & tiến độ chuyên cần (kèm link xem báo cáo trực quan / xuất PDF).
   - Tự đề xuất các sự kiện & chiến dịch marketing khóa học tiếp nối kèm voucher ưu đãi (Carousel actions).
   - Xử lý khiếu nại bức xúc & chuyển giao tức thì cho Quản lý (Human Handoff < 2 giây).
   - Tra cứu học phí & minh bạch đối soát thanh toán.

Cấu trúc từng slide (Slide 1 đến Slide 5) phải có:
- Tiêu đề & Phụ đề ngắn gọn, ấn tượng.
- Bố cục trực quan đề xuất (Cards, Bảng tình huống, Cột đối chiếu, Hộp số liệu).
- Nội dung hiển thị dạng bullet points cô đọng, nêu rõ câu chuyện thực tế (Bé Nhật Minh xin học bù, phụ huynh hỏi báo cáo học tập và nhận ưu đãi khóa mới, khiếu nại điều hòa hỏng).
- Kịch bản lời thoại người thuyết trình (Speaker Notes) hoàn chỉnh (120 - 160 từ, giọng văn tự nhiên, thuyết phục, hướng đến nhà quản lý giáo dục).

Trình tự 5 slide:
- Slide 1: Điểm nghẽn CSKH & Quản trị học viên sau tuyển sinh (Quá tải xin nghỉ/học bù, thiếu kênh trả lời 24/7 báo cáo kết quả học tập, chưa tự đề xuất sự kiện/chiến dịch marketing khóa tiếp nối, khủng hoảng khiếu nại).
- Slide 2: Mô hình hoạt động thực tế (Phụ huynh nhắn chat qua Web Portal & Mobile App PWA -> Trợ lý AI hiểu câu hỏi & quy chế trường -> Kết nối dữ liệu EduCenter để chốt việc hoặc nối máy cho quản lý).
- Slide 3: 5 Tình huống thực tế sẵn có giải quyết trọn vẹn qua chat (Xin nghỉ & học bù, Báo cáo kết quả học tập 24/7 kèm PDF, Đề xuất chiến dịch marketing & voucher khóa học liên quan, Xử lý khiếu nại & handoff quản lý, Tra cứu học phí & đối soát).
- Slide 4: Trực quan hóa 2 trải nghiệm chat tiêu biểu (Tình huống 1: Xếp học bù bé Nhật Minh trong 30 giây; Tình huống 2: Phụ huynh hỏi báo cáo học tập 24/7 & nhận đề xuất ưu đãi khóa học tiếp theo hoặc Xử lý phụ huynh giận dữ & chuyển giao quản lý trong 2 giây).
- Slide 5: Giá trị thực tế mang lại (Cho Phụ huynh, Cho Nhân viên giáo vụ, Cho Ban Giám Đốc) & 4 chỉ số đo lường hiệu quả (75-80% tự động, tiết kiệm 2-3h/ngày, tăng 15-20% tái tục nhờ marketing thông minh, handoff < 2s).
```

---

## 📌 PHẦN 2: PROMPT TỐI ƯU CHO GAMMA.APP (TẠO SLIDE TỰ ĐỘNG)

> **Mẹo dùng trên Gamma (gamma.app):**
> 1. Chọn **New with AI** -> **Paste in text**.
> 2. Chọn định dạng **Presentation**, số lượng: **5 cards**.
> 3. Dán toàn bộ khối Markdown bên dưới vào:

```markdown
# Giải Pháp Trợ Lý AI Chăm Sóc Khách Hàng Giáo Dục Qua Chat: Orchexa x EduCenter

---

## Slide 1: Thực Trạng CSKH & Quản Trị Học Viên Sau Tuyển Sinh
*Điểm nghẽn vận hành hàng ngày tại các trung tâm đào tạo và trường học tại Việt Nam*

### 4 Nỗi Đau Lớn Của Đội Ngũ Vận Hành & CSKH
- **01. Quá tải xin nghỉ & xếp học bù qua chat:** Phụ huynh nhắn tin rải rác xin nghỉ đột xuất. Nhân sự phải mất 15–30 phút lục tìm 3-4 màn hình sổ sách để dò lớp cùng trình độ và kiểm tra còn chỗ trống hay không.
- **02. Thiếu kênh trả lời 24/7 báo cáo tình hình kết quả học tập của học sinh:** Phụ huynh lo lắng sốt ruột hỏi điểm thi, học lực và nhận xét của thầy cô; giáo vụ mất nhiều ngày tổng hợp thủ công, dễ gây nghi ngờ và bất an.
- **03. Chưa tự đề xuất các sự kiện & chiến dịch marketing cho khóa học liên quan sau kết thúc khóa hiện tại:** Trung tâm thiếu cơ chế tự động gợi ý lộ trình nâng cao, sự kiện ưu đãi hay voucher kịp thời, khiến tỷ lệ tái tục giảm sút.
- **04. Khủng hoảng khiếu nại không được chuyển giao kịp thời:** Học viên bức xúc vì sự cố phòng ốc hay lỗi nộp bài. Chatbot thông thường trả lời máy móc làm khách giận dữ hơn; quản lý không nhận được thông tin kịp thời.

> **Mục tiêu:** Chuyển đổi từ trực chat thủ công sang Trợ lý AI phản hồi tức thì 24/7 trên Web Portal & Mobile App (PWA), giải quyết dứt điểm công việc ngay trong cuộc trò chuyện.

---

## Slide 2: Mô Hình Hoạt Động: Người Học Nhắn Chat ➔ AI Giải Quyết Dứt Điểm
*Mọi tương tác bắt đầu từ cuộc trò chuyện tự nhiên của Phụ huynh & Học sinh*

### 3 Bước Vận Hành Thực Tế
1. **Bước 1: Phụ Huynh / Học Viên Chủ Động Nhắn Chat:**
   - Nhắn tin qua Cổng Web Portal hoặc Mobile App (PWA) của nhà trường
   - Không cần cài đặt ứng dụng phức tạp, truy cập tức thì trên điện thoại và máy tính
   - Mọi tương tác do người dùng chủ động khởi tạo, không có spam cảnh báo tự động
2. **Bước 2: Trợ Lý AI Orchexa Xử Lý Nghiệp Vụ:**
   - Hiểu đúng câu hỏi bằng ngôn ngữ tự nhiên, phân biệt câu hỏi thông thường với khiếu nại bức xúc
   - Tuân thủ nghiêm quy chế trung tâm (điều kiện nghỉ có phép, trình độ lớp, chính sách ưu đãi)
   - Tự động gọi công cụ tra cứu lớp bù, xuất báo cáo học tập và đề xuất chương trình khuyến mãi
   - Lập tức dừng tự động và chuyển giao cho Quản lý khi gặp tình huống nhạy cảm
3. **Bước 3: Kết Nối Trực Tiếp Dữ Liệu Trường Học EduCenter:**
   - Kiểm tra sĩ số thực tế theo thời gian thực (đảm bảo lớp bù còn chỗ trống)
   - Trích xuất điểm thi, nhận xét thật từ sổ điểm giáo viên để xuất báo cáo PDF/Preview trực quan
   - Cập nhật lịch học bù và hồ sơ học sinh ngay lập tức

> **3 Cam kết:** Nói sự thật dựa trên dữ liệu trường • Kiểm tra điều kiện trước khi chốt • Nhường quyền cho con người khi cần.

---

## Slide 3: 5 Tình Huống CSKH Thực Tế Được Giải Quyết Trọn Vẹn Qua Chat
*Được đúc kết từ các nghiệp vụ thực tế đã được hỗ trợ sẵn 100% trên hệ thống*

| Tình Huống Nghiệp Vụ | Yêu Cầu Thực Tế Của Khách Hàng | Trợ Lý AI Xử Lý & Giải Quyết | Giá Trị Mang Lại |
| :--- | :--- | :--- | :--- |
| **1. Xin nghỉ & Học bù** | Bé ốm xin nghỉ đột xuất, hỏi lớp bù cuối tuần. | Tra cứu lớp, tìm ca cùng level còn ghế trống, gửi phụ huynh chọn và chốt lịch trong 30 giây. | Tiết kiệm 90% thời gian giáo vụ; lớp không bị quá tải. |
| **2. Báo cáo học tập 24/7** | Phụ huynh hỏi bảng điểm, nhận xét giáo viên và tình hình học. | Tổng hợp điểm thi, GPA, chuyên cần; gửi link xem báo cáo trực quan hoặc xuất file PDF tức thì. | Minh bạch và chính xác; giải tỏa ngay sự lo lắng của phụ huynh. |
| **3. Marketing & Khóa học tiếp nối** | Con sắp hết khóa hoặc cần bổ trợ kỹ năng Speaking còn yếu. | Tự động đề xuất lộ trình môn nâng cao, gửi voucher ưu đãi (Carousel Card) và hỗ trợ giữ chỗ lớp mới. | Tăng 15–20% tỷ lệ tái tục (Renewal) và giá trị học viên. |
| **4. Khiếu nại bức xúc** | Khách giận vì điều hòa hỏng, đòi gặp quản lý ngay. | Xin lỗi chân thành, ngắt bot tự động, nối máy khẩn cấp cho Quản lý trung tâm trong 2 giây kèm context. | Dập tắt khủng hoảng; Quản lý nắm trọn bối cảnh để xử lý. |
| **5. Học phí & Chuyển khoản** | Phụ huynh vừa chuyển 5tr hỏi sao app chưa báo nhận. | Tra cứu công nợ, giải thích độ trễ đối soát ngân hàng, xin ảnh biên lai; không tự ý xác nhận bừa bãi. | Minh bạch tiền bạc; tránh nhầm lẫn kế toán. |

---

## Slide 4: Chi Tiết Trải Nghiệm Chat: Xếp Học Bù & Báo Cáo Kèm Ưu Đãi
*Minh họa sinh động trải nghiệm thực tế trên Cổng Web Portal & Mobile App (PWA)*

### Tình Huống 1: Xếp Lịch Học Bù Cho Bé Nhật Minh (Xong trong 30 giây)
- **Tin nhắn phụ huynh (Web/App):** *"Hôm nay thứ 3 bé Minh sốt xin nghỉ. Cuối tuần này có lớp Movers nào trống cho bé học bù không em?"*
- **AI xử lý thông minh:** Nhận diện bé Minh lớp Movers ➔ Đánh dấu nghỉ có phép ➔ Quét lớp còn chỗ vào T7/CN ➔ Đề xuất 2 ca học khả thi tại Bình Thạnh và Quận 7.
- **Hoàn tất:** Phụ huynh chọn ca sáng CN ➔ Hệ thống chốt danh sách, gửi lịch học và tên phòng cho mẹ. Giáo vụ không phải mất nửa tiếng dò sổ sách.

### Tình Huống 2: Báo Cáo Học Tập 24/7 & Đề Xuất Ưu Đãi Khóa Mới
- **Tin nhắn phụ huynh:** *"Gửi cho tôi bảng điểm thi giữa kỳ vừa rồi và tình hình học của cháu. Con sắp hết khóa rồi, trung tâm có khóa tiếp theo nào phù hợp không?"*
- **AI xử lý tức thì:** Trích xuất báo cáo học tập chi tiết, gửi link xem trước trực quan ➔ Nhận diện khóa sắp kết thúc, tự động hiển thị thẻ ưu đãi Voucher giảm 15% khóa học tiếp theo.
- **Kết quả:** Phụ huynh an tâm về kết quả của con và bấm "Nhận voucher" giữ chỗ khóa mới ngay trên màn hình chat.

---

## Slide 5: Giá Trị Thực Tế Mang Lại & Hiệu Quả Đo Lường
*Nâng cao toàn diện chất lượng phục vụ mà không cần tăng biên chế nhân sự*

### Giá Trị Cho Từng Đối Tượng
- **Đối với Phụ huynh & Học sinh:** Được phục vụ tức thì 24/7 qua Web Portal & Mobile App (PWA), không phải chờ đợi giờ hành chính; an tâm về chất lượng chăm sóc.
- **Đối với Nhân viên CSKH & Giáo vụ:** Giảm 80% áp lực trả lời các câu hỏi lặp lại; tiết kiệm 2–3 giờ mỗi ngày để tập trung chăm sóc học sinh cần kèm cặp.
- **Đối với Ban Giám Đốc:** Tăng 15–20% tỷ lệ tái tục khóa mới nhờ cơ chế tự đề xuất chiến dịch marketing thông minh; ngăn chặn rủi ro phụ huynh bức xúc rút học phí.

### 4 Chỉ Số Hiệu Quả Thực Tế
- **75% - 80%** yêu cầu hỏi đáp qua chat được giải quyết tự động 24/7.
- **2 - 3 Giờ** tiết kiệm mỗi ngày cho mỗi nhân viên giáo vụ / CSKH.
- **+15% - 20%** tỷ lệ phụ huynh tiếp tục đăng ký khóa học tiếp theo.
- **< 2 Giây** thời gian hoàn tất chuyển giao khiếu nại tới người quản lý.
```

