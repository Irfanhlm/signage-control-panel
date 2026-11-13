# Project Context — Digital Signage Control Panel

Dokumen ini menjadi konteks teknis dan pedoman implementasi untuk developer maupun coding agent yang mengerjakan Digital Signage Control Panel MVP.

**Dokumen kebutuhan produk:** [`PRD.md`](./PRD.md)  
**Versi konteks:** 1.2 — Diselaraskan dengan temuan implementasi  
**Tanggal:** 12 November 2026  
**Status:** Keputusan arsitektur & kontrak data MVP disempurnakan

---

## 1. Ringkasan Proyek

Bangun aplikasi web **Digital Signage Control Panel** untuk mengelola perangkat signage, mengelola konten, menetapkan konten aktif ke perangkat, dan mengirim pembaruan konten secara real-time.

Target demonstrasi adalah **satu laptop tanpa perangkat tambahan**. Beberapa perangkat signage disimulasikan melalui beberapa browser tab/window yang membuka halaman player dengan `deviceId` berbeda. Gunakan minimal tiga player virtual untuk demonstrasi.

Tujuan MVP adalah membuktikan alur end-to-end berikut:

`Admin Dashboard → REST API → Supabase PostgreSQL → Socket.IO → Signage Player`

MVP tidak ditujukan untuk langsung menjadi sistem production berskala besar. Prioritaskan implementasi yang mudah dijalankan, mudah diuji, dan cukup rapi untuk dikembangkan lebih lanjut.

## 2. Requirement yang Tidak Boleh Hilang

1. Database menggunakan Supabase PostgreSQL.
2. Tabel `devices` minimal memiliki `id`, `nama`, `lokasi`, `status`, dan `last_seen`.
3. Tabel `contents` minimal memiliki `id`, `judul`, `tipe`, `payload` dan/atau `url`, serta `created_at`.
4. REST API menyediakan CRUD untuk `devices` dan `contents`.
5. Tersedia backend Node.js dengan Express dan Socket.IO.
6. Dashboard dapat menampilkan status perangkat dan waktu terakhir aktif.
7. Admin dapat menetapkan satu konten aktif ke perangkat tertentu.
8. Player hanya menerima pembaruan konten yang ditujukan kepada perangkatnya.
9. Demo dapat dijalankan hanya dengan satu laptop, menggunakan minimal tiga player virtual.

**Sumber kebenaran:** `PRD.md` adalah acuan utama untuk cakupan produk, rincian acceptance criteria, skema data, endpoint, dan kebutuhan fungsional. Jika ada perbedaan, ikuti PRD kecuali ada keputusan proyek yang lebih baru dan eksplisit.

## 3. Keputusan Arsitektur Final

### 3.1 Satu repository, dua aplikasi

Gunakan **monorepo sederhana**: satu repository Git untuk seluruh proyek, tetapi frontend dan backend tetap menjadi dua aplikasi dengan package, konfigurasi, dan proses server masing-masing.

- `apps/web`: Next.js untuk Admin Dashboard dan Signage Player.
- `apps/server`: Node.js + Express + Socket.IO untuk REST API dan komunikasi real-time.
- `docs`: dokumentasi proyek, termasuk `PRD.md` dan `context.md`.

Jangan menggabungkan Express dan Socket.IO ke custom server Next.js untuk MVP ini. Jangan pula membuat dua repository Git terpisah kecuali diminta secara eksplisit.

### 3.2 Stack teknologi

| Area | Keputusan | Tanggung jawab |
|---|---|---|
| Frontend | Next.js + TypeScript | Dashboard admin dan halaman player |
| Styling | Tailwind CSS | Styling antarmuka |
| Backend | Node.js + Express + TypeScript | REST API, validasi, business logic |
| Real-time | Socket.IO | Koneksi player, room, heartbeat, dan event |
| Database | Supabase PostgreSQL | Penyimpanan perangkat dan konten |
| Local orchestration | `concurrently` | Menjalankan frontend dan backend dari root |
| Demo player | Browser tab/window | Simulasi perangkat signage |

### 3.3 Prinsip pemisahan tanggung jawab

