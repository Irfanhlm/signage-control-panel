# Digital Signage Control Panel — MVP

Aplikasi web Digital Signage Control Panel untuk mengelola perangkat signage, mengelola konten, menetapkan konten aktif ke perangkat, dan mengirim pembaruan konten secara real-time via Socket.IO.

---

## 🏗 Arsitektur Sistem

```text
Admin Dashboard (Next.js) ──▶ REST API (Express) ──▶ Supabase PostgreSQL
                                   │
                              Socket.IO
                                   ▼
                       Signage Player (/player/[deviceId])
```

- **Frontend (Web):** Next.js (App Router), Tailwind CSS v4, TypeScript
- **Backend (Server):** Node.js, Express, Socket.IO, TypeScript
- **Database:** Supabase PostgreSQL

---

## 📁 Struktur Direktori

```text
signage-control-panel/
├── app/                  # Next.js App Router (Dashboard, Devices, Contents, Player)
├── public/               # Static assets
├── server/               # Express + Socket.IO Server
│   ├── src/
│   │   ├── config/       # Environment & server config
│   │   ├── controllers/  # Route controllers
│   │   ├── db/           # Skema database (schema.sql)
│   │   ├── lib/          # Supabase client & utilities
│   │   ├── middleware/   # Error handling, request logging
│   │   ├── routes/       # API endpoints (/api/health, /api/devices, etc.)
│   │   ├── scripts/      # Script pengujian koneksi database
│   │   ├── socket/       # Socket.IO initialization & room handlers
│   │   ├── types/        # Shared domain & event types (termasuk isUuid)
│   │   └── index.ts      # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .env.example          # Frontend environment example
└── package.json
```

---


### Uji Koneksi Database
Jalankan perintah berikut di terminal:
```bash
npm run test:db
```
Jika sukses, terminal akan menampilkan konfirmasi bahwa tabel `devices` dan `contents` telah terhubung dan siap digunakan!

---

## Cara Menjalankan Project

### 1. Prasyarat
- Node.js >= 20 (Direkomendasikan v22)
- npm >= 10

### 2. Setup Environment Variables
```bash
# Frontend
cp .env.example .env.local

# Backend
cp server/.env.example server/.env
```

### 3. Instalasi Dependency
```bash
# Install dependency frontend
npm install

# Install dependency backend
cd server && npm install && cd ..
```

### 4. Menjalankan Server Pengembangan

Jalankan kedua server sekaligus dari root hanya dengan satu perintah:
```bash
npm run dev
```
Perintah ini akan menjalankan Next.js di port **3000** dan backend Express + Socket.IO di port **3001** secara bersamaan dengan label log berwarna yang jelas.

Atau jika ingin menjalankan secara terpisah:
- Terminal 1 (Backend): `npm run dev:server` (http://localhost:3001)
- Terminal 2 (Frontend): `npm run dev:web` (http://localhost:3000)

---
