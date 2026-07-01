# 📋 Issue Planning — Sistem Manajemen Dokumen Impor v1.0

> **Sumber**: PRD_Sistem_Manajemen_Dokumen_Impor_v1.0.docx  
> **Tech Stack**: Laravel 12 (PHP 8.4) + React 18 + MySQL 8.x  
> **Tanggal**: 29 Juni 2026  
> **Penulis PRD**: Zahran

---

## 🏗️ Milestone 1 — Foundation (Minggu 1–2)

### Issue #1: Project Setup & Konfigurasi Awal
**Priority**: 🔴 High  
**Label**: `setup`, `infrastructure`

**Deskripsi**:
Inisialisasi project Laravel 12 dan React 18. Konfigurasi environment, database connection, dan struktur folder sesuai PRD.

**Tasks**:
- [ ] Inisialisasi project Laravel 12 dengan PHP 8.4
- [ ] Setup React 18 (via Inertia.js atau SPA terpisah)
- [ ] Konfigurasi `.env` (database, mail, storage, queue)
- [ ] Setup MySQL 8.x database
- [ ] Konfigurasi Laravel Storage (local untuk dev, S3-ready untuk production)
- [ ] Setup Laravel Queue driver (database/Redis)
- [ ] Konfigurasi CORS untuk SPA
- [ ] Setup ESLint (React) dan PSR-12 (PHP)
- [ ] Setup Pest/PHPUnit untuk testing backend
- [ ] Setup Vitest untuk testing frontend

**Acceptance Criteria**:
- Project berjalan di local dengan `php artisan serve` dan `npm run dev`
- Koneksi database berhasil
- Queue worker berjalan

---

### Issue #2: Skema Database & Migrations
**Priority**: 🔴 High  
**Label**: `database`, `backend`

**Deskripsi**:
Buat seluruh migration untuk tabel-tabel utama sesuai skema database di PRD Section 5.

**Tasks**:
- [ ] Migration tabel `users` (dengan kolom `role` ENUM: `supplier`, `staff_impor`, `manager_impor`, `admin`)
- [ ] Migration tabel `suppliers` (FK → users)
- [ ] Migration tabel `documents` (FK → suppliers, status ENUM: `submitted`, `staff_processing`, `pending_validation`, `validated`, `rejected`, `archived`)
- [ ] Migration tabel `document_files` (FK → documents, FK → users)
- [ ] Migration tabel `reports` (FK → documents, FK → users)
- [ ] Migration tabel `audit_logs` (FK → documents, FK → users, append-only)
- [ ] Buat database seeder untuk data testing (user per role, sample supplier, sample document)

**Acceptance Criteria**:
- `php artisan migrate` berhasil tanpa error
- Seluruh foreign key constraint aktif (InnoDB)
- Seeder menghasilkan data testing yang valid

---

### Issue #3: Eloquent Models & Relationships
**Priority**: 🔴 High  
**Label**: `backend`, `models`

**Deskripsi**:
Buat Eloquent models dengan relationships, casts, dan fillable sesuai skema database.

**Tasks**:
- [ ] Model `User` — relasi: hasOne Supplier, hasMany Document (as handler), hasMany AuditLog (as actor)
- [ ] Model `Supplier` — relasi: belongsTo User, hasMany Document
- [ ] Model `Document` — relasi: belongsTo Supplier, hasMany DocumentFile, hasMany AuditLog, hasMany Report, belongsTo User (current_handler)
- [ ] Model `DocumentFile` — relasi: belongsTo Document, belongsTo User (uploaded_by)
- [ ] Model `Report` — relasi: belongsTo Document, belongsTo User (created_by), belongsTo User (sent_to)
- [ ] Model `AuditLog` — relasi: belongsTo Document, belongsTo User (actor)
- [ ] Definisikan `$casts` untuk ENUM fields, date fields, dan decimal fields
- [ ] Definisikan `$fillable` / `$guarded` untuk mass assignment protection

**Acceptance Criteria**:
- Semua relationship berfungsi di Tinker
- Model factory tersedia untuk testing

