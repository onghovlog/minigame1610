# WEB MULTIVERSE — Mini Game Khởi Động & Hướng Nghiệp

Mini game trắc nghiệm 7 câu hỏi tương tác thời gian thực dành cho lớp học / sự kiện giới thiệu ngành Web. Sinh viên quét mã QR tham gia trên điện thoại, kết quả hiển thị trực tiếp lên màn hình Admin / Máy chiếu.

---

## 🚀 Công nghệ
- **Frontend**: HTML5, CSS3 (Modern Dark Theme, Mobile-First), Vanilla JavaScript
- **Backend API**: JSON Server (`db.json`)
- **Tương tác thời gian thực**: Auto Polling Dashboard mỗi 3 giây
- **Mã QR trực tiếp**: Tạo mã QR tự động trên Dashboard và màn hình người chơi (hoạt động 100% offline)

---

## ⚡ Cách chạy nhanh (1 Click)
Nếu dùng Windows, chỉ cần **click đúp vào file `start.bat`** để tự động khởi động cả Backend API và Frontend.

---

## 🛠️ Chạy bằng lệnh thủ công

Yêu cầu máy tính đã cài **Node.js**.

1. **Khởi động Backend Mock API (Port 3000):**
   ```bash
   npx json-server@0.17.4 --watch db.json --port 3000 --host 0.0.0.0
   ```

2. **Khởi động Frontend Server (Port 5000):**
   ```bash
   npx serve -l 5000 .
   ```
   *(Hoặc dùng Live Server trong VS Code / Laragon).*

---

## 🔗 Đường dẫn truy cập

- 🎮 **Người chơi (Sinh viên):** `http://localhost:5000/` (hoặc `http://IP_LAN:5000/`)
- 📊 **Màn hình Admin / Máy chiếu:** `http://localhost:5000/admin.html`
- 📱 **Quét mã QR:** Bấm nút **"Phóng to mã QR"** trên trang Admin để cả lớp quét bằng camera điện thoại.

---

## 🔄 Luồng ứng dụng
- **Sinh viên:** `index.html` (Nhập tên & Quét QR) ➔ `game.html` (7 câu hỏi) ➔ `result.html` (Vũ trụ nghề nghiệp Web phù hợp)
- **Admin:** `admin.html` (Thống kê số lượng tham gia, top vũ trụ dẫn đầu, danh sách người chơi mới nhất thời gian thực).

---

## 📌 5 Vũ trụ nghề nghiệp Web
1. 🌱 **GROWTH**: SEO, Marketing, Traffic & Data
2. 🎨 **EXPERIENCE**: UI/UX Design & Frontend Trải nghiệm
3. 🚀 **PRODUCT**: BA, Product Owner, Agile & DevOps
4. 🐞 **BUG HUNTER**: QA, Testing & Automation
5. 🤖 **AI FUTURE**: AI Coding, Prompting & AI Workflows