- Next.js menangani UI dan interaksi pengguna. Frontend memanggil backend melalui REST API dan Socket.IO client.
- Express menangani seluruh endpoint REST API.
- Socket.IO server berjalan pada proses Node.js/Express yang sama di `apps/server`.
- Backend menjadi satu-satunya komponen yang menggunakan Supabase service-role key.
- Supabase PostgreSQL menjadi penyimpanan persisten untuk data perangkat dan konten.
- REST API digunakan untuk CRUD dan mengambil data awal/current content.
- Socket.IO digunakan untuk notifikasi dan pembaruan real-time, bukan menggantikan seluruh REST API.
- Player tidak menentukan status online/offline sendiri; backend yang menentukan status berdasarkan koneksi dan heartbeat.
- Jangan menambahkan Supabase Realtime untuk fungsi yang sama dengan Socket.IO pada MVP. Gunakan satu mekanisme real-time agar mudah dipahami dan diuji.

## 4. Struktur Repository Final

Gunakan struktur berikut sebagai target. Bila repository telah memiliki struktur yang berjalan, periksa terlebih dahulu dan lakukan perubahan seperlunya; jangan memindahkan atau menghapus file secara membabi buta.

```text
signage-control-panel/
├── apps/
│   ├── web/                              # Next.js frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── devices/
│   │   │   │   ├── contents/
│   │   │   │   └── player/
│   │   │   │       └── [deviceId]/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   └── socket.ts
│   │   │   ├── lib/
│   │   │   └── types/
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── server/                            # Express + Socket.IO backend
│       ├── src/
│       │   ├── config/
│       │   │   └── supabase.ts
│       │   ├── routes/
│       │   │   ├── device.routes.ts
│       │   │   └── content.routes.ts
│       │   ├── controllers/
│       │   │   ├── device.controller.ts
│       │   │   └── content.controller.ts
│       │   ├── services/
│       │   │   ├── device.service.ts
│       │   │   └── content.service.ts
│       │   ├── middleware/
│       │   ├── socket/
│       │   │   └── index.ts
│       │   ├── lib/
│       │   ├── types/
│       │   └── index.ts
│       ├── .env
│       └── package.json
│
├── docs/
│   ├── PRD.md
│   └── context.md
├── package.json                         # Root scripts / concurrently
├── .gitignore
└── README.md
```

Catatan:
- `apps/web` dan `apps/server` masing-masing memiliki `package.json` dan dependency sendiri.
- Root `package.json` hanya mengelola perintah proyek bersama dan dependency orchestration seperti `concurrently`.
- Untuk mempercepat MVP, tidak wajib mengadopsi konfigurasi npm workspaces, Turborepo, atau Nx.
- Hindari duplikasi tipe data yang tidak perlu. Jika kontrak API mulai berkembang, tipe bersama boleh dipindahkan ke package `packages/shared` pada tahap berikutnya; jangan menambahkannya sebelum benar-benar dibutuhkan.

## 5. Menjalankan Aplikasi

### 5.1 Root `package.json`

Gunakan script root agar kedua aplikasi dapat dijalankan dengan satu perintah. Contoh:

```json
{
  "name": "signage-control-panel",
  "private": true,
  "scripts": {
    "dev": "concurrently -k -n WEB,SERVER -c blue,green \"npm:dev:web\" \"npm:dev:server\"",
    "dev:web": "npm run dev --prefix apps/web",
    "dev:server": "npm run dev --prefix apps/server",
    "build:web": "npm run build --prefix apps/web",
    "build:server": "npm run build --prefix apps/server"
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

Versi dependency boleh mengikuti versi stabil yang kompatibel ketika project dibuat; jangan menurunkan versi tanpa alasan.

### 5.2 Instalasi dependency

Jalankan dari root repository:

```bash
# Dependency untuk script root
npm install

# Dependency Next.js
npm install --prefix apps/web

# Dependency Express + Socket.IO
npm install --prefix apps/server
```

Pastikan `apps/web/package.json` memiliki script `dev` (umumnya `next dev`) dan `apps/server/package.json` memiliki script `dev` yang menjalankan TypeScript backend dengan mekanisme development yang dipilih (misalnya `tsx watch src/index.ts`).

Setelah instalasi awal, jalankan keduanya dari root:

```bash
npm run dev
```

URL lokal:

- Next.js: `http://localhost:3000`
- Express REST API dan Socket.IO: `http://localhost:3001`
- Player contoh: `http://localhost:3000/player/<deviceId>`

