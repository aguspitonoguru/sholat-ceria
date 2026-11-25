'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Slides from '@/components/Slides';
import { KATEGORI, SHOLAT_LAIN } from '@/data/sunnahData';
import { play } from '@/lib/sound';

// Daftar sholat selain fardhu 5 waktu, dikelompokkan per kategori; semua muat satu layar.
export default function SunnahPage() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:gap-3 sm:px-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-3xl bg-white/85 p-2 shadow-lg backdrop-blur sm:p-3">
        <Link href="/belajar" onClick={() => play('click')} className="btn-3d border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <div>
          <h1 className="font-display text-xl font-bold text-emerald-700 sm:text-2xl">Sholat Sunnah & Lainnya</h1>
          <p className="text-xs text-slate-600 sm:text-sm">Pilih sholat untuk melihat niat, waktu, rakaat, tata cara, dan doanya.</p>
        </div>
      </div>
      <Slides className="grid content-start gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3" items={
          KATEGORI.map((k, ki) => (
            <motion.section key={k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * ki }}
              className="rounded-3xl bg-white/90 p-2 shadow-lg sm:p-3">
              <h2 className="mb-1.5 px-1 font-display font-bold text-slate-700">{k}</h2>
              <div className="flex flex-wrap gap-1.5">
                {SHOLAT_LAIN.filter((s) => s.kategori === k).map((s) => (
                  <Link key={s.slug} href={`/belajar/sholat/${s.slug}`} onClick={() => play('click')}
                    className={`group flex items-center gap-1 rounded-2xl bg-gradient-to-br ${s.color} px-3 py-2 font-display text-sm font-semibold text-white shadow transition hover:-translate-y-0.5`}>
                    {s.name.replace(/^Sholat /, '')} <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </motion.section>
          ))} />
    </div>
  );
}