---

### Issue #4: Autentikasi & Laravel Sanctum
**Priority**: 🔴 High  
**Label**: `backend`, `auth`, `security`  
**FR**: FR-16

**Deskripsi**:
Implementasi sistem autentikasi menggunakan Laravel Sanctum untuk SPA authentication (cookie-based) dan token-based API.

**Tasks**:
- [ ] Install dan konfigurasi Laravel Sanctum
- [ ] Buat `POST /api/auth/login` — return token, user, role
- [ ] Buat `POST /api/auth/logout` — revoke token
- [ ] Konfigurasi Sanctum untuk SPA (cookie-based session)
- [ ] Tambahkan CSRF protection untuk form non-API
- [ ] Konfigurasi rate limiting pada endpoint login (misal: 5 attempt per menit)
- [ ] Password hashing menggunakan bcrypt (default Laravel)

**Acceptance Criteria**:
- Login/logout berhasil via API
- Token valid untuk akses endpoint protected
- Rate limiting aktif pada login

---

### Issue #5: Role-Based Access Control (RBAC) & Middleware
**Priority**: 🔴 High  
**Label**: `backend`, `auth`, `middleware`  
**FR**: FR-16

**Deskripsi**:
Implementasi middleware role-based dan policy untuk membatasi akses endpoint sesuai aktor.

**Tasks**:
- [ ] Buat middleware `EnsureRole` — cek role user terhadap role yang diizinkan
- [ ] Registrasi middleware di `bootstrap/app.php` atau `Kernel`
- [ ] Buat `DocumentPolicy` — atur siapa yang bisa view, create, update, delete, archive, validate
- [ ] Terapkan middleware pada route groups:
  - `/api/supplier/*` → role: `supplier`
  - `/api/staff/*` → role: `staff_impor`
  - `/api/manager/*` → role: `manager_impor`
  - `/api/admin/*` → role: `admin`
- [ ] Test unauthorized access mengembalikan 403

**Acceptance Criteria**:
- Supplier tidak bisa akses endpoint Staff/Manager/Admin
- Setiap role hanya bisa akses endpoint yang sesuai
- Policy melindungi resource-level access

---

## 🔄 Milestone 2 — Core Workflow (Minggu 3–5)

### Issue #6: Supplier — Portal Submit Dokumen
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `supplier`  
**FR**: FR-01

**Deskripsi**:
Supplier dapat mengirimkan dokumen impor (PDF/JPG/PNG, maks 10 MB) melalui portal khusus.

**Tasks**:
- [ ] **Backend**: Buat `SupplierDocumentController@store`
  - Endpoint: `POST /api/supplier/documents`
  - Accept: `multipart/form-data`
  - Validasi: file format (pdf, jpg, png), max size 10 MB, MIME type server-side (finfo)
  - Simpan file di luar public directory
  - Buat record di tabel `documents` (status: `submitted`) dan `document_files`
  - Catat di `audit_logs` (action: `submitted`)
- [ ] **Backend**: Buat `FormRequest` untuk validasi input
- [ ] **Frontend**: Buat halaman upload dokumen Supplier
  - Form: upload file (drag & drop), informasi dasar (jenis barang, negara asal, dll)
  - Progress bar upload
  - Feedback sukses/error
- [ ] **Frontend**: Daftar dokumen yang sudah disubmit oleh Supplier (read-only status tracking)

**Acceptance Criteria**:
- File berhasil diupload dan tersimpan di storage
- Validasi MIME type server-side berjalan
- File > 10 MB ditolak dengan pesan error
- Record document dan document_files tersimpan di database
- Audit log tercatat

---

### Issue #7: Staff Impor — Inbox & Terima Dokumen
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `staff`  
**FR**: FR-02, FR-03

**Deskripsi**:
Staff Impor menerima notifikasi dan melihat daftar dokumen baru dari Supplier di dashboard inbox.