Untuk menjalankan satu aplikasi saja:

```bash
npm run dev:web
npm run dev:server
```

Jangan menjalankan dua proses Next.js atau dua proses backend pada port yang sama.

## 6. Arsitektur Runtime dan Alur Data

### 6.1 Komponen runtime

| Komponen | URL/Port contoh | Tanggung jawab |
|---|---|---|
| Next.js | `http://localhost:3000` | Admin UI dan player UI |
| Express + Socket.IO | `http://localhost:3001` | REST API dan koneksi real-time |
| Supabase | Project URL | PostgreSQL cloud database |

Gunakan environment variable untuk URL dan port. Jangan hardcode alamat backend di banyak file.

### 6.2 Alur initial load player

1. Browser membuka `/player/{deviceId}`. Nilai `deviceId` dapat berupa UUID perangkat maupun nama unik perangkat (misal `SIGN-001`).
2. Player meminta detail perangkat dan current content melalui REST API (`GET /api/devices/:id/current-content`). Backend mendukung resolusi parameter berdasarkan UUID atau kolom `nama`.
3. Player membuat koneksi Socket.IO dengan identitas `deviceId` pada `auth` payload.
4. Backend memvalidasi keberadaan perangkat sebelum memasukkan socket ke room `device:{resolvedDeviceId}`.
5. Backend menandai perangkat `online` dan memperbarui `last_seen`.
6. Player menampilkan konten dari REST API.
7. Player mengirim heartbeat secara berkala.

Atur urutan implementasi agar player tidak kehilangan pembaruan saat initial load. Setelah Socket.IO tersambung, player sebaiknya melakukan fetch current content lagi atau memastikan sinkronisasi state melalui mekanisme yang konsisten.

### 6.3 Alur update konten

1. Admin memilih perangkat dan konten pada dashboard.
2. Frontend mengirim `PUT /api/devices/:id/content` dengan payload `{ "contentId": "<uuid> | null" }`. Mengirim `null` digunakan untuk mencabut/mengosongkan konten aktif.
3. Backend memvalidasi perangkat dan konten (jika `contentId` tidak null).
4. Backend memperbarui `devices.active_content_id` di Supabase.
5. Backend mengambil data konten yang telah ditetapkan (atau `null` jika unassign).
6. Backend mengirim event `content:updated` hanya ke room `device:{deviceId}`.
7. Player target memperbarui tampilan tanpa refresh (menampilkan konten baru atau fallback/empty state jika dicabut).
8. Player lain tidak menerima event perubahan tersebut.

**Aturan penting:** simpan assignment ke database sebelum mengirim event. Dengan demikian, konten aktif tetap benar setelah player refresh atau reconnect.

## 7. Model Data dan Aturan

### 7.1 Tabel `devices`

Kolom wajib:

- `id` — UUID primary key, dibuat otomatis via `gen_random_uuid()`.
- `nama` — TEXT UNIQUE, nama perangkat unik, contoh `SIGN-001`. Bersifat unik agar pencarian player berbasis kode perangkat bersifat deterministik.
- `lokasi` — TEXT, lokasi perangkat, contoh `Lobby`.
- `status` — TEXT, hanya `online` atau `offline`, default `offline`.
- `last_seen` — TIMESTAMPTZ nullable, heartbeat/aktivitas terakhir.

Kolom tambahan yang direkomendasikan untuk MVP:

- `active_content_id` — UUID nullable, foreign key ke `contents.id`.
- `created_at` — TIMESTAMPTZ, default UTC now.
- `updated_at` — TIMESTAMPTZ, default UTC now.

Kolom `lokasi` harus tetap ada di database, API, form, dan tabel dashboard.

### 7.2 Tabel `contents`

Kolom wajib:

