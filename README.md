# Sistem Pengamanan Kesehatan MBG

Sistem digital untuk pengamanan kesehatan pada kegiatan MBG (Marinir Besar) yang komprehensif dan terintegrasi.

## Tujuan Utama

- Menjamin semua personel, tamu, dan pendukung yang terlibat di MBG dalam kondisi kesehatan yang aman
- Mencegah masuknya penyakit menular dan kondisi medis berisiko tinggi
- Menyediakan respons medis cepat bila terjadi insiden kesehatan
- Terdokumentasi dengan rapi dan dapat dipertanggungjawabkan

## Fitur Utama

### 1. Pra-Kegiatan (Pre-Event Health Screening)
- Registrasi kesehatan awal dengan form lengkap
- Pemeriksaan kesehatan dasar (tekanan darah, nadi, suhu, BMI, saturasi O₂)
- Kriteria kelayakan: Fit / Fit dengan catatan / Tidak fit
- Penerbitan Health Clearance Pass (QR Code)

### 2. Kedatangan & Pintu Masuk (Entry Health Security Check)
- Pos kesehatan di gate/checkpoint
- Validasi Health Clearance dengan scan QR Code
- Rapid Triage (Hijau/Kuning/Merah)
- Ruang observasi cepat

### 3. Pengawasan Kesehatan Selama Kegiatan (On-Site Monitoring)
- Pos kesehatan utama dan satelit
- Patroli kesehatan mobile
- Monitoring personel kritis (VIP/pasukan khusus)
- Tracking real-time

### 4. Respons Medis & Rujukan
- Prosedur kode darurat
- Tim respons cepat
- Ambulans standby
- Algoritma rujukan ke RS

### 5. Pasca-Kegiatan (Post-Event Monitoring)
- Rekap insiden kesehatan
- Evaluasi beban kerja kesehatan
- Pelaporan ke pimpinan
- Follow-up kasus tertentu

## Modul Sistem Digital

1. **Modul Registrasi & Profil Kesehatan**
2. **Modul Security Check Kesehatan di Pintu Masuk**
3. **Modul Triage & Insiden On-Site**
4. **Modul Monitoring & Dashboard Pimpinan**
5. **Modul Logistik Kesehatan**
6. **Modul Laporan Akhir**

## Teknologi

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **QR Code**: qrcode library
- **UI Components**: Tailwind CSS + Shadcn UI
- **Charts**: Recharts

## Struktur Proyek

```
├── client/          # Frontend React application
├── server/          # Backend Express application
├── docs/            # Dokumentasi SOP dan formulir
└── README.md
```

## Instalasi

### Prerequisites
- Node.js 18+
- npm atau yarn

### Development

1. Clone repository
```bash
git clone <repository-url>
cd mbg-health-security-system
```

2. Install dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

3. Setup environment variables
```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

4. Run development servers
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`
Backend akan berjalan di `http://localhost:3000`

## Build untuk Production

```bash
npm run build
npm start
```

## Dokumentasi

Lihat folder `docs/` untuk:
- SOP Skrining Kesehatan Pra MBG
- SOP Security Check Kesehatan di Gate
- SOP Penanganan Insiden Medis
- SOP Rujukan ke Rumah Sakit
- Template Formulir

## Lisensi

MIT