**Tasks**:
- [ ] **Backend**: Buat `StaffInboxController@index`
  - Endpoint: `GET /api/staff/inbox`
  - Return dokumen dengan status `submitted` dan `rejected` (yang dikembalikan Manager)
  - Include: relasi supplier, document_files
- [ ] **Backend**: Update status dokumen menjadi `staff_processing` saat Staff membuka
- [ ] **Frontend**: Halaman inbox Staff
  - Tabel dokumen: nomor, supplier, tanggal submit, status, jumlah file
  - Filter: status, tanggal
  - Badge notifikasi untuk dokumen baru
- [ ] **Frontend**: Detail view dokumen — preview file, info supplier, history audit

**Acceptance Criteria**:
- Staff melihat daftar dokumen submitted di inbox
- Klik dokumen mengubah status ke `staff_processing`
- Dokumen rejected dari Manager juga muncul di inbox

---

### Issue #8: Staff Impor — Input Metadata & Kelola Dokumen
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `staff`  
**FR**: FR-03, FR-04

**Deskripsi**:
Staff menginput metadata dokumen impor dan mengelola data dokumen.

**Tasks**:
- [ ] **Backend**: Buat `StaffDocumentController@process`
  - Endpoint: `PUT /api/staff/documents/{id}/process`
  - Input: nomor dokumen, tanggal dokumen, jenis barang, negara asal, nilai barang, currency, catatan
  - Validasi: FormRequest dengan rules explicit
  - Catat perubahan di `audit_logs`
- [ ] **Frontend**: Form input metadata dokumen
  - Fields: nomor dokumen, tanggal, jenis barang, negara asal, nilai barang (IDR/USD), catatan
  - Preview file lampiran (PDF viewer / image viewer)
  - Tombol: Simpan Draft, Teruskan ke Manager
- [ ] **Frontend**: Kemampuan download file lampiran
- [ ] **Frontend**: Tampilkan alasan penolakan jika dokumen dikembalikan dari Manager

**Acceptance Criteria**:
- Metadata tersimpan di tabel `documents`
- Validasi input berjalan (nomor dokumen unik, field required)
- Staff bisa melihat alasan reject dari Manager

---

### Issue #9: Staff Impor — Kirim Dokumen ke Manager
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `staff`  
**FR**: FR-05

**Deskripsi**:
Staff meneruskan dokumen yang sudah diinput metadata-nya ke Manager Impor untuk validasi.

**Tasks**:
- [ ] **Backend**: Buat `StaffDocumentController@forward`
  - Endpoint: `POST /api/staff/documents/{id}/forward`
  - Validasi: dokumen harus berstatus `staff_processing`, metadata harus lengkap
  - Update status → `pending_validation`
  - Set `current_handler_id` ke Manager (atau null, sesuai logika assignment)
  - Catat di `audit_logs` (action: `forwarded`)
  - Trigger notifikasi ke Manager
- [ ] **Frontend**: Konfirmasi dialog sebelum forward
- [ ] **Frontend**: Validasi frontend — pastikan semua metadata terisi sebelum tombol forward aktif

**Acceptance Criteria**:
- Status berubah dari `staff_processing` ke `pending_validation`
- Notifikasi dikirim ke Manager
- Dokumen tanpa metadata lengkap tidak bisa diteruskan

---

### Issue #10: Manager Impor — Queue & Review Dokumen
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `manager`  
**FR**: FR-06

**Deskripsi**:
Manager Impor menerima dan mereview dokumen yang dikirim Staff.

**Tasks**:
- [ ] **Backend**: Buat `ManagerQueueController@index`
  - Endpoint: `GET /api/manager/queue`
  - Return dokumen dengan status `pending_validation`
  - Include: relasi supplier, document_files, metadata lengkap
- [ ] **Frontend**: Halaman queue Manager
  - Tabel dokumen pending: nomor, supplier, tanggal, jenis barang, nilai barang, Staff yang mengirim
  - Detail view: semua metadata, file preview, audit trail
  - Sorting: tanggal submit, nilai barang

**Acceptance Criteria**:
- Manager melihat semua dokumen `pending_validation`
- Detail dokumen lengkap tersedia termasuk file preview