- `id` — UUID primary key, dibuat otomatis via `gen_random_uuid()`.
- `judul` — TEXT.
- `tipe` — TEXT, nilai valid: `'text'`, `'image'`, `'video'`, `'url'`.
- `payload` — JSONB, default `{}`.
- `url` — TEXT nullable untuk URL media/halaman.
- `created_at` — TIMESTAMPTZ, default UTC now.

Kolom tambahan yang direkomendasikan:

- `updated_at` — TIMESTAMPTZ, default UTC now.

### 7.3 Tipe konten MVP

Mulai dari tipe berikut:

- `text`: tampilkan teks dari `payload.text`.
- `image`: tampilkan gambar dari `url`.
- `video`: tampilkan video dari `url`.
- `url`: tampilkan halaman eksternal di dalam `<iframe>`. Catatan: gunakan URL yang mengizinkan framing/embedding (misal embed URL, Wikipedia, file statis lokal) untuk menghindari pemblokiran browser karena proteksi `X-Frame-Options: DENY`.

Gunakan URL media yang dapat diakses browser untuk MVP. Upload media/storage khusus bukan prioritas awal.

### 7.4 Aturan relasi dan penghapusan

- `devices.active_content_id` mengacu ke `contents.id`.
- Jika konten aktif dihapus, foreign key menggunakan perilaku `ON DELETE SET NULL`.
- Backend perlu memberi tahu player terkait bahwa tidak ada konten aktif lagi (`content:updated` dengan payload `null`), sehingga player menampilkan empty state.
- Satu perangkat hanya memiliki satu konten aktif pada MVP. Playlist dan jadwal tayang berada di luar scope.

### 7.5 Status perangkat dan heartbeat

- Status awal perangkat adalah `offline`.
- Player mengirim heartbeat setiap 10 detik (`device:heartbeat`).
- Jika tidak ada heartbeat selama 30 detik, perangkat dinyatakan `offline`.
- `last_seen` menyimpan waktu terakhir perangkat terlihat dan tidak dikosongkan ketika perangkat offline.
- Backend menjadi satu-satunya sumber kebenaran status:
  - Backend memelihara in-memory registry koneksi aktif (`Map<deviceId, Set<socketId>>`).
  - Jika beberapa socket menggunakan `deviceId` yang sama, perangkat tetap `online` selama masih ada minimal 1 socket aktif.
  - Saat satu socket disconnect, backend menghapus socket ID tersebut. Jika tidak ada lagi socket aktif untuk device terkait, perangkat dapat segera dinyatakan offline atau menunggu timeout.
  - Backend menjalankan *background timer sweeper* berkala (setiap 10 detik) untuk memeriksa perangkat yang `(now - last_seen) > 30 detik`, memperbarui status menjadi `offline` di Supabase, dan mengirim event `device:status` ke dashboard.
- Simpan timestamp dalam UTC dan format ke waktu lokal pada UI.
- Interval heartbeat dan offline timeout dikonfigurasikan melalui environment variable (`HEARTBEAT_INTERVAL_MS` dan `DEVICE_OFFLINE_TIMEOUT_MS`).

## 8. Kontrak REST API

Base URL contoh: `http://localhost:3001`.

### 8.1 Devices

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/devices` | Mengambil daftar perangkat |
| POST | `/api/devices` | Membuat perangkat |
| GET | `/api/devices/:id` | Mengambil detail perangkat |
| PATCH | `/api/devices/:id` | Mengubah nama/lokasi perangkat |
| DELETE | `/api/devices/:id` | Menghapus perangkat |

Contoh body pembuatan:

```json
{
  "nama": "SIGN-001",
  "lokasi": "Lobby"
}
```

`status`, `last_seen`, dan `active_content_id` tidak boleh diubah langsung melalui form CRUD perangkat biasa. Field tersebut dikelola melalui alur backend yang sesuai.

### 8.2 Contents

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/contents` | Mengambil daftar konten |
| POST | `/api/contents` | Membuat konten |
| GET | `/api/contents/:id` | Mengambil detail konten |
| PATCH | `/api/contents/:id` | Mengubah konten |
| DELETE | `/api/contents/:id` | Menghapus konten |

Contoh konten teks:

```json
{
  "judul": "Pengumuman Lobby",
  "tipe": "text",
  "payload": { "text": "Selamat datang" },
  "url": null
}
```

