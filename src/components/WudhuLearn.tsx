'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { WAKTU, WUDHU } from '@/data/panduanData';
import { play } from '@/lib/sound';

const L = WUDHU.langkah;

// Belajar wudhu langkah demi langkah (video). ke = slug sholat fardhu yang dituju setelah wudhu.
export default function WudhuLearn({ ke, start }: { ke?: string; start: number }) {
  const router = useRouter();
  const w = WAKTU.find((x) => x.slug === ke);
  const lanjut = w ? `/belajar/fardhu/${w.slug}` : '/belajar/fardhu';
  const [i, setI] = useState(() => Math.min(Math.max(0, start), L.length - 1));
  const s = L[i];
  const go = (n: number) => {
    play('click');
    setI(n);
    window.history.replaceState(null, '', `?${w ? `ke=${w.slug}&` : ''}langkah=${n + 1}`); // posisi tetap saat refresh
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:gap-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-white/85 p-2 shadow-lg backdrop-blur">
        <Link href={w ? '/belajar/fardhu' : '/belajar'} onClick={() => play('click')} className="btn-3d border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <div className="order-first w-full min-w-0 px-1 sm:order-none sm:w-auto sm:flex-1">
          <h1 className="font-display text-xl font-bold leading-tight text-sky-700">Belajar Wudhu{w && <span className="text-slate-500"> · sebelum Sholat {w.name}</span>}</h1>
          <p className="text-xs text-slate-500">Langkah {i + 1} dari {L.length} · Sholat tidak sah tanpa wudhu</p>
        </div>
        {w && <Link href={lanjut} onClick={() => play('click')} className="btn-3d ml-auto border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600">Sudah wudhu, lewati</Link>}
        <div className="flex w-full gap-1">
          {L.map((x, j) => (
            <button key={x.clip} aria-label={`Langkah ${j + 1}: ${x.title}`} onClick={() => go(j)}
              className={`h-2 flex-1 rounded-full transition ${j === i ? 'bg-sky-500' : j < i ? 'bg-sky-300' : 'bg-slate-200 hover:bg-slate-300'}`} />
          ))}
        </div>
      </div>

      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="scroll-soft grid min-h-0 flex-1 content-start gap-3 overflow-y-auto rounded-3xl bg-white/80 p-2 shadow-xl backdrop-blur sm:p-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <video src={`/wudhu/${s.clip}.mp4`} autoPlay muted loop playsInline aria-label={`Animasi: ${s.title}`}
            className="aspect-[960/496] w-full rounded-2xl bg-sky-100 object-cover shadow" />
          <p className="mt-0.5 text-right text-[10px] text-slate-400">Animasi: Muslim Reminder Kids</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500 font-display text-lg font-bold text-white">{i + 1}</span>
            <h2 className="font-display text-2xl font-bold leading-tight text-slate-700">{s.title}</h2>
          </div>
          {s.kali && <span className="w-fit rounded-full bg-amber-100 px-3 py-1 font-display text-sm font-semibold text-amber-700">Diulang {s.kali} kali</span>}
          <p className="text-slate-700 sm:text-lg">{s.desc}</p>
          {s.list && (
            <ul className="grid gap-1.5">
              {s.list.map((b) => <li key={b} className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-1.5 text-slate-700 ring-1 ring-rose-200"><Ban className="h-4 w-4 shrink-0 text-rose-400" />{b}</li>)}
            </ul>
          )}
          {s.baca && (
            <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-200">
              <p className="arabic text-center text-xl leading-loose text-slate-800 sm:text-2xl">{s.baca.arabic}</p>
              <p className="text-sm italic text-sky-800">{s.baca.latin}</p>
              <p className="mt-1 text-sm text-slate-600"><b className="text-emerald-700">Artinya: </b>{s.baca.meaning}</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex items-center justify-between gap-2">
        <button disabled={i === 0} onClick={() => go(i - 1)} className="btn-3d border-slate-300 bg-white px-4 py-2.5 text-slate-600 disabled:opacity-40">
          <ChevronLeft className="h-5 w-5" /> <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        {i < L.length - 1 ? (
          <button onClick={() => go(i + 1)} className="btn-3d border-sky-700 bg-sky-500 px-5 py-2.5 text-white">Lanjut <ChevronRight className="h-5 w-5" /></button>
        ) : (
          <button onClick={() => { play('correct'); router.push(lanjut); }} className="btn-3d border-emerald-700 bg-emerald-500 px-5 py-2.5 text-white">
            {w ? `Wudhu selesai, mulai Sholat ${w.name}` : 'Wudhu selesai, pilih sholat'} <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
