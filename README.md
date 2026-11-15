# Digital Signage Control Panel — MVP

Aplikasi Digital Signage Control Panel untuk mengelola perangkat signage, mengelola konten, menetapkan konten aktif ke perangkat, dan mengirim pembaruan konten secara real-time via Socket.IO, baik melalui Web Browser maupun Aplikasi Desktop Native (Electron.js), dilengkapi dengan sistem Autentikasi Admin berbasis JSON Web Token (JWT).

---

## Arsitektur Sistem

```text
Admin Dashboard (Next.js / Electron) ──▶ REST API (Express) ──▶ Supabase PostgreSQL
[Protected via JWT Auth]                       │
                                          Socket.IO
                                               ▼
                                 Signage Player (/player/[deviceId])
                                     (Web / Desktop Kiosk)
                                     [Public Screen Access]
```

- **Frontend (Web):** Next.js (App Router), Tailwind CSS v4, TypeScript
- **Desktop (Electron):** Electron.js, Electron Builder
- **Backend (Server):** Node.js, Express, Socket.IO, JWT, Bcrypt, TypeScript
- **Database:** Supabase PostgreSQL

---

## 🔐 Autentikasi Admin (JWT)

Akses dashboard admin dilindungi dengan token JWT:

1. **Halaman Login:** `/login`
2. **Kredensial Default:**
   - **Username:** `admin`
   - **Password:** `admin123`
3. **Mekanisme Keamanan:**
   - Endpoint login: `POST /api/auth/login` menghasilkan token JWT dengan masa berlaku 7 hari.
   - Endpoint verifikasi: `GET /api/auth/me` memeriksa validitas sesi token.
   - Seluruh endpoint manajemen perangkat dan konten dilindungi oleh `authMiddleware`.
   - Layar player (`/player/[deviceId]`) dan endpoint `/api/devices/:id/current-content` tetap dapat diakses publik agar perangkat display signage dapat langsung beroperasi tanpa login.
   - Tersedia tombol **Keluar (Logout)** di navigasi atas yang membersihkan sesi dan mengarahkan kembali ke `/login`.

---

## 📁 Struktur Direktori

```text
signage-control-panel/
├── app/                  # Next.js App Router (Dashboard, Devices, Contents, Login, Player)
├── components/           # UI Components (AuthGuard, Navbar, Player Renderers, Dialogs)
├── electron/             # Electron.js Main Process & Preload Script
│   ├── main.js           # Desktop window, kiosk mode & menu navigation
│   └── preload.js        # IPC context bridge
├── lib/                  # Client utilities, Auth helper, & Socket hooks
├── public/               # Static assets
├── server/               # Express + Socket.IO Server
│   ├── src/
│   │   ├── config/       # Environment & server config (termasuk JWT secret)
│   │   ├── controllers/  # Route controllers (Auth, Device, Content)
│   │   ├── db/           # Skema database (schema.sql termasuk tabel admins)
│   │   ├── lib/          # Supabase client & utilities
│   │   ├── middleware/   # Auth middleware, Error handling, Request logging
│   │   ├── routes/       # API endpoints (/api/auth, /api/devices, etc.)
│   │   ├── services/     # Business logic & Auth JWT service
│   │   ├── socket/       # Socket.IO initialization & room handlers
│   │   ├── types/        # Shared domain, event & auth types
│   │   └── index.ts      # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── dist-electron/        # Output build Electron (.app & .dmg installer)
├── .env.example          # Frontend environment example
└── package.json
```

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
# Install dependency frontend & Electron
npm install

# Install dependency backend
cd server && npm install && cd ..
```

### 4. Menjalankan Server Pengembangan

#### Opsi A: Web Browser Mode
Jalankan kedua server sekaligus dari root:
```bash
npm run dev
```
- Login Admin: http://localhost:3000/login
- Dashboard Admin: http://localhost:3000/dashboard (Otomatis redirect ke `/login` jika belum masuk)
- Backend API & Socket: http://localhost:3001

#### Opsi B: Electron Desktop Mode
Jalankan Next.js, Express, dan Electron sekaligus secara otomatis:
```bash
npm run electron:dev
```
Aplikasi desktop Electron akan otomatis terbuka dan memuat dashboard/login begitu server siap.

Jika server Next.js dan Express sudah berjalan terpisah, Anda cukup menjalankan:
```bash
npm run electron
```

---

## Fitur Desktop Electron.js

Aplikasi Electron dilengkapi fitur khusus untuk Digital Signage:

1. **Kiosk & Fullscreen Mode:**
   - Tekan tombol `F11` untuk beralih antara mode window standar dan Kiosk / Fullscreen tanpa border/titlebar.
2. **Dedicated Signage Player Flag:**
   - Jalankan langsung sebagai layar signage mandiri tanpa perlu login:
     ```bash
     npx electron . --player=SIGN-001 --kiosk
     ```
3. **Menu Navigasi Native:**
   - `Cmd/Ctrl + 1`: Buka Dashboard Admin
   - `Cmd/Ctrl + 2`: Buka Daftar Perangkat
   - `Cmd/Ctrl + 3`: Buka Daftar Konten
   - Navigasi cepat langsung ke layar player `SIGN-001`, `SIGN-002`, atau `SIGN-003`.
4. **Auto-Reconnect & Server Polling:**
   - Apabila server sedang booting atau belum aktif, jendela desktop menampilkan status tunggu dan secara otomatis me-refresh begitu server online.

---

## Build Aplikasi Desktop (Electron)

Untuk menghasilkan binary aplikasi desktop yang siap didistribusikan:

### 1. Build Standalone App (.app)
```bash
npm run build:electron
```
Hasil build berada di:
`dist-electron/mac-arm64/Signage Control Panel.app`

### 2. Build Installer DMG (.dmg)
```bash
npm run dist:electron
```
Hasil paket installer berada di:
`dist-electron/Signage Control Panel-0.1.0-arm64.dmg`