### 8.3 Player dan assignment

| Method | Endpoint | Fungsi |
|---|---|---|
| PUT | `/api/devices/:id/content` | Menetapkan atau mencabut konten aktif perangkat |
| GET | `/api/devices/:id/current-content` | Mengambil konten aktif player (mendukung lookup UUID atau nama perangkat) |

Contoh body assignment:

```json
{
  "contentId": "<content-uuid-atau-null>"
}
```

*Catatan:* `contentId` dapat bernilai `null` untuk mencabut konten aktif (unassign). Parameter `:id` pada URL mendukung pencarian baik dengan UUID asli maupun nama unik perangkat (misal `SIGN-001`).

Gunakan HTTP status yang sesuai, validasi seluruh input di backend, dan bentuk JSON response/error yang konsisten. ID yang tidak ditemukan harus menghasilkan `404`; payload tidak valid harus menghasilkan `400` atau status validasi yang konsisten.

## 9. Kontrak Socket.IO

### 9.1 Koneksi dan identitas

Player menghubungkan Socket.IO client ke backend dengan identitas perangkat, misalnya:

```typescript
const socket = io(SOCKET_URL, {
  auth: { deviceId },
});
```

Backend harus memvalidasi `deviceId` sebelum menerima player ke room. Jangan mempercayai ID yang dikirim client tanpa pemeriksaan database.

### 9.2 Rooms

- Player: `device:{deviceId}`.
- Dashboard/admin: room `admin` atau mekanisme broadcast status yang setara.

### 9.3 Event minimum

| Event | Arah | Tujuan |
|---|---|---|
| `device:heartbeat` | Player → Server | Memperbarui `last_seen` dan status online |
| `content:updated` | Server → Player | Mengirim informasi konten baru ke player target |
| `device:status` | Server → Dashboard | Memperbarui status device pada dashboard |
| `player:ready` | Player → Server | Opsional: menandai player siap |

Gunakan room target ketika mengirim konten:

```typescript
io.to(`device:${deviceId}`).emit("content:updated", {
  deviceId,
  contentId,
  content,
});
```

Jangan menggunakan `io.emit()` untuk konten spesifik perangkat karena event dapat diterima semua player yang terhubung.

### 9.4 Reconnect

Ketika Socket.IO reconnect:

1. Player membangun ulang koneksi.
2. Backend memvalidasi ulang device dan memasukkan socket ke room.
3. Player mengambil ulang current content melalui REST API.
4. Heartbeat dilanjutkan.

Jangan mengandalkan event yang mungkin terlewat saat koneksi terputus.

## 10. Environment Variables dan Keamanan

Buat `.env.example` sebagai template tanpa secret asli.

### 10.1 `apps/web/.env.local`

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 10.2 `apps/server/.env`

```dotenv
PORT=3001
WEB_ORIGIN=http://localhost:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
HEARTBEAT_INTERVAL_MS=10000
DEVICE_OFFLINE_TIMEOUT_MS=30000
```

Aturan keamanan:

- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan backend dan **tidak boleh** memiliki prefix `NEXT_PUBLIC_`.
- Jangan commit `.env`, `.env.local`, token, atau credential ke Git.
- Frontend tidak boleh menggunakan service-role key atau mengakses database memakai credential privileged.
- Konfigurasikan CORS backend agar hanya mengizinkan origin frontend yang dibutuhkan untuk demo.
- Validasi payload REST API dan event Socket.IO di backend.
- Jangan mengekspos backend lokal melalui tunnel publik tanpa memahami risiko dan menambahkan autentikasi/pembatasan akses yang memadai.
- Untuk demo lokal, jangan mengklaim sistem sudah siap production atau sudah memiliki autentikasi lengkap jika fitur tersebut belum dibuat.

## 11. UI dan UX Guidelines

