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

Jalankan kedua server sekaligus dari root hanya dengan satu perintah:
```bash
npm run dev
```
Perintah ini akan menjalankan Next.js di port **3000** dan backend Express + Socket.IO di port **3001** secara bersamaan dengan label log berwarna yang jelas.

Atau jika ingin menjalankan secara terpisah:
- Terminal 1 (Backend): `npm run dev:server` (http://localhost:3001)
- Terminal 2 (Frontend): `npm run dev:web` (http://localhost:3000)

---

## 🖥 Skenario Demonstrasi Multi-Player (Fase 7)

Aplikasi dirancang khusus untuk demonstrasi lengkap pada satu laptop menggunakan tab browser:

1. **Buka Admin Dashboard**:
   - Tab 1: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. **Buka 3 Layar Signage Virtual**:
   - Tab 2 (Layar Lobby): [http://localhost:3000/player/SIGN-001](http://localhost:3000/player/SIGN-001)
   - Tab 3 (Layar Gudang): [http://localhost:3000/player/SIGN-002](http://localhost:3000/player/SIGN-002)
   - Tab 4 (Layar Ruang Meeting): [http://localhost:3000/player/SIGN-003](http://localhost:3000/player/SIGN-003)
3. **Uji Real-Time Assignment**:
   - Pada Dashboard, klik tombol **"Tetapkan Konten"** pada salah satu perangkat (misal `SIGN-001`).
   - Pilih konten teks, gambar, atau video baru.
   - Perhatikan bahwa layar `SIGN-001` langsung terupdate **tanpa refresh halaman**, sedangkan `SIGN-002` dan `SIGN-003` tidak terpengaruh (Room Isolation).
4. **Uji Disconnect & Status**:
   - Tutup Tab `SIGN-002`. Dalam waktu singkat statusnya di Dashboard berubah menjadi `Offline`.
   - Buka kembali Tab `SIGN-002`. Status kembali menjadi `Online` dan konten aktif otomatis tersinkronisasi kembali.

---

## 🧪 Skrip Pengujian

Pada root `signage-control-panel`:
- `npm run dev`: Menjalankan Next.js dan backend server secara bersamaan (`concurrently`)
- `npm run dev:web`: Menjalankan Next.js development server
- `npm run dev:server`: Menjalankan backend server dalam watch mode (`tsx`)
- `npm run test:db`: Menguji koneksi backend ke database Supabase
- `npm run test:api`: Menjalankan suite pengujian REST API (32 test cases)
- `npm run test:socket`: Menjalankan suite pengujian real-time Socket.IO & Heartbeat (13 test cases)
- `npm run test:player`: Menjalankan suite pengujian Signage Player (10 test cases)
- `npm run test:demo`: Menjalankan simulasi demonstrasi multi-player serentak (8 test cases)
- `npm run test:all`: Menjalankan **seluruh pengujian (63 test cases)** secara otomatis
- `npm run build`: Membangun production build Next.js
- `npm run build:server`: Mengkompilasi TypeScript backend (`tsc`)
- `npm run lint`: Menjalankan ESLint (0 errors, 0 warnings)
