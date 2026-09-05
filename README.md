# Vật Lý 9 → 12 — Physics Master

Web app học Vật Lý HTML/CSS/JS + Firebase + MathJax + Chart.js.

## Có gì trong bản này
- Tổng quan lớp 9 → 12, ưu tiên nội dung lớp 11.
- Mỗi chủ đề có: bản chất, công thức MathJax, đơn vị, điều kiện áp dụng, mẹo bản chất, dạng bài, ví dụ nhanh và đồ thị.
- Đồ thị dao động sin/cos, minh họa quan hệ đại lượng.
- Luyện tập trắc nghiệm theo bản chất.
- Lưu chủ đề; nếu đăng nhập, danh sách lưu được đồng bộ Firestore.
- Firebase Authentication bằng email/password.
- Responsive mobile-first, 320px → desktop 1920px.
- Accessibility: focus ring, Tab/Enter, aria-label, skip link, tap target ≥44px.

## Firebase của bạn
`firebase-config.js` được giữ nguyên từ file bạn cung cấp, trỏ tới project `englishproject-c0131`. fileciteturn0file0L1-L8

### Bật Firebase
Trong Firebase Console của project đó:
1. Authentication → Sign-in method → bật Email/Password.
2. Firestore Database → tạo database.
3. Dùng Firestore Rules để giới hạn `/users/{uid}` chỉ cho chính uid đó.

API key trong Firebase web config không phải mật khẩu bí mật; bảo vệ dữ liệu bằng Authentication + Security Rules.

## Chạy local
Vì ES Modules cần web server, không mở `index.html` bằng `file://`.

Ví dụ:
```bash
python -m http.server 5500
```
Sau đó mở `http://localhost:5500`.

Có thể deploy thẳng lên Firebase Hosting, Vercel, Netlify hoặc GitHub Pages.
# vatly
