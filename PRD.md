# Product Requirements Document (PRD)

## Digital Signage Control Panel — MVP Demonstration

| Informasi | Detail |
|---|---|
| Produk | Digital Signage Control Panel |
| Dokumen | Product Requirements Document (PRD) |
| Versi | 1.1 — Diselaraskan dengan temuan implementasi |
| Tanggal | 12 November 2026 |
| Status | Siap menjadi acuan implementasi MVP |
| Target platform | Web dashboard dan web-based signage player |

---

## 1. Ringkasan Produk

Digital Signage Control Panel adalah aplikasi web untuk mengelola perangkat digital signage dan konten yang ditampilkan pada setiap perangkat. Admin mengelola data perangkat serta konten melalui dashboard. Setiap signage player menerima konten yang ditujukan kepadanya melalui komunikasi real-time.

MVP ini dibuat untuk demonstrasi menggunakan **satu laptop saja**. Beberapa perangkat signage akan disimulasikan dengan membuka beberapa browser tab/window pada laptop yang sama. Setiap tab player memiliki `deviceId` berbeda, sehingga alur komunikasi dan pembaruan konten dapat diuji seperti beberapa perangkat terpisah.

### Tujuan utama

1. Menyediakan dashboard untuk melihat dan mengelola perangkat signage.
2. Menyediakan pengelolaan konten melalui operasi CRUD.
3. Mengirim pembaruan konten ke perangkat yang tepat secara real-time menggunakan Socket.IO.
4. Menampilkan status perangkat (`online`/`offline`) dan waktu terakhir aktif (`last_seen`).
5. Membuktikan alur end-to-end tanpa memerlukan perangkat signage fisik atau server berbayar.

## 2. Latar Belakang dan Permasalahan

Pengelolaan konten digital signage membutuhkan cara terpusat untuk mengetahui perangkat yang tersedia, mengetahui apakah perangkat sedang terhubung, serta mengubah konten yang ditampilkan tanpa harus mengakses perangkat satu per satu.

MVP ini memvalidasi alur tersebut melalui dashboard admin, REST API, database PostgreSQL, Socket.IO server, dan halaman player berbasis browser.

## 3. Sasaran dan Indikator Keberhasilan

### Sasaran

- Admin dapat membuat, melihat, mengubah, dan menghapus data perangkat.
- Admin dapat membuat, melihat, mengubah, dan menghapus konten.
- Admin dapat memilih satu konten aktif untuk suatu perangkat.
- Player dapat mengambil konten awal dari backend dan menerima pembaruan selanjutnya melalui Socket.IO.
- Dashboard menampilkan status koneksi perangkat dan `last_seen`.
- Seluruh alur demo dapat dijalankan di satu laptop.

### Indikator keberhasilan MVP

MVP dinyatakan berhasil apabila:

1. Data `devices` dan `contents` tersimpan di Supabase PostgreSQL.
2. Seluruh endpoint CRUD perangkat dan konten berfungsi.
3. Minimal tiga player virtual dapat berjalan bersamaan dengan identitas perangkat berbeda.
4. Perubahan konten untuk satu perangkat hanya memperbarui player tujuan, bukan player lain.
5. Status perangkat berubah menjadi `online` saat player terhubung dan menjadi `offline` setelah koneksi terputus/melewati batas timeout.
6. Konten aktif tetap dapat dimuat ulang setelah player melakukan refresh karena relasi konten tersimpan di database.

## 4. Pengguna dan Peran

### 4.1 Admin

Admin menggunakan dashboard untuk:
- melihat ringkasan perangkat;
- mengelola data perangkat;
- mengelola konten;
- memilih dan mengirim konten ke perangkat;
- memantau status dan waktu terakhir aktif perangkat.

### 4.2 Signage Player

Signage Player adalah halaman web yang mewakili satu perangkat signage. Untuk demonstrasi, player dijalankan pada browser tab/window terpisah dan menggunakan `deviceId` yang berbeda.

Player bertugas untuk:
- mengidentifikasi perangkat yang diwakilinya;
- mengambil konten aktif saat halaman dibuka;
- menjaga koneksi Socket.IO;
- mengirim heartbeat;
- menerima dan menampilkan pembaruan konten.

