# PhongKhamOnline 🏥

> Hệ thống đặt lịch khám bệnh trực tuyến — Đồ án cuối khóa

[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](./backend)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)](./frontend)
[![DB](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen)](https://www.mongodb.com/atlas)
[![Deploy](https://img.shields.io/badge/Deploy-Render-purple)](https://render.com)

---

## 📋 Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 🔐 **Xác thực** | JWT + HttpOnly Cookie, bcrypt cost 12, Rate Limiting chống Brute-force |
| 🗺️ **Bản đồ** | Tìm phòng khám gần nhất (Haversine), chỉ đường OSRM miễn phí |
| 🗓️ **Đặt lịch** | Gợi ý chuyên khoa từ triệu chứng, chống trùng lịch, hủy lịch luật 24h |
| ⚡ **Real-time** | WebSocket Socket.IO khóa slot tạm thời chống Race Condition |
| 📧 **Email** | Xác nhận đặt lịch + Hủy lịch + Nhắc lịch tự động (Brevo + node-cron) |
| 🤖 **AI Chatbot** | Tư vấn sức khỏe & gợi ý bác sĩ với Gemini 1.5 Flash |
| 👨‍💼 **Admin** | Dashboard thống kê, quản lý toàn bộ lịch hẹn |

---

## 🏗️ Kiến trúc

```
PhongKhamOnline/
├── backend/          # Node.js (ESM) + Express + Socket.IO
│   ├── config/       # Kết nối DB
│   ├── controllers/  # Business logic
│   ├── jobs/         # Cron jobs (nhắc lịch)
│   ├── middlewares/  # Auth guards
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── services/     # Email (Brevo)
│   ├── sockets/      # WebSocket logic
│   ├── validators/   # Zod schemas
│   ├── seed.js       # Khởi tạo dữ liệu mẫu
│   └── server.js     # Entry point
└── frontend/         # Next.js 15 App Router + Tailwind CSS
    └── src/
        ├── app/      # Pages & Layouts
        └── components/
            ├── booking/  # BookingModal (real-time slots)
            ├── chat/     # AI ChatBot
            ├── layout/   # Navbar, Footer, Sidebar
            ├── map/      # Leaflet Map + Routing
            └── ui/       # Design System (Button, Card, Badge...)
```

---

## 🚀 Chạy local

### Yêu cầu
- Node.js >= 18
- MongoDB Atlas (hoặc local MongoDB)

### 1. Clone repo
```bash
git clone https://github.com/manhcuong-contact/PhongKhamOnline.git
cd PhongKhamOnline
```

### 2. Cấu hình Backend
```bash
cd backend
cp .env.example .env
# Điền các giá trị vào .env (xem hướng dẫn bên dưới)
npm install
```

### 3. Cấu hình Frontend
```bash
cd frontend
cp .env.example .env.local
# Chỉnh NEXT_PUBLIC_API_URL nếu backend chạy port khác
npm install
```

### 4. Seed dữ liệu mẫu
```bash
cd backend
npm run seed
# Script sẽ tạo: Admin account, 3 phòng khám, 5 bác sĩ, dữ liệu triệu chứng
```
> **Admin mặc định:** `admin@phongkham.com` / `Admin@123`

### 5. Chạy servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Truy cập: `http://localhost:3000`

---

## ⚙️ Biến môi trường

### Backend (`backend/.env`)

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `PORT` | Port server | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key (≥32 ký tự) | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Refresh token key (≥32 ký tự) | `your-refresh-key` |
| `FRONTEND_URL` | URL frontend (CORS) | `http://localhost:3000` |
| `BREVO_API_KEY` | [Brevo API Key](https://app.brevo.com/settings/keys/api) | `xkeysib-...` |
| `GEMINI_API_KEY` | [Google AI Studio Key](https://aistudio.google.com/app/apikey) | `AIzaSy...` |

### Frontend (`frontend/.env.local`)

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL API Backend | `http://localhost:5000/api` |

---

## ☁️ Deploy lên Render

### Backend Web Service
| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Environment** | Điền toàn bộ biến từ `.env.example` |

### Frontend Web Service
| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Environment** | `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api` |

> ⚠️ **Lưu ý CORS:** Sau khi deploy frontend lên Render, cập nhật `FRONTEND_URL` ở backend thành URL Render của frontend (VD: `https://phongkham-frontend.onrender.com`).

---

## 🧑‍💻 Tech Stack

**Backend:** Node.js (ESM) · Express · MongoDB / Mongoose · Socket.IO · JWT · Zod · Helmet · Brevo · node-cron · Gemini AI

**Frontend:** Next.js 15 (App Router) · Tailwind CSS · React-Leaflet · Leaflet-Routing-Machine · Socket.IO Client

**Infrastructure:** MongoDB Atlas · Render · OpenStreetMap · OSRM (routing, miễn phí)

---

## 👤 Tác giả

**Đồ án cuối khóa — Hệ thống Đặt lịch khám bệnh Online**