---

### Issue #11: Manager Impor — Validasi Dokumen (Approve/Reject)
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `manager`  
**FR**: FR-07, FR-08

**Deskripsi**:
Manager melakukan validasi: approve jika sesuai, atau reject dengan alasan wajib.

**Tasks**:
- [ ] **Backend**: Buat `ManagerDocumentController@validate`
  - Endpoint: `POST /api/manager/documents/{id}/validate`
  - Input: `{ decision: "approve" | "reject", reason?: string }`
  - Jika approve: status → `validated`, catat audit log
  - Jika reject: status → `rejected`, simpan `rejection_reason`, catat audit log
  - Trigger notifikasi ke Staff (jika reject) atau ke Admin (jika approve)
- [ ] **Backend**: Validasi — `reason` wajib diisi jika `decision = reject`
- [ ] **Frontend**: UI approve/reject
  - Tombol Approve (hijau) dan Reject (merah)
  - Modal reject: textarea alasan penolakan (required)
  - Konfirmasi dialog untuk approve
- [ ] **Frontend**: Setelah approve → redirect ke halaman buat laporan

**Acceptance Criteria**:
- Approve mengubah status ke `validated`
- Reject mengubah status ke `rejected` dengan alasan tersimpan
- Reject tanpa alasan ditolak (422)
- Notifikasi terkirim ke pihak terkait
- Dokumen rejected kembali muncul di inbox Staff

---

### Issue #12: Sistem Notifikasi In-App
**Priority**: 🟡 Medium  
**Label**: `backend`, `frontend`, `notification`  
**FR**: FR-14

**Deskripsi**:
Notifikasi real-time (atau polling) ke setiap aktor saat ada aksi yang memerlukan perhatian.

**Tasks**:
- [ ] **Backend**: Buat tabel `notifications` (atau gunakan Laravel Notification system)
- [ ] **Backend**: Buat Job `SendNotification` (async via Queue)
- [ ] **Backend**: Trigger notifikasi pada events:
  - Supplier submit → notify Staff
  - Staff forward → notify Manager
  - Manager approve → notify Admin
  - Manager reject → notify Staff
  - Manager kirim laporan → notify Admin
- [ ] **Backend**: Endpoint `GET /api/notifications` — list notifikasi user
- [ ] **Backend**: Endpoint `PUT /api/notifications/{id}/read` — tandai sudah dibaca
- [ ] **Frontend**: Bell icon dengan badge count (unread)
- [ ] **Frontend**: Dropdown notifikasi — list terbaru, klik untuk navigate ke dokumen terkait
- [ ] **Frontend**: Polling setiap 30 detik (atau WebSocket jika ada Laravel Echo/Pusher)

**Acceptance Criteria**:
- Notifikasi muncul pada setiap transisi status dokumen
- Badge count akurat
- Klik notifikasi navigate ke dokumen terkait

---

### Issue #13: Audit Trail
**Priority**: 🔴 High  
**Label**: `backend`, `security`, `audit`  
**FR**: FR-15

**Deskripsi**:
Setiap aksi pada dokumen dicatat secara append-only di tabel `audit_logs`.

**Tasks**:
- [ ] **Backend**: Buat service `AuditService` untuk mencatat log
  - Parameter: document_id, actor_id, action, notes
  - Append-only: tidak ada method update/delete
- [ ] **Backend**: Integrasikan AuditService di seluruh controller yang mengubah status dokumen
- [ ] **Backend**: Endpoint `GET /api/documents/{id}/audit-log`
  - Akses: Admin dan Manager
  - Return: list audit log sorted by created_at ASC
- [ ] **Backend**: Pastikan tidak ada endpoint untuk menghapus/mengubah audit log (NFR-08)

**Acceptance Criteria**:
- Setiap perubahan status dokumen tercatat di audit_logs
- Audit log tidak bisa dimodifikasi via API
- Admin/Manager bisa melihat full trail per dokumen

---

## 📊 Milestone 3 — Reporting & Archiving (Minggu 6–7)