## 5. Ruang Lingkup MVP

### 5.1 Termasuk dalam MVP

- Admin dashboard berbasis Next.js dan Tailwind CSS.
- Halaman daftar, tambah, detail/edit, dan hapus perangkat.
- Halaman daftar, tambah, detail/edit, dan hapus konten.
- Database Supabase PostgreSQL.
- REST API CRUD untuk `devices` dan `contents`.
- Backend Node.js dengan Express dan Socket.IO.
- Penetapan satu konten aktif untuk setiap perangkat.
- Web-based signage player untuk simulasi perangkat.
- Status perangkat `online`/`offline` dan `last_seen`.
- Simulasi minimal tiga perangkat dalam browser pada satu laptop.

### 5.2 Tidak termasuk dalam MVP

- Aplikasi native Android, Android TV, Tizen, webOS, atau Raspberry Pi.
- Upload dan pengelolaan file media skala produksi. Untuk MVP, konten media dapat menggunakan URL yang dapat diakses player.
- Playlist berurutan, jadwal tayang, kalender kampanye, dan aturan waktu tayang.
- Sinkronisasi playback antarperangkat.
- Screenshot/remote control perangkat.
- Analitik impresi, durasi tayang, dan pelaporan penggunaan.
- Multi-tenant atau banyak organisasi.
- Sistem role/permission yang kompleks.
- Infrastruktur high availability, load balancing, dan horizontal scaling.
- Jaminan keamanan dan reliabilitas untuk penggunaan production.

### 5.3 Batasan demonstrasi

- Semua komponen aplikasi berjalan di laptop yang sama, kecuali database Supabase yang dapat menggunakan layanan cloud Free Tier.
- Dashboard dan player dibuka melalui `localhost`.
- Simulasi beberapa player dalam browser membuktikan alur software, bukan kompatibilitas dengan perangkat signage fisik.
- Biaya layanan pihak ketiga mengikuti batas dan kebijakan paket gratis penyedia; gratisnya library Socket.IO tidak berarti hosting atau database selalu gratis.

## 6. Alur Penggunaan Utama

### 6.1 Menambahkan perangkat

1. Admin membuka menu **Devices**.
2. Admin memilih **Add Device**.
3. Admin mengisi nama dan lokasi perangkat.
4. Sistem menyimpan perangkat dengan status awal `offline` dan `last_seen = null`.
5. Perangkat muncul pada daftar dashboard.

### 6.2 Menghubungkan player

1. Admin atau penguji membuka halaman `/player/{deviceId}`.
2. Player mengambil data perangkat dan konten aktif melalui REST API.
3. Player membuat koneksi Socket.IO dengan identitas `deviceId`.
4. Backend memvalidasi bahwa perangkat tersedia, lalu memasukkan socket ke room khusus perangkat.
5. Backend memperbarui status perangkat menjadi `online` dan mengisi `last_seen`.
6. Dashboard menerima pembaruan status secara real-time.

### 6.3 Membuat dan menetapkan konten

1. Admin membuka menu **Contents** dan membuat konten.
2. Admin memilih perangkat dari daftar Devices.
3. Admin memilih konten yang akan ditampilkan pada perangkat tersebut.
4. Frontend mengirim permintaan penetapan konten ke REST API.
5. Backend menyimpan `active_content_id` pada data perangkat.
6. Backend mengirim event `content:updated` hanya ke room perangkat tujuan.
7. Player menerima event dan memperbarui tampilan tanpa refresh.

### 6.4 Memutuskan koneksi player

1. Player menutup tab atau kehilangan koneksi.
2. Backend mendeteksi disconnect atau tidak menerima heartbeat selama batas waktu yang ditentukan.
3. Backend mengubah status perangkat menjadi `offline`.
4. Dashboard memperbarui status dan mempertahankan nilai `last_seen` terakhir.

