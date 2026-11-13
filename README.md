# Digital Signage Control Panel — MVP

Aplikasi web Digital Signage Control Panel untuk mengelola perangkat signage, mengelola konten, menetapkan konten aktif ke perangkat, dan mengirim pembaruan konten secara real-time via Socket.IO.

Sesuai dengan spesifikasi:
- [`PRD.md`](./PRD.md)
- [`context.md`](./context.md)

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
├── PRD.md                # Product Requirements Document
├── context.md            # Technical context & guidelines
└── package.json
```

---

## 🛠 Panduan Setup Mandiri Supabase (Tahap 2)

Ikuti 4 langkah mudah berikut untuk menyiapkan database Supabase:

### 1. Buat Project Baru di Supabase
1. Kunjungi [database.new](https://database.new) atau login ke [supabase.com](https://supabase.com).
2. Buat Organization (jika belum ada) dan klik **"New project"**.
3. Beri nama project (contoh: `signage-control-panel`), buat password database, dan pilih region terdekat (misal: `Singapore (ap-southeast-1)`).
4. Pilih paket **Free Tier**.

### 2. Eksekusi Skema SQL
1. Buka menu **SQL Editor** pada sidebar kiri dashboard Supabase.
2. Klik **"New query"**.
3. Buka berkas [`server/src/db/schema.sql`](./server/src/db/schema.sql) pada repositori ini, salin seluruh isinya, lalu tempel ke SQL Editor Supabase.
4. Klik tombol **Run** (atau tekan `Ctrl+Enter` / `Cmd+Enter`).
5. Skema tabel `contents` & `devices` beserta data awal demo akan otomatis terbuat.

### 3. Salin API Credentials ke `.env`
1. Buka menu **Project Settings** (ikon gerigi di pojok kiri bawah) → **API**.
2. Salin **Project URL** (contoh: `https://xyzcompany.supabase.co`).
3. Cari bagian **Project API keys**, lalu salin key bertanda **`service_role` (secret)**.
4. Buat atau buka berkas `server/.env` pada project lokal Anda, lalu isi:
   ```dotenv
   PORT=3001
   WEB_ORIGIN=http://localhost:3000
   SUPABASE_URL=https://xyzcompany.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJh... (kunci service_role rahasia Anda)
   HEARTBEAT_INTERVAL_MS=10000
   DEVICE_OFFLINE_TIMEOUT_MS=30000
   ```

### 4. Uji Koneksi Database
Jalankan perintah berikut di terminal:
```bash
npm run test:db
```
Jika sukses, terminal akan menampilkan konfirmasi bahwa tabel `devices` dan `contents` telah terhubung dan siap digunakan!

---

## 🚀 Cara Menjalankan Project

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

#### Terminal 1 — Backend (Express + Socket.IO)
```bash
npm run dev:server
```
Backend berjalan pada: **`http://localhost:3001`**  
Endpoint health check: **`http://localhost:3001/api/health`**

#### Terminal 2 — Frontend (Next.js)
```bash
npm run dev:web
```
Frontend berjalan pada: **`http://localhost:3000`**

---

## 🧪 Skrip Tersedia

Pada root `signage-control-panel`:
- `npm run dev:web` / `npm run dev`: Menjalankan Next.js development server
- `npm run dev:server`: Menjalankan backend server dalam watch mode (`tsx`)
- `npm run test:db`: Menguji koneksi backend ke database Supabase
- `npm run test:api`: Menjalankan suite pengujian otomatis REST API (32 test cases)
- `npm run build`: Membangun production build Next.js
- `npm run build:server`: Mengkompilasi TypeScript backend (`tsc`)
- `npm run start`: Menjalankan production server Next.js
- `npm run start:server`: Menjalankan production backend (`node dist/index.js`)
- `npm run lint`: Menjalankan ESLint