- Gunakan dashboard layout yang konsisten: sidebar/top navigation, page title, dan content area.
- Tabel Devices wajib menampilkan **nama, lokasi, status, dan `last_seen`**.
- Bedakan status online/offline dengan badge yang jelas dan teks; jangan hanya mengandalkan warna.
- Sediakan form sederhana untuk tambah/edit device dan content.
- Tampilkan konfirmasi sebelum menghapus data.
- Tampilkan feedback loading, success, empty, dan error state pada operasi utama.
- Player harus memiliki state: loading, device tidak ditemukan, belum ada konten, konten berhasil dimuat, URL/media gagal dimuat, dan koneksi terputus.
- Tampilkan ID/nama device di mode demo agar penguji mengetahui tab yang mewakili perangkat mana.
- Pastikan UI tetap terbaca pada resolusi laptop umum.

## 12. Panduan Implementasi Bertahap

Kerjakan secara bertahap. Selesaikan dan verifikasi satu tahap sebelum melanjutkan.

### Tahap 1 — Repository dan fondasi

- Periksa repository, package manager, dan file yang telah ada.
- Siapkan struktur monorepo `apps/web` dan `apps/server`.
- Siapkan Next.js + TypeScript + Tailwind CSS di `apps/web`.
- Siapkan Express + TypeScript + Socket.IO di `apps/server`.
- Buat root `package.json` dengan script `concurrently` agar `npm run dev` menjalankan keduanya.
- Buat `.gitignore`, `.env.example`, dan README cara instalasi/menjalankan project.

### Tahap 2 — Database

- Buat tabel `devices` dan `contents` sesuai skema pada `server/src/db/schema.sql`.
- Pastikan kolom `nama` pada `devices` bersifat UNIQUE untuk mendukung lookup deterministik via nama (`SIGN-001`).
- Tambahkan `active_content_id` pada `devices` dengan foreign key ke `contents.id` (`ON DELETE SET NULL`).
- Terapkan fungsi trigger `update_updated_at_column()` untuk pembaruan timestamp otomatis.
- Jalankan skrip pengujian koneksi database melalui perintah `npm run test:db`.

### Tahap 3 — REST API

- Implementasikan CRUD devices.
- Implementasikan CRUD contents.
- Implementasikan assignment content ke device.
- Implementasikan endpoint current-content untuk player.
- Tambahkan validasi, error handling, dan response format konsisten.

### Tahap 4 — Socket.IO dan status perangkat

- Implementasikan koneksi dan validasi device.
- Implementasikan room per device dan room/admin channel untuk dashboard.
- Implementasikan heartbeat dan offline timeout.
- Implementasikan event `content:updated` dan `device:status`.
- Pastikan konten hanya dikirim ke player target.

### Tahap 5 — Frontend Admin

- Implementasikan dashboard ringkasan.
- Implementasikan halaman dan form CRUD devices.
- Implementasikan halaman dan form CRUD contents.
- Implementasikan UI untuk memilih konten aktif per device.
- Hubungkan data status real-time dari Socket.IO.

### Tahap 6 — Signage Player

- Implementasikan route `/player/[deviceId]`.
- Fetch detail device dan konten aktif saat load.
- Hubungkan Socket.IO dan heartbeat.
- Render konten berdasarkan `tipe`.
- Implementasikan reconnect, fetch ulang current content, dan fallback state.

### Tahap 7 — Verifikasi demonstrasi

- Buat minimal tiga device contoh.
- Jalankan `npm run dev` dari root.
- Buka satu Admin Dashboard dan tiga player tab/window.
- Tetapkan konten ke setiap player secara bergantian.
- Verifikasi hanya player target yang berubah.
- Uji refresh, disconnect, offline timeout, dan reconnect.

## 13. Test Checklist

### Repository dan runtime

- [x] Dependency root, web, dan server dapat di-install.
- [x] `npm run dev` menjalankan Next.js dan backend bersamaan.
- [x] Next.js tersedia di port 3000 dan backend di port 3001.
- [x] Kedua proses menampilkan log yang dapat dibedakan.

### REST API dan database

- [x] Create/list/detail/update/delete device berhasil.
- [x] Field lokasi tersimpan dan ditampilkan.
- [x] Create/list/detail/update/delete content berhasil.
- [x] Data tersimpan di Supabase dan tetap tersedia setelah server restart.
- [x] Request tidak valid menghasilkan error yang jelas.
- [x] ID yang tidak ditemukan menghasilkan `404`.
- [x] Assignment dengan device atau content yang tidak valid ditolak.
- [x] Penghapusan konten aktif menangani referensi perangkat dengan benar.