## 7. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Dashboard menampilkan ringkasan jumlah perangkat, perangkat online, perangkat offline, dan jumlah konten. | Must |
| FR-02 | Admin dapat melihat daftar perangkat beserta nama, lokasi, status, dan `last_seen`. | Must |
| FR-03 | Admin dapat menambah perangkat. | Must |
| FR-04 | Admin dapat melihat detail dan mengubah nama/lokasi perangkat. | Must |
| FR-05 | Admin dapat menghapus perangkat. | Must |
| FR-06 | Admin dapat melihat daftar konten. | Must |
| FR-07 | Admin dapat menambah konten dengan judul, tipe, dan data konten/URL. | Must |
| FR-08 | Admin dapat melihat detail, mengubah, dan menghapus konten. | Must |
| FR-09 | Admin dapat menetapkan satu konten aktif untuk suatu perangkat. | Must |
| FR-10 | Player dapat mengambil konten aktif saat pertama kali dibuka atau setelah refresh. | Must |
| FR-11 | Player menerima pembaruan konten melalui Socket.IO tanpa refresh halaman. | Must |
| FR-12 | Backend mengelola status koneksi dan `last_seen` perangkat. | Must |
| FR-13 | Dashboard menerima perubahan status perangkat secara real-time. | Should |
| FR-14 | UI menampilkan loading, empty, success, dan error state untuk operasi utama. | Should |

## 8. Kebutuhan Non-Fungsional

- **Kemudahan penggunaan:** alur CRUD dan penetapan konten dapat dilakukan dari dashboard tanpa menjalankan perintah database manual.
- **Real-time:** pada lingkungan lokal, perubahan konten ditargetkan terlihat di player tujuan dalam waktu sekitar 2 detik pada kondisi normal.
- **Konsistensi data:** penetapan konten harus disimpan di database sebelum event real-time dikirim.
- **Validasi:** input wajib divalidasi di frontend dan backend.
- **Reliabilitas koneksi:** player mencoba terhubung kembali ketika koneksi Socket.IO terputus.
- **Keamanan dasar:** credential server tidak boleh terekspos ke browser; endpoint dan event harus memvalidasi ID perangkat dan payload.
- **Maintainability:** pemisahan UI, API route/controller, service, database access, dan Socket.IO event handler.
- **Kompatibilitas demo:** berjalan pada browser desktop modern.

## 9. Rancangan Data

Database menggunakan **Supabase PostgreSQL**. Tabel wajib adalah `devices` dan `contents`. Untuk mendukung penetapan konten aktif pada MVP, tabel `devices` mendapat satu kolom tambahan opsional `active_content_id`.

### 9.1 Tabel `devices`

| Kolom | Tipe yang disarankan | Wajib | Keterangan |
|---|---|---:|---|
| `id` | UUID, primary key | Ya | ID unik perangkat; dibuat otomatis via `gen_random_uuid()`. |
| `nama` | TEXT, UNIQUE | Ya | Nama unik perangkat, misalnya `SIGN-001`. Bersifat unik agar pencarian player berbasis kode perangkat bersifat deterministik. |
| `lokasi` | TEXT | Ya | Lokasi perangkat, misalnya `Lobby`. |
| `status` | TEXT | Ya | Nilai `online` atau `offline`; dikelola backend. Default `offline`. |
| `last_seen` | TIMESTAMPTZ | Tidak | Waktu terakhir player mengirim heartbeat/terdeteksi aktif. |
| `active_content_id` | UUID, foreign key | Tidak | Konten aktif saat ini; mengacu ke `contents.id`. |
| `created_at` | TIMESTAMPTZ | Ya | Waktu pembuatan record (UTC). |
| `updated_at` | TIMESTAMPTZ | Ya | Waktu perubahan terakhir (UTC). |

Relasi `active_content_id` mengacu ke `contents.id`. Saat konten dihapus, referensi perangkat diatur menjadi `NULL` (`ON DELETE SET NULL`) agar tidak ada foreign key yang menggantung.

*Resolusi `deviceId`:* Untuk mempermudah demonstrasi lokal, parameter `deviceId` pada URL `/player/[deviceId]`, REST API, maupun Socket.IO auth mendukung pencarian baik berdasarkan UUID `id` maupun nama unik perangkat (`nama`, contoh: `SIGN-001`).

### 9.2 Tabel `contents`

