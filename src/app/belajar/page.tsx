'use client';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Compass, Droplets, type LucideIcon, RotateCcw, Sparkles, Sunrise } from 'lucide-react';
import Link from 'next/link';
import AnimatedSholatCharacter from '@/components/AnimatedSholatCharacter';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

type Pilihan = { href: string; title: string; desc: string; badge: string; icon: LucideIcon; color: string };

// Langkah 1: pilih jenis sholat / materi. UTAMA tampil besar, LAINNYA kartu kecil; semua muat satu layar tanpa scroll.
const UTAMA: Pilihan[] = [
  { href: '/belajar/fardhu', title: 'Sholat Fardhu', desc: 'Sholat wajib 5 waktu: Subuh, Dzuhur, Ashar, Maghrib, dan Isya. Belajar langkah demi langkah sesuai niat dan jumlah rakaatnya.', badge: 'Wajib · 5 waktu', icon: Sunrise, color: 'from-emerald-500 to-teal-500' },
  { href: '/belajar/sunnah', title: 'Sholat Sunnah', desc: 'Rawatib, Dhuha, Tahajud, Witir, Tarawih, Istikharah, Hajat, sholat Id, Jumat, Jenazah, dan lainnya. Lengkap dengan niat dan tata cara.', badge: '19 materi', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
];
const LAINNYA: Pilihan[] = [
  { href: '/belajar/sholat/qadha', title: 'Qadha Sholat', desc: 'Mengganti sholat yang tertinggal.', badge: 'Mengganti sholat', icon: RotateCcw, color: 'from-rose-400 to-red-500' },
  { href: '/belajar/wudhu', title: 'Wudhu', desc: '10 langkah wudhu dengan video.', badge: 'Sebelum sholat', icon: Droplets, color: 'from-cyan-400 to-sky-500' },
  { href: '/belajar/niat', title: 'Gerakan Dasar', desc: '8 gerakan sholat satu per satu.', badge: '8 gerakan', icon: BookOpen, color: 'from-sky-500 to-blue-500' },
  { href: '/belajar/panduan', title: 'Panduan Sholat', desc: 'Syarat sah, waktu, dan pembatal.', badge: 'Pengetahuan', icon: Compass, color: 'from-violet-500 to-purple-500' },
];

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.07 * i } });

export default function BelajarPage() {
  const app = useApp();
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:gap-3 sm:px-4">
      <div className="flex items-center gap-3 rounded-3xl bg-white/85 px-3 py-2 shadow-lg backdrop-blur">
        <div className="h-14 w-11 shrink-0 sm:h-16 sm:w-12"><AnimatedSholatCharacter posture="sapa" character={app.character} className="h-full" /></div>
        <div>
          <h1 className="font-display text-xl font-bold text-emerald-700 sm:text-3xl">Mari Belajar Sholat!</h1>
          <p className="text-sm text-slate-600 sm:text-base">Pilih dulu sholat yang ingin kamu pelajari.</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3 md:flex-row">
      <div className="grid min-h-0 flex-1 grid-rows-2 gap-2 sm:gap-3 md:grid-cols-2 md:grid-rows-1">
        {UTAMA.map((x, i) => {
          const Icon = x.icon;
          return (
            <motion.div key={x.href} {...anim(i)} className="min-h-0">
              <Link href={x.href} onClick={() => play('click')}
                className="group flex h-full items-center gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow-lg ring-2 ring-white transition hover:-translate-y-1 hover:ring-emerald-200 md:flex-col md:justify-center md:text-center sm:p-6">
                <span className={`flex aspect-square h-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${x.color} text-white shadow sm:h-28 lg:h-36`}>
                  <Icon className="h-10 w-10 transition-transform group-hover:scale-110 sm:h-14 sm:w-14 lg:h-20 lg:w-20" />
                </span>
                <div className="min-w-0 flex-1 md:flex-none">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{x.badge}</span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-slate-700 sm:text-3xl lg:text-4xl">{x.title}</h2>
                  <p className="line-clamp-3 text-sm text-slate-500 sm:text-base md:mx-auto md:max-w-md">{x.desc}</p>
                </div>
                <ChevronRight className="h-6 w-6 shrink-0 text-slate-300 group-hover:text-emerald-500 md:hidden" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 sm:gap-3 md:w-56 md:grid-cols-1 md:grid-rows-4 lg:w-64">
        {LAINNYA.map((x, i) => {
          const Icon = x.icon;
          return (
            <motion.div key={x.href} {...anim(i + 2)} className="min-h-0">
              <Link href={x.href} onClick={() => play('click')}
                className="group flex h-full items-center gap-2 overflow-hidden rounded-2xl bg-white p-2 shadow-md ring-2 ring-white transition hover:-translate-y-1 hover:ring-emerald-200 sm:gap-3 sm:p-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${x.color} text-white shadow sm:h-12 sm:w-12`}>
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-sm font-bold text-slate-700 sm:text-base">{x.title}</h2>
                  <p className="hidden truncate text-xs text-slate-500 sm:block md:whitespace-normal">{x.desc}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