### Issue #14: Manager — Buat Laporan (PDF/Excel)
**Priority**: 🟡 Medium  
**Label**: `backend`, `frontend`, `manager`, `reporting`  
**FR**: FR-09

**Deskripsi**:
Manager membuat laporan ringkasan dokumen impor dalam format PDF atau Excel.

**Tasks**:
- [ ] **Backend**: Install library PDF (DomPDF / Snappy) dan Excel (Laravel Excel / Maatwebsite)
- [ ] **Backend**: Buat Job `GenerateReport` (async via Queue)
  - Input: array `document_ids`
  - Generate file PDF/Excel berisi: nomor dokumen, status validasi, tanggal, supplier, nilai barang
  - Simpan file di storage, catat di tabel `reports`
- [ ] **Backend**: Endpoint `POST /api/manager/reports`
  - Input: `{ document_ids: [...], format: "pdf" | "excel" }`
  - Return: `{ report_id, status: "generating" }`
- [ ] **Backend**: Endpoint `GET /api/manager/reports/{id}` — cek status & download URL
- [ ] **Frontend**: UI pilih dokumen untuk laporan (multi-select checkbox)
- [ ] **Frontend**: Pilih format output (PDF/Excel)
- [ ] **Frontend**: Loading state saat generate & notifikasi saat selesai
- [ ] **Frontend**: Preview dan download laporan

**Acceptance Criteria**:
- Laporan PDF/Excel berhasil digenerate
- File laporan tersimpan di storage
- Record report tersimpan di database
- Download berfungsi

---

### Issue #15: Manager — Kirim Laporan ke Admin
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `manager`  
**FR**: FR-10

**Deskripsi**:
Manager mengirim laporan yang sudah dibuat ke Admin melalui sistem.

**Tasks**:
- [ ] **Backend**: Endpoint `POST /api/manager/reports/{id}/send`
  - Update `sent_to` dan `sent_at` di tabel `reports`
  - Trigger notifikasi ke Admin
  - Catat di audit_log
- [ ] **Frontend**: Tombol "Kirim ke Admin" di halaman laporan
- [ ] **Frontend**: Konfirmasi dialog sebelum kirim
- [ ] **Frontend**: Status laporan: Draft → Terkirim

**Acceptance Criteria**:
- Laporan berhasil dikirim ke Admin
- Admin menerima notifikasi
- Status laporan terupdate

---

### Issue #16: Admin — Terima & Lihat Laporan
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `admin`  
**FR**: FR-11

**Deskripsi**:
Admin menerima dan mengakses laporan dari Manager di dashboard.

**Tasks**:
- [ ] **Backend**: Endpoint `GET /api/admin/reports`
  - Return semua laporan yang dikirim ke Admin
  - Include: dokumen terkait, Manager pengirim, tanggal kirim
- [ ] **Frontend**: Halaman daftar laporan Admin
  - Tabel: judul laporan, pengirim, tanggal, jumlah dokumen, aksi
  - Download file laporan
  - Link ke detail dokumen terkait

**Acceptance Criteria**:
- Admin melihat semua laporan yang dikirim Manager
- Download laporan berfungsi

---

### Issue #17: Admin — Arsipkan Dokumen
**Priority**: 🔴 High  
**Label**: `backend`, `frontend`, `admin`  
**FR**: FR-12, FR-13

**Deskripsi**:
Admin melakukan review akhir dan mengarsipkan dokumen secara digital.

**Tasks**:
- [ ] **Backend**: Endpoint `PUT /api/admin/documents/{id}/archive`
  - Validasi: dokumen harus berstatus `validated`
  - Update status → `archived`
  - Catat di audit_log (action: `archived`)
- [ ] **Backend**: Dokumen archived tidak bisa diubah statusnya lagi
- [ ] **Frontend**: Tombol "Arsipkan" di detail dokumen (hanya untuk status `validated`)
- [ ] **Frontend**: Konfirmasi dialog: "Dokumen yang diarsipkan tidak dapat diubah lagi"
- [ ] **Frontend**: Badge/label visual untuk dokumen arsip

