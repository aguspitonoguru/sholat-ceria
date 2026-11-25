# Sholat Ceria – Belajar Sholat Interaktif

Next.js 16 (App Router) + Tailwind CSS 4 + Framer Motion. Tanpa login.

## Jalankan di localhost

```bash
npm install
npm run dev        # http://localhost:3000
node scripts/check-rig.mjs   # cek otomatis 8 pose karakter
```

## Struktur penting

- `src/data/sholatData.ts`: materi 8 gerakan, kuis, kelas contoh
- `src/lib/rig.ts`: kerangka 3D karakter (pose, IK, proyeksi Depan/Samping/Belakang)
- `src/components/AnimatedSholatCharacter.tsx`: karakter Ali/Aisyah (`FrontView`, `SideView`, `BackView`)
- `src/lib/store.tsx`: state + localStorage
- `src/app/api/progress/route.ts`: sinkron progres siswa ke Supabase (opsional)

## Aset gerakan (video 3D)

Video sumber ada di folder `ASET` di sebelah folder proyek. Butuh Python + numpy + ffmpeg.

```bash
python scripts/aset/potong.py                 # potong semua video jadi public/aset/{tokoh}/{gerakan}-{front|side|back}.mp4/.png
python scripts/aset/potong.py aisyah/rukuk    # hanya gerakan tertentu
python scripts/aset/salam.py && python scripts/aset/potong.py ali/salam   # salam: kepala menoleh kanan-kiri
```

Daftar video → gerakan ada di `JOBS` (`potong.py`); gerakan yang memakai video ada di `ASSETS` (`AnimatedSholatCharacter.tsx`).

## Supabase (nanti)

1. Jalankan `supabase/schema.sql` di SQL Editor.
2. Salin `.env.example` ke `.env.local`, isi URL, anon key, dan service role key.
3. Unggah mp3 bacaan (64–96 kbps) ke Storage, tempel URL-nya di Mode Guru > Kelola Materi Sholat.

## Mode Guru (via QR)

Tidak ada tombol Mode Guru di aplikasi. Di layar kelas buka `/guru` → muncul QR (berlaku 5 menit) → guru scan dengan HP,
masuk dengan akun guru → tap **Buka Mode Guru** → layar kelas terbuka 8 jam (tombol **Keluar** untuk mengunci lagi).

- Akun guru dibuat di Supabase > Authentication > Users. Matikan "Allow new users to sign up".
- HP harus bisa membuka alamat yang sama dengan layar kelas (pakai URL deploy, bukan `localhost`).
- Butuh Supabase; tanpa itu Mode Guru tetap terkunci.

## Deploy Vercel

Import repo ke Vercel, isi env yang sama di Project Settings, deploy.
