import type { Metadata } from 'next';
import { UserRound } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/Navbar';

export const metadata: Metadata = { title: 'Tentang – Sholat Ceria' };

const AUTHOR = [
  ['Nama', 'Agus Pitono, S.Pd.I.Gr'],
  ['Nama Panggilan', 'Agus'],
  ['Instansi Pendidikan', 'SD Negeri 03 Teras Terunjam'],
  ['Guru Mata Pelajaran', 'Pendidikan Agama Islam'],
] as const;

const LOGOS = [
  ['/logo/kemendikdasmen.svg', 'Kemendikdasmen', 400, 400],
  ['/logo/ramah-anak.png', 'Kemendikdasmen Ramah', 1250, 625],
  ['/logo/pendidikan-bermutu.png', 'Pendidikan Bermutu untuk Semua', 671, 298],
  ['/logo/erunex.png', 'Erunex WooWEdu Community', 884, 348],
] as const;

export default function TentangPage() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 pt-2 sm:px-4">
      <section className="flex flex-col items-center gap-2 rounded-3xl bg-white/85 p-4 text-center shadow-xl backdrop-blur">
        <Logo className="h-16 w-16" />
        <h1 className="font-display text-3xl font-bold text-emerald-600">
          Sholat <span className="text-amber-500">Ceria</span>
        </h1>
        <p className="max-w-xl text-slate-600">
          Aplikasi belajar gerakan dan bacaan sholat yang interaktif untuk anak-anak, bersama Ali &amp; Aisyah.
        </p>
      </section>

      <section className="rounded-3xl bg-white/85 p-4 shadow-xl backdrop-blur">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-emerald-700">
          <UserRound className="h-6 w-6" /> Pembuat Aplikasi
        </h2>
        <dl className="grid gap-2">
          {AUTHOR.map(([k, v]) => (
            <div key={k} className="grid gap-0.5 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100 sm:grid-cols-[180px_1fr] sm:gap-3">
              <dt className="text-sm font-semibold text-emerald-700">{k}</dt>
              <dd className="font-display font-semibold text-slate-700">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-center font-display text-lg font-bold text-emerald-700">Didukung Oleh</h2>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {LOGOS.map(([src, alt, w, h]) => (
            <Image key={src} src={src} alt={alt} width={w} height={h} className="h-14 w-auto object-contain sm:h-16" />
          ))}
        </div>
      </section>
    </div>
  );
}