| Kolom | Tipe yang disarankan | Wajib | Keterangan |
|---|---|---:|---|
| `id` | UUID, primary key | Ya | ID unik konten; dibuat otomatis via `gen_random_uuid()`. |
| `judul` | TEXT | Ya | Judul konten. |
| `tipe` | TEXT | Ya | Jenis konten: `text`, `image`, `video`, atau `url`. |
| `payload` | JSONB | Ya | Data konten terstruktur sesuai tipe. Default `{}`. |
| `url` | TEXT | Tidak | URL media/halaman jika tipe konten memerlukannya. |
| `created_at` | TIMESTAMPTZ | Ya | Waktu pembuatan record (UTC). |
| `updated_at` | TIMESTAMPTZ | Ya | Waktu perubahan terakhir (UTC). |

`payload` digunakan untuk data fleksibel, sedangkan `url` merupakan kolom opsional agar URL media mudah diakses. Untuk konten teks, `payload` dapat berisi `{ "text": "..." }`. Untuk image/video, `url` berisi URL asset yang bisa diakses player dan `payload` dapat menyimpan metadata tambahan. Untuk tipe `url`, konten dirender menggunakan `<iframe>`; disarankan menggunakan URL yang mengizinkan embedding agar tidak diblokir oleh kebijakan browser (`X-Frame-Options: DENY`).

### 9.3 Aturan data

- `status` hanya boleh bernilai `online` atau `offline`.
- `last_seen` tidak diubah menjadi `NULL` ketika perangkat offline; nilai terakhir tetap disimpan.
- Status awal perangkat adalah `offline`.
- Satu perangkat hanya memiliki satu konten aktif pada MVP.
- Penghapusan konten yang sedang digunakan membuat `active_content_id` perangkat terkait menjadi `NULL`.
- Gunakan UTC untuk penyimpanan timestamp; tampilkan waktu sesuai zona waktu lokal pada UI.

## 10. REST API

Base URL backend lokal: `http://localhost:3001`.

### 10.1 Devices CRUD

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/devices` | Mengambil seluruh perangkat. |
| POST | `/api/devices` | Membuat perangkat baru. |
| GET | `/api/devices/:id` | Mengambil detail perangkat. |
| PATCH | `/api/devices/:id` | Mengubah nama/lokasi perangkat. |
| DELETE | `/api/devices/:id` | Menghapus perangkat. |

Contoh body `POST /api/devices`:

```json
{
  "nama": "SIGN-001",
  "lokasi": "Lobby"
}
```

### 10.2 Contents CRUD

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/contents` | Mengambil seluruh konten. |
| POST | `/api/contents` | Membuat konten baru. |
| GET | `/api/contents/:id` | Mengambil detail konten. |
| PATCH | `/api/contents/:id` | Mengubah konten. |
| DELETE | `/api/contents/:id` | Menghapus konten. |

Contoh body `POST /api/contents` untuk konten teks:

```json
{
  "judul": "Pengumuman Lobby",
  "tipe": "text",
  "payload": {
    "text": "Selamat datang"
  },
  "url": null
}
```

Contoh body untuk konten gambar:

```json
{
  "judul": "Promo November",
  "tipe": "image",
  "payload": {},
  "url": "https://example.com/promo-november.jpg"
}
```

### 10.3 Penetapan konten ke perangkat

| Method | Endpoint | Fungsi |
|---|---|---|
| PUT | `/api/devices/:id/content` | Menetapkan atau mengganti konten aktif perangkat. |
| GET | `/api/devices/:id/current-content` | Mengambil konten aktif untuk initial load player. |

Contoh body `PUT /api/devices/:id/content`:

```json
{
  "contentId": "UUID-CONTENT"
}
```

Endpoint ini merupakan kebutuhan pendukung agar konten dapat ditautkan ke perangkat. Perubahan harus disimpan dahulu ke database, baru kemudian event Socket.IO dikirim.

### 10.4 Format respons dan error

Gunakan format JSON yang konsisten. Contoh sukses:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed"
}
```

Contoh error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "nama": "Nama perangkat wajib diisi"
  }
}
```

Gunakan HTTP status yang sesuai, antara lain `200`, `201`, `204`, `400`, `404`, dan `500`.

## 11. WebSocket dan Socket.IO

