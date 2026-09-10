# 🏫 Roomify — Frontend

ระบบจองห้องเรียนออนไลน์ **Roomify** พัฒนาด้วย Next.js, React และ TypeScript โดยเชื่อมต่อกับ Backend API ที่พัฒนาด้วย NestJS

## ✨ ความสามารถ
- สมัครสมาชิกและเข้าสู่ระบบ
- Google Login
- จัดการข้อมูลผู้ใช้งาน
- ดูและจัดการห้องเรียน
- ดูตารางการใช้ห้อง
- จองและยกเลิกห้องเรียน
- ดูประวัติการจอง
- ระบบประชาสัมพันธ์
- รองรับ LINE
- ปรับแต่งธีมสี
- สิทธิ์ User / Admin

## 🛠️ เทคโนโลยี
Next.js • React • TypeScript • Tailwind CSS • Context API • Axios • SweetAlert2 • Lucide React

## 🚀 ติดตั้ง

```bash
git clone https://github.com/Kroekkan/Project-RoomSystem.git
cd Project-RoomSystem
npm install
```

## ⚙️ Environment Variables

สร้าง `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

เมื่อ Backend Deploy แล้ว ให้เปลี่ยนเป็น URL ของ Backend เช่น

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

> ⚠️ อย่า commit `.env.local` ที่มีข้อมูลจริงขึ้น GitHub

## ▶️ รัน

```bash
npm run dev
```

เปิด `http://localhost:3000`

## 🐳 Docker

```bash
docker build -t roomify-frontend .
docker run -p 3000:3000 roomify-frontend
```

## 🔗 การเชื่อมต่อ

```text
Frontend (Next.js :3000)
          │
          ▼ HTTP API
Backend (NestJS :4000)
          │
          ▼
PostgreSQL
```

Backend Repository:
https://github.com/Kroekkan/Project-RoomSystem-Backend

## 🌐 Deploy

สามารถ Deploy Frontend บน Vercel ได้ โดยตั้งค่า:

```text
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 👥 สิทธิ์
**User:** จองห้อง ดูตาราง ดูประวัติ และยกเลิกการจอง

**Admin:** จัดการห้อง ผู้ใช้งาน การจอง และประชาสัมพันธ์

## 👨‍💻 ผู้พัฒนา
**Kroekkan**
