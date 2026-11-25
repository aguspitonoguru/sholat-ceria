'use client';
import { ArrowLeft, BookOpenText, Clock, Footprints, HandHeart, Info, ListOrdered, type LucideIcon, Play, Scale, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { RAKAAT_FLOW, rakaatItems } from '@/components/RakaatGrid';
import Slides, { bacaanItems } from '@/components/Slides';
import { namaDariNiat, SHOLAT_LAIN, urutanOf } from '@/data/sunnahData';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

type Tab = 'ringkas' | 'niat' | 'cara' | 'gerakan' | 'doa';
const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'ringkas', label: 'Ringkasan', icon: Info },
  { id: 'niat', label: 'Niat', icon: Sparkles },
  { id: 'cara', label: 'Tata Cara', icon: ListOrdered },
  { id: 'gerakan', label: 'Gerakan', icon: Footprints },
  { id: 'doa', label: 'Doa & Bacaan', icon: HandHeart },
];
const card = 'rounded-2xl bg-white p-3 shadow-md ring-1 ring-slate-100';

/** Pilihan bila ada lebih dari satu niat/bacaan; satu yang tampil agar muat tanpa scroll. */
function Pilih({ items, sel, set }: { items: string[]; sel: number; set: (i: number) => void }) {
  if (items.length < 2) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <button key={t} onClick={() => { play('click'); set(i); }}
          className={`rounded-full px-3 py-1 font-display text-xs font-semibold sm:text-sm ${sel === i ? 'bg-amber-500 text-white shadow' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100'}`}>{t}</button>
      ))}
    </div>
  );
}

// Detail satu sholat sunnah/lainnya dalam tab, setiap tab muat satu layar.
export default function SholatDetail({ slug }: { slug: string }) {
  const app = useApp();
  const s = SHOLAT_LAIN.find((x) => x.slug === slug)!;
  const [tab, setTab] = useState<Tab>('ringkas');
  const [ni, setNi] = useState(0); // niat terpilih: dipakai tab Niat, Gerakan, dan tombol Mulai Belajar
  const [di, setDi] = useState(0);
  const tabs = TABS.filter((t) => t.id !== 'doa' || s.doa);
  const info = [
    { icon: Scale, label: 'Hukum', value: s.hukum },
    { icon: ListOrdered, label: 'Rakaat', value: s.rakaat },
    { icon: Clock, label: 'Waktu', value: s.waktu },
  ];

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:px-4">
      <div className={`flex shrink-0 flex-wrap items-center gap-2 rounded-3xl bg-gradient-to-br ${s.color} p-2 text-white shadow-lg sm:p-3`}>
        <Link href="/belajar/sunnah" onClick={() => play('click')} className="btn-3d border-white/60 bg-white/90 px-3 py-1.5 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Semua</Link>
        <div className="min-w-0 flex-1">
          <span className="block text-xs opacity-90">{s.kategori}</span>
          <h1 className="truncate font-display text-xl font-bold drop-shadow sm:text-2xl">{s.name}</h1>
        </div>
        <Link href={`/belajar/sholat/${s.slug}/praktik?niat=${ni}`} onClick={() => play('click')} className="btn-3d border-emerald-700 bg-emerald-500 px-3 py-1.5 text-sm text-white">
          <Play className="h-4 w-4" /> Mulai Belajar{s.niat.length > 1 && ` ${namaDariNiat(s.niat[ni])}`}
        </Link>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => { play('click'); setTab(id); }}
            className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 font-display text-sm font-semibold ${tab === id ? 'bg-emerald-500 text-white shadow' : 'bg-white/80 text-slate-600 hover:bg-white'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-3xl bg-white/70 p-2 shadow-xl backdrop-blur sm:p-3">
        {(tab === 'niat' || tab === 'gerakan') && <Pilih items={s.niat.map(namaDariNiat)} sel={ni} set={setNi} />}
        {tab === 'doa' && s.doa && <Pilih items={s.doa.map((d) => d.title)} sel={di} set={setDi} />}
        <Slides key={`${tab}-${ni}-${di}`} className={tab === 'gerakan' ? RAKAAT_FLOW : 'grid content-start gap-2 sm:grid-cols-3'} items={
          tab === 'ringkas' ? [
            <p key="desc" className="col-span-full text-slate-700 sm:text-lg">{s.desc}</p>,
            ...info.map(({ icon: Icon, label, value }) => (
              <div key={label} className={`${card} flex gap-2`}>
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div><div className="font-display text-sm font-bold text-emerald-700">{label}</div><p className="text-sm text-slate-600">{value}</p></div>
              </div>
            )),
            ...(s.catatan ? [
              <h3 key="ct" data-lanjut className="col-span-full mt-1 flex items-center gap-1.5 font-display font-bold text-violet-700"><BookOpenText className="h-4 w-4" /> Perlu Diketahui</h3>,
              ...s.catatan.map((c) => <p key={c} className={`${card} col-span-full py-2 text-sm text-slate-700 ring-violet-200`}>{c}</p>),
            ] : []),
          ]
          : tab === 'niat' ? [
            ...bacaanItems(s.niat[ni], 'niat'),
            <p key="ket" className="col-span-full text-xs text-slate-500">Niat tempatnya di dalam hati, bersamaan dengan takbiratul ihram. Lafaz niat boleh diucapkan pelan untuk membantu.</p>,
          ]
          : tab === 'cara' ? s.cara.map((c, i) => (
            <div key={i} className={`${card} col-span-full flex items-center gap-3 py-2`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-display font-bold text-white">{i + 1}</span>
              <span className="text-slate-700">{c}</span>
            </div>
          ))
          : tab === 'gerakan' ? rakaatItems(urutanOf(s, ni), app.character, s.tanpaRakaat ? 'Urutan dari niat sampai salam' : undefined)
          : bacaanItems(s.doa![di], 'doa')
        } />
      </div>
    </div>
  );
}