Socket.IO digunakan untuk komunikasi real-time antara backend, dashboard, dan signage player. REST API tetap menjadi jalur utama untuk operasi CRUD dan pengambilan data awal.

### 11.1 Koneksi player

- Player melakukan koneksi ke Socket.IO server dengan `deviceId` pada handshake/auth payload.
- Backend memvalidasi keberadaan perangkat sebelum mengizinkan player bergabung ke room `device:{deviceId}`.
- Dashboard bergabung ke room admin untuk menerima perubahan status perangkat.
- Untuk demonstrasi lokal, autentikasi admin/device dapat dibuat sederhana; pendekatan ini tidak boleh dianggap cukup untuk production publik.

### 11.2 Event yang digunakan

| Arah | Event | Payload/tujuan |
|---|---|---|
| Player → Server | `device:heartbeat` | Memberi tahu bahwa player masih aktif. |
| Server → Player | `content:updated` | Mengirim konten terbaru ke room perangkat terkait. |
| Server → Dashboard | `device:status` | Memberi tahu perubahan status dan `last_seen`. |
| Player → Server | `player:ready` | Opsional: menandakan player siap menerima konten. |

Nama event harus konsisten antara frontend dan backend. Payload event perlu memiliki bentuk yang terdokumentasi dan tervalidasi.

### 11.3 Heartbeat dan status perangkat

Konfigurasi awal yang disarankan:
- Player mengirim heartbeat setiap **10 detik**.
- Perangkat dianggap offline jika tidak ada heartbeat selama **30 detik**.
- Backend memperbarui `last_seen` saat heartbeat diterima.
- Status online/offline ditentukan backend, bukan input manual dari dashboard.
- Ketika ada beberapa socket untuk satu `deviceId`, status tetap `online` selama setidaknya satu koneksi masih aktif.

Nilai interval dan timeout dapat diubah melalui konfigurasi environment.

### 11.4 Aturan pengiriman konten

- Gunakan room `device:{deviceId}` untuk mengisolasi target penerima.
- Jangan menggunakan broadcast global untuk konten yang hanya ditujukan kepada satu perangkat.
- Ambil data konten lengkap dari database setelah assignment berhasil, lalu kirim event ke room target.
- Ketika koneksi terputus dan tersambung kembali, player mengambil ulang konten aktif melalui REST API agar tidak kehilangan pembaruan.

## 12. Halaman dan Navigasi UI

| Halaman | Tujuan | Elemen utama |
|---|---|---|
| `/dashboard` | Ringkasan sistem | Total devices, online, offline, total contents, daftar aktivitas/status. |
| `/devices` | Mengelola perangkat | Tabel nama, lokasi, status, `last_seen`, aksi. |
| `/devices/create` | Membuat perangkat | Form nama dan lokasi. |
| `/contents` | Mengelola konten | Tabel judul, tipe, tanggal dibuat, aksi. |
| `/contents/create` | Membuat konten | Form judul, tipe, payload, URL sesuai tipe. |
| `/player/[deviceId]` | Simulasi layar signage | Tampilan konten aktif, status koneksi sederhana, fallback jika belum ada konten. |

Rute dapat disesuaikan dengan struktur App Router yang dipakai, tetapi fungsi tiap halaman harus tetap tersedia.

## 13. Skenario Demonstrasi

Demonstrasi dilakukan pada satu laptop menggunakan minimal empat tab/window browser:

1. Satu tab untuk Admin Dashboard.
2. Satu tab untuk `/player/{deviceId-1}`.
3. Satu tab untuk `/player/{deviceId-2}`.
4. Satu tab untuk `/player/{deviceId-3}`.

Data contoh:

| ID perangkat | Nama | Lokasi | Konten awal |
|---|---|---|---|
| SIGN-001 | Signage Lobby | Lobby | Promo Produk |
| SIGN-002 | Signage Warehouse | Warehouse | Informasi Operasional |
| SIGN-003 | Signage Meeting | Meeting Room | Jadwal Meeting |

