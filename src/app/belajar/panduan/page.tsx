'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Ban, CheckCircle2, Clock, Droplets, ListOrdered, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { type ReactElement, useState } from 'react';
import { RAKAAT_FLOW, rakaatItems } from '@/components/RakaatGrid';
import Slides, { bacaanItems } from '@/components/Slides';
import { PEMBATAL, SYARAT_SAH, urutanSholat, WAKTU, WUDHU } from '@/data/panduanData';
import { MATERIALS } from '@/data/sholatData';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

type Sec = 'fardhu' | 'syarat' | 'wudhu' | 'waktu' | 'batal';
const SECTIONS: { id: Sec; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'fardhu', label: 'Sholat Fardhu', icon: ListOrdered, color: 'bg-violet-500' },
  { id: 'syarat', label: 'Syarat Sah', icon: CheckCircle2, color: 'bg-emerald-500' },
  { id: 'wudhu', label: 'Cara Wudhu', icon: Droplets, color: 'bg-sky-500' },
  { id: 'waktu', label: 'Waktu & Rakaat', icon: Clock, color: 'bg-amber-500' },
  { id: 'batal', label: 'Pembatal Sholat', icon: Ban, color: 'bg-rose-500' },
];

const card = 'rounded-2xl bg-white p-3 shadow-md ring-1 ring-slate-100';
const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.04 * i } });

// Niat tiap sholat diambil dari materi gerakan Niat (Subuh = bacaan utama, lainnya = bacaan tambahan).
const NIAT = MATERIALS[0];
const niatOf = (name: string) => (name === 'Subuh' ? NIAT : NIAT.extra?.find((e) => e.title.endsWith(name)) ?? NIAT);

function SholatFardhu() {
  const app = useApp();
  const [pi, setPi] = useState(0);
  const w = WAKTU[pi];
  const rakaat = urutanSholat(w.rakaat, w.jahr);
  const stats = [
    ['Rakaat', w.rakaat], ['Rukuk', w.rakaat], ['Sujud', w.rakaat * 2], ['Tasyahud', w.rakaat > 2 ? 2 : 1], ['Gerakan', rakaat.flat().length],
  ] as const;

  return (
    <>
      <div className="grid shrink-0 grid-cols-5 gap-1.5 sm:gap-2">
        {WAKTU.map((x, i) => (
          <button key={x.name} onClick={() => { play('click'); setPi(i); }}
            className={`rounded-2xl p-2 text-center font-display text-white shadow transition ${pi === i ? `bg-gradient-to-br ${x.color} ring-4 ring-white` : 'bg-slate-300 hover:bg-slate-400'}`}>
            <div className="text-sm font-bold sm:text-lg">{x.name}</div>
            <div className="text-[11px] sm:text-sm">{x.rakaat} rakaat</div>
          </button>
        ))}
      </div>
      <Slides key={w.name} className={RAKAAT_FLOW} items={[
        <div key="hdr" className={`col-span-full rounded-3xl bg-gradient-to-br ${w.color} p-3 text-white shadow-lg`}>
          <div className="flex flex-wrap items-end gap-x-3">
            <h2 className="font-display text-2xl font-bold drop-shadow">Sholat {w.name}</h2>
            <span className="text-sm opacity-90">{w.time}</span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/20 py-1 text-center ring-1 ring-white/40">
                <div className="font-display text-xl font-bold leading-tight">{v}</div><div className="text-[11px]">{k}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm">
            {w.jahr ? `Al-Fatihah & surah pendek dibaca keras di rakaat 1–${w.jahr}${w.rakaat > w.jahr ? `, rakaat berikutnya pelan.` : '.'}` : 'Semua bacaan dibaca pelan (tidak dikeraskan).'}
          </p>
        </div>,
        ...bacaanItems({ ...niatOf(w.name), title: `Niat Sholat ${w.name}` }, 'niat'),
        ...rakaatItems(rakaat, app.character),
        <p key="akhir" className="col-span-full rounded-2xl bg-emerald-50 p-3 text-center text-sm text-emerald-800 ring-1 ring-emerald-200">
          Setelah salam, sholat {w.name} selesai. Lanjutkan dengan dzikir dan berdoa. Ketuk gambar gerakan untuk belajar lebih detail.
        </p>,
      ]} />
    </>
  );
}