**Acceptance Criteria**:
- Status berubah ke `archived`
- Dokumen archived immutable (tidak bisa diubah status)
- Audit log tercatat

---

### Issue #18: Admin — Pencarian & Filter Dokumen
**Priority**: 🟡 Medium  
**Label**: `backend`, `frontend`, `admin`  
**FR**: FR-18

**Deskripsi**:
Admin dapat mencari dan memfilter dokumen berdasarkan berbagai kriteria.

**Tasks**:
- [ ] **Backend**: Endpoint `GET /api/admin/documents`
  - Query params: `search`, `status`, `date_from`, `date_to`, `supplier_id`, `goods_type`
  - Pagination
  - Full-text search pada `document_number`, `goods_type`
- [ ] **Frontend**: Halaman daftar dokumen Admin
  - Search bar (nomor dokumen, jenis barang)
  - Filter dropdown: status, supplier, negara asal
  - Date range picker
  - Tabel hasil dengan pagination
  - Export hasil pencarian (opsional)

**Acceptance Criteria**:
- Pencarian berdasarkan nomor dokumen berfungsi
- Filter gabungan (status + tanggal + supplier) berfungsi
- Pagination berjalan

---

## 🎨 Milestone 4 — Dashboard & Polish (Minggu 8)

### Issue #19: Dashboard Per Role
**Priority**: 🟡 Medium  
**Label**: `frontend`, `backend`, `dashboard`  
**FR**: FR-17

**Deskripsi**:
Setiap role memiliki dashboard dengan statistik dan ringkasan sesuai kebutuhannya.

**Tasks**:
- [ ] **Backend**: Endpoint dashboard stats per role
  - Supplier: jumlah dokumen submitted, in-progress, selesai
  - Staff: jumlah inbox baru, sedang diproses, diteruskan, dikembalikan
  - Manager: jumlah pending validation, approved hari ini, rejected, laporan terkirim
  - Admin: total dokumen, arsip bulan ini, laporan diterima, dokumen per status
- [ ] **Frontend**: Dashboard Supplier
  - Card stats: total submit, status tracking
  - Tabel dokumen terbaru
- [ ] **Frontend**: Dashboard Staff Impor
  - Card stats: inbox baru, sedang proses, diteruskan, dikembalikan
  - Quick action: dokumen pending terlama
- [ ] **Frontend**: Dashboard Manager Impor
  - Card stats: pending review, approved/rejected ratio
  - Grafik trend validasi per minggu/bulan
- [ ] **Frontend**: Dashboard Admin
  - Card stats: total dokumen, arsip, laporan
  - Grafik distribusi status dokumen
  - Recent activity feed

**Acceptance Criteria**:
- Setiap role melihat dashboard yang relevan setelah login
- Statistik akurat dan real-time
- Dashboard load < 2 detik (NFR-01)

---

### Issue #20: Audit Trail Viewer (UI)
**Priority**: 🟡 Medium  
**Label**: `frontend`, `admin`, `manager`

**Deskripsi**:
UI untuk melihat jejak audit lengkap per dokumen.

**Tasks**:
- [ ] **Frontend**: Komponen timeline audit trail
  - Timeline visual: setiap entry menampilkan aktor, aksi, timestamp, catatan
  - Color-coding per aksi (submit=blue, process=yellow, validate=green, reject=red, archive=gray)
- [ ] **Frontend**: Integrasi di halaman detail dokumen (untuk Admin dan Manager)
- [ ] **Frontend**: Filter audit log by action type

**Acceptance Criteria**:
- Timeline menampilkan seluruh history dokumen secara kronologis
- Aktor dan aksi jelas teridentifikasi

---

### Issue #21: UI/UX Refinement & Error Handling
**Priority**: 🟡 Medium  
**Label**: `frontend`, `ux`

**Deskripsi**:
Polish UI/UX secara keseluruhan: loading states, error handling, responsive design.

