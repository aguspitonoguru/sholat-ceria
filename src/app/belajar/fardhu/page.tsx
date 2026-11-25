'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Droplets } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Slides from '@/components/Slides';
import { urutanSholat, WAKTU } from '@/data/panduanData';
import { play } from '@/lib/sound';

// Langkah 2: pilih waktu sholat fardhu. Sakelar “Wudhu dulu” = lewat materi wudhu sebelum belajar sholat.
export default function FardhuPage() {
  const [wudhu, setWudhu] = useState(false);
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:gap-3 sm:px-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-3xl bg-white/85 p-2 shadow-lg backdrop-blur sm:p-3">
        <Link href="/belajar" onClick={() => play('click')} className="btn-3d border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-emerald-700">Sholat Fardhu</h1>
          <p className="text-sm text-slate-600">Sholat wajib 5 waktu, 17 rakaat sehari semalam. Pilih waktunya, dan jangan lupa berwudhu dulu ya!</p>
        </div>
        <button role="switch" aria-checked={wudhu} onClick={() => { play('click'); setWudhu(!wudhu); }}
          className={`ml-auto flex items-center gap-2 rounded-2xl px-3 py-1.5 font-display text-sm font-semibold ring-2 transition ${wudhu ? 'bg-sky-500 text-white ring-sky-600' : 'bg-white text-slate-600 ring-slate-200'}`}>
          <Droplets className="h-4 w-4" /> Wudhu dulu
          <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${wudhu ? 'bg-white/40' : 'bg-slate-200'}`}>
            <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${wudhu ? 'translate-x-4' : ''}`} />
          </span>
        </button>
      </div>
      <Slides className="grid grid-cols-2 content-start gap-2 sm:gap-3 lg:grid-cols-5" items={
        WAKTU.map((w, i) => (
          <motion.div key={w.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}>
            <Link href={wudhu ? `/belajar/wudhu?ke=${w.slug}` : `/belajar/fardhu/${w.slug}`} onClick={() => play('click')}
              className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1">
              <div className={`bg-gradient-to-br ${w.color} p-4 text-white`}>
                <div className="font-display text-2xl font-bold drop-shadow">{w.name}</div>
                <div className="font-display text-4xl font-bold leading-none">{w.rakaat}<span className="ml-1 text-base">rakaat</span></div>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3 text-sm text-slate-600">
                <p>{w.time}</p>
                <p className="text-xs text-slate-500">{urutanSholat(w.rakaat, w.jahr).flat().length} langkah · bacaan {w.jahr ? `keras di rakaat 1–${w.jahr}` : 'pelan semua'}</p>
                <span className="mt-auto flex items-center gap-1 pt-1 font-display font-semibold text-emerald-600 group-hover:gap-2">{wudhu ? 'Wudhu, lalu sholat' : 'Mulai belajar'} <ChevronRight className="h-4 w-4" /></span>
              </div>
            </Link>
          </motion.div>
        ))} />
    </div>
  );
}