### Socket.IO

- [x] Player dengan `deviceId` valid dapat terhubung.
- [x] Player dengan `deviceId` tidak valid ditolak.
- [x] Player bergabung ke room perangkat yang benar.
- [x] Heartbeat memperbarui `last_seen`.
- [x] Timeout mengubah status menjadi offline.
- [x] Satu socket disconnect tidak membuat device offline jika socket lain masih aktif.
- [x] Update konten hanya diterima player target.
- [x] Reconnect mengambil ulang konten aktif (diuji pada Tahap 6: Signage Player).

### UI dan demonstrasi

- [x] Dashboard menampilkan jumlah dan status perangkat yang benar.
- [x] Tabel Devices menampilkan nama, lokasi, status, dan `last_seen`.
- [x] CRUD dapat dilakukan dari dashboard.
- [x] Player menampilkan konten awal (Tahap 6).
- [x] Player memperbarui konten tanpa refresh (Tahap 6).
- [x] Tiga player virtual dapat berjalan bersamaan pada satu laptop (Tahap 7).
- [x] Loading, empty, error, dan disconnected state ditangani.
- [x] Tidak ada secret backend di browser bundle atau repository.

## 14. Batasan dan Hal yang Ditunda

- Tidak ada perangkat fisik tambahan; browser tab/window menjadi player virtual.
- Backend berjalan lokal untuk demonstrasi. Supabase dapat menggunakan cloud Free Tier selama kuota dan kebijakannya mencukupi.
- Gratisnya library Socket.IO tidak berarti hosting, database, bandwidth, atau layanan pihak ketiga selalu gratis.
- Tidak ada autentikasi admin/device yang lengkap pada MVP lokal. Jangan mengekspos server tanpa pengamanan.
- Satu perangkat hanya memiliki satu konten aktif; playlist dan jadwal tayang ditunda.
- Upload media/storage khusus belum menjadi prioritas; gunakan URL asset yang dapat diakses player.
- Analitik, remote control, screenshot perangkat, multi-tenant, high availability, dan horizontal scaling berada di luar cakupan MVP.
- Simulasi tiga tab tidak membuktikan performa sistem pada ratusan atau ribuan perangkat fisik.

## 15. Instruksi untuk Coding Agent

Saat melanjutkan implementasi:

1. Baca `PRD.md` dan dokumen ini sebelum mengubah kode.
2. Periksa isi repository, package manager, dependency, dan konvensi yang sudah ada terlebih dahulu.
3. Pertahankan keputusan arsitektur: satu repository dengan `apps/web` dan `apps/server` sebagai dua aplikasi terpisah.
4. Jangan memasukkan Express/Socket.IO ke custom server Next.js untuk MVP ini.
5. Jangan menghapus field `lokasi` dari database, API, form, atau UI Devices.
6. Jangan menghilangkan `last_seen`, status online/offline, CRUD, atau player virtual.
7. Jangan mengganti Socket.IO dengan polling atau Supabase Realtime tanpa perubahan requirement yang eksplisit.
8. Jangan broadcast konten ke semua player; targetkan room perangkat.
9. Simpan assignment konten ke database sebelum emit event.
10. Jangan menaruh secret Supabase di frontend atau repository.
11. Hindari menambah library, framework, abstraction, atau infrastruktur yang tidak dibutuhkan MVP.
12. Prioritaskan alur end-to-end yang berjalan daripada fitur tambahan di luar scope.
13. Setelah tiap tahap, jalankan type-check, lint, build, atau test yang tersedia dan laporkan hanya hal yang benar-benar sudah diverifikasi.
14. Jika menemukan konflik antara struktur saat ini dan rekomendasi dokumen, jelaskan konflik dan pilih perubahan paling kecil yang menjaga requirement.

## 16. Definisi Selesai

MVP siap didemonstrasikan ketika instalasi dan startup terdokumentasi, seluruh fungsi inti berjalan, dan alur berikut berhasil tanpa manipulasi database manual:

`npm run dev → Create devices → Create contents → Open 3 players → Assign content → Real-time update to target player → Disconnect/reconnect → Status and content recover correctly`