**Tasks**:
- [ ] Loading skeleton/spinner di setiap halaman data
- [ ] Error boundary React untuk crash handling
- [ ] Toast notification untuk feedback aksi (sukses/gagal)
- [ ] Empty state design (tidak ada dokumen, tidak ada notifikasi, dll)
- [ ] Responsive layout (desktop & tablet) — NFR-06
- [ ] Form validation feedback (inline errors)
- [ ] Konfirmasi dialog untuk aksi destruktif (reject, archive)
- [ ] 404 dan 403 pages custom

**Acceptance Criteria**:
- Tidak ada halaman tanpa loading state
- Error ditampilkan dengan pesan yang user-friendly
- Responsive di desktop dan tablet

---

## 🧪 Milestone 5 — Testing & Deployment (Minggu 9–10)

### Issue #22: Unit & Feature Tests — Backend
**Priority**: 🔴 High  
**Label**: `testing`, `backend`

**Deskripsi**:
Tulis unit test dan feature test untuk seluruh endpoint API dan business logic.

**Tasks**:
- [ ] Test autentikasi: login, logout, invalid credentials, rate limiting
- [ ] Test RBAC: akses endpoint dengan role yang salah → 403
- [ ] Test Supplier flow: submit dokumen, validasi file, reject file invalid
- [ ] Test Staff flow: inbox, process metadata, forward ke Manager
- [ ] Test Manager flow: queue, validate (approve/reject), generate report, send report
- [ ] Test Admin flow: view reports, archive dokumen, search & filter
- [ ] Test Audit Trail: setiap aksi tercatat, log immutable
- [ ] Test State Machine: transisi status yang valid/invalid
- [ ] Test file upload: MIME validation, size limit, storage
- [ ] Target coverage: minimal 70% (NFR-05)

**Acceptance Criteria**:
- Seluruh test pass
- Coverage ≥ 70%
- CI pipeline menjalankan test otomatis

---

### Issue #23: Unit Tests — Frontend (React)
**Priority**: 🟡 Medium  
**Label**: `testing`, `frontend`

**Deskripsi**:
Tulis unit test untuk komponen React kritis menggunakan Vitest.

**Tasks**:
- [ ] Test komponen form upload (validasi file type/size)
- [ ] Test komponen dashboard cards (render data)
- [ ] Test komponen audit trail timeline
- [ ] Test komponen notification dropdown
- [ ] Test role-based routing/rendering
- [ ] Test form validation (metadata input)

**Acceptance Criteria**:
- Komponen kritis memiliki test
- Semua test pass

---

### Issue #24: Security Review & Hardening
**Priority**: 🔴 High  
**Label**: `security`, `review`

**Deskripsi**:
Review keamanan berdasarkan OWASP Top 10 dan pertimbangan keamanan di PRD Section 7.3.

**Tasks**:
- [ ] Validasi MIME type server-side (finfo) — bukan hanya extension
- [ ] File disimpan di luar public directory, akses via signed URL
- [ ] CSRF protection aktif
- [ ] Rate limiting pada endpoint upload dan login
- [ ] Input sanitasi via FormRequest (string, max, mimes, dll)
- [ ] Tidak ada raw SQL query (semua via Eloquent/Query Builder)
- [ ] Policy melindungi setiap resource-level action
- [ ] Review XSS prevention (React default escaping + backend sanitization)
- [ ] Review SQL injection prevention
- [ ] Test: upload file malicious (executable disguised as PDF)
- [ ] Test: API manipulation untuk bypass role

**Acceptance Criteria**:
- OWASP Top 10 checklist reviewed
- Tidak ada raw SQL query di codebase
- File upload aman dari malicious content
- Rate limiting aktif

---

### Issue #25: Dokumentasi API (Swagger/Scribe)
**Priority**: 🟡 Medium  
**Label**: `documentation`, `backend`

**Deskripsi**:
Generate dokumentasi API otomatis dari kode.