const ISI: Record<Exclude<Sec, 'fardhu'>, { className: string; items: () => ReactElement[] }> = {
  syarat: {
    className: 'grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-3',
    items: () => [
      <p key="i" className="col-span-full text-slate-600">Sebelum sholat, pastikan semua syarat ini terpenuhi agar sholat kita <b>sah</b>.</p>,
      ...SYARAT_SAH.map((x, i) => (
        <motion.div key={x.title} {...fade(i)} className={`${card} flex gap-3`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 font-display font-bold text-white">{i + 1}</span>
          <div><h3 className="font-display font-bold text-emerald-700">{x.title}</h3><p className="text-sm text-slate-600">{x.desc}</p></div>
        </motion.div>
      )),
    ],
  },
  wudhu: {
    className: 'grid content-start gap-2',
    items: () => [
      <Link key="video" href="/belajar/wudhu" onClick={() => play('click')} className="btn-3d justify-self-start border-sky-700 bg-sky-500 px-4 py-2.5 text-white"><Droplets className="h-5 w-5" /> Belajar Wudhu dengan Video</Link>,
      ...WUDHU.langkah.filter((st) => !st.list).map((st, i) => (
        <motion.div key={st.clip} {...fade(i)} className={`${card} flex items-center gap-3 py-2`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 font-display font-bold text-white">{i + 1}</span>
          <span className="text-slate-700"><b>{st.title}{st.kali && ` (${st.kali}x)`}.</b> {st.desc}</span>
        </motion.div>
      )),
      ...bacaanItems({ ...WUDHU.niat, title: 'Niat Wudhu' }, 'niat'),
      <div key="batal" className={`${card} ring-rose-200`}>
        <h3 className="font-display font-bold text-rose-600">Yang Membatalkan Wudhu</h3>
        <ul className="mt-1 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
          {WUDHU.batal.map((b) => <li key={b} className="flex items-center gap-2"><Ban className="h-4 w-4 shrink-0 text-rose-400" />{b}</li>)}
        </ul>
      </div>,
    ],
  },
  waktu: {
    className: 'grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-5',
    items: () => [
      ...WAKTU.map((w, i) => (
        <motion.div key={w.name} {...fade(i)} className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className={`bg-gradient-to-br ${w.color} p-3 text-white`}>
            <h3 className="font-display text-xl font-bold">{w.name}</h3>
            <div className="font-display text-3xl font-bold">{w.rakaat} <span className="text-base">rakaat</span></div>
          </div>
          <p className="p-3 text-sm text-slate-600">{w.time}</p>
        </motion.div>
      )),
      <p key="total" className="col-span-full rounded-2xl bg-amber-50 p-3 text-center font-display text-lg font-bold text-amber-800 ring-1 ring-amber-200">
        Jumlah sehari semalam: 2 + 4 + 4 + 3 + 4 = 17 rakaat
      </p>,
    ],
  },
  batal: {
    className: 'grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-4',
    items: () => [
      <p key="i" className="col-span-full text-slate-600">Hal-hal berikut membuat sholat <b>batal</b> dan harus diulang.</p>,
      ...PEMBATAL.map((x, i) => (
        <motion.div key={x} {...fade(i)} className={`${card} flex items-center gap-3 ring-rose-100`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500"><Ban className="h-5 w-5" /></span>
          <span className="font-semibold text-slate-700">{x}</span>
        </motion.div>
      )),
    ],
  },
};

export default function PanduanPage() {
  const [sec, setSec] = useState<Sec>('fardhu');

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:gap-3 sm:px-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-3xl bg-white/85 p-2 shadow-lg backdrop-blur">
        <Link href="/belajar/niat" onClick={() => play('click')} className="btn-3d border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Gerakan</Link>
        <h1 className="px-1 font-display text-xl font-bold text-emerald-700">Panduan Sholat</h1>
        <div className="flex w-full gap-1 overflow-x-auto sm:ml-auto sm:w-auto">
          {SECTIONS.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => { play('click'); setSec(id); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 font-display text-sm font-semibold ${sec === id ? `${color} text-white shadow` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={sec} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-0 flex-1 flex-col gap-2 rounded-3xl bg-white/70 p-2 shadow-xl backdrop-blur sm:p-3">
        {sec === 'fardhu' ? <SholatFardhu /> : <Slides className={ISI[sec].className} items={ISI[sec].items()} />}
      </motion.div>
    </div>
  );
}