Urutan demo:
1. Buka dashboard dan tunjukkan tiga perangkat.
2. Buka ketiga player dan tunjukkan status berubah menjadi online.
3. Buat atau edit sebuah konten.
4. Tetapkan konten baru ke SIGN-001.
5. Tunjukkan SIGN-001 berubah tanpa refresh.
6. Pastikan SIGN-002 dan SIGN-003 tidak berubah.
7. Tutup tab SIGN-002, lalu tunjukkan statusnya menjadi offline setelah timeout.
8. Buka kembali tab SIGN-002 dan tunjukkan status kembali online serta konten aktif termuat.

## 14. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Database Supabase memiliki tabel `devices` dan `contents` dengan kolom wajib yang telah ditentukan.
- [ ] Data perangkat dapat dibuat, dibaca, diubah, dan dihapus melalui REST API.
- [ ] Data konten dapat dibuat, dibaca, diubah, dan dihapus melalui REST API.
- [ ] Dashboard menampilkan nama, lokasi, status, dan `last_seen` perangkat.
- [ ] Dashboard menampilkan daftar konten dan menyediakan aksi CRUD.
- [ ] Satu konten dapat ditetapkan ke satu perangkat dan assignment tersimpan di database.
- [ ] Player mengambil konten aktif saat pertama kali dibuka.
- [ ] Ketika konten perangkat diubah, player target menerima pembaruan melalui Socket.IO tanpa refresh.
- [ ] Player lain tidak menerima perubahan yang tidak ditujukan kepadanya.
- [ ] Player yang aktif mengirim heartbeat dan memperbarui `last_seen`.
- [ ] Perangkat yang tidak lagi mengirim heartbeat berubah menjadi offline setelah timeout.
- [ ] Player dapat reconnect dan mengambil ulang konten aktif.
- [ ] Tiga player virtual dapat didemonstrasikan bersamaan pada satu laptop.

## 15. Asumsi, Risiko, dan Mitigasi

| Topik | Asumsi/Risiko | Mitigasi |
|---|---|---|
| Perangkat fisik | Tidak tersedia perangkat signage tambahan. | Simulasikan setiap perangkat melalui browser tab/window dengan `deviceId` berbeda. |
| Hosting | Demo tidak membutuhkan backend yang dapat diakses publik. | Jalankan Next.js dan Socket.IO secara lokal; gunakan Supabase Free Tier untuk database bila sesuai batas paket. |
| Socket.IO | Koneksi dapat terputus atau player refresh. | Aktifkan reconnect dan ambil ulang konten aktif melalui REST API. |
| Status perangkat | Browser bisa sleep atau laptop kehilangan jaringan. | Gunakan heartbeat dan timeout, serta jelaskan bahwa status adalah estimasi konektivitas player. |
| URL media | URL bisa tidak valid atau tidak dapat diakses. | Validasi URL dan tampilkan fallback/error state pada player. |
| Keamanan | MVP tanpa autentikasi penuh berisiko jika endpoint diekspos ke internet. | Batasi demo ke localhost; jangan membuka tunnel publik tanpa menambahkan autentikasi dan validasi yang memadai. |
| Kapasitas | Simulasi tiga player bukan uji beban. | Batasi klaim pada validasi fungsional MVP, bukan kapasitas production. |

## 16. Rencana Implementasi Tingkat Tinggi

1. Inisialisasi project Next.js, Tailwind CSS, dan TypeScript.
2. Buat project Supabase dan schema tabel.
3. Bangun backend Node.js/Express dan koneksi Supabase.
4. Implementasikan REST API CRUD devices dan contents.
5. Implementasikan Socket.IO, room per perangkat, heartbeat, dan status.
6. Bangun halaman dashboard, devices, dan contents.
7. Bangun halaman player dinamis berdasarkan `deviceId`.
8. Integrasikan assignment konten dan event real-time.
9. Jalankan acceptance test dengan tiga player virtual.
10. Rapikan dokumentasi setup dan skenario demonstrasi.

## 17. Definisi Selesai (Definition of Done)

MVP dianggap selesai ketika semua kriteria penerimaan pada Bagian 14 terpenuhi, project dapat dijalankan mengikuti dokumentasi setup, dan skenario demonstrasi pada Bagian 13 dapat diulang dari awal tanpa manipulasi database manual.