**Tasks**:
- [ ] Install Scribe atau L5-Swagger
- [ ] Tambahkan annotation/docblock di setiap controller
- [ ] Generate dokumentasi API
- [ ] Pastikan semua 14 endpoint terdokumentasi (sesuai Section 6 PRD)
- [ ] Sertakan contoh request/response
- [ ] Dokumentasikan error codes (400, 401, 403, 404, 422, 500)

**Acceptance Criteria**:
- Dokumentasi API bisa diakses via browser (Swagger UI)
- Semua endpoint terdokumentasi dengan request/response example

---

### Issue #26: Deployment ke Staging & Production
**Priority**: 🔴 High  
**Label**: `deployment`, `infrastructure`

**Deskripsi**:
Deploy aplikasi ke environment staging dan production.

**Tasks**:
- [ ] Setup server (VPS/cloud, OS Linux, Nginx + PHP-FPM)
- [ ] Konfigurasi Nginx untuk Laravel + React SPA
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Konfigurasi `.env` production (database, storage S3, queue Redis, mail)
- [ ] Setup database backup harian (RPO < 24 jam)
- [ ] Setup S3-compatible storage untuk file (dengan versioning)
- [ ] Konfigurasi Laravel Queue worker (Supervisor)
- [ ] Deploy ke staging — smoke test
- [ ] Deploy ke production
- [ ] Setup monitoring (uptime, error logging)

**Acceptance Criteria**:
- Staging environment berjalan dan bisa diakses
- Production deployment sukses
- SSL aktif
- Queue worker berjalan via Supervisor
- Database backup terjadwal

---

## 📌 Backlog / Future Considerations

### Issue #27: [BACKLOG] Notifikasi Email
**Priority**: 🟢 Low  
**Label**: `enhancement`, `notification`  
**FR**: FR-14 (opsional)

- [ ] Konfigurasi mail driver (SMTP/Mailgun/SES)
- [ ] Template email per event (submit, forward, approve, reject)
- [ ] User preference: toggle notifikasi email on/off

---

### Issue #28: [BACKLOG] Escalation & Reminder Otomatis
**Priority**: 🟢 Low  
**Label**: `enhancement`, `workflow`

- [ ] Cron job: cek dokumen yang tidak diproses > N jam
- [ ] Kirim reminder ke Staff/Manager yang menahan dokumen
- [ ] Dashboard highlight dokumen overdue

---

### Issue #29: [BACKLOG] File Scanning (ClamAV)
**Priority**: 🟢 Low  
**Label**: `enhancement`, `security`

- [ ] Integrasi ClamAV untuk scan file upload
- [ ] Reject file yang terdeteksi malicious
- [ ] Log scan result di audit trail

---

## 📊 Ringkasan Issue

| Milestone | Jumlah Issue | Priority High | Priority Medium | Priority Low |
|-----------|-------------|---------------|-----------------|--------------|
| M1 — Foundation | 5 | 5 | 0 | 0 |
| M2 — Core Workflow | 8 | 7 | 1 | 0 |
| M3 — Reporting & Archiving | 5 | 3 | 2 | 0 |
| M4 — Dashboard & Polish | 3 | 0 | 3 | 0 |
| M5 — Testing & Deployment | 5 | 3 | 2 | 0 |
| Backlog | 3 | 0 | 0 | 3 |
| **Total** | **29** | **18** | **8** | **3** |

---

## ⚠️ Open Questions (dari PRD)

> Perlu dijawab sebelum development dimulai:

1. **Akun Supplier**: Apakah Supplier membuat akun sendiri (self-register), atau Admin yang membuatkan?
2. **Digital Signature**: Apakah laporan Manager perlu digital signature atau cukup PDF biasa?
3. **Batas Iterasi Reject**: Berapa batas maksimum reject-resubmit sebelum dokumen dianggap gugur?
4. **Notifikasi Email v1.0**: Apakah notifikasi email wajib di v1.0, atau cukup in-app?
5. **SLA per Tahap**: Apakah ada SLA resmi (misal: Manager harus validasi dalam 2x24 jam)?

---

> *Generated from PRD_Sistem_Manajemen_Dokumen_Impor_v1.0.docx*
