'use client';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Compass, Eye, EyeOff, Lightbulb, ListOrdered, RotateCcw, ScrollText, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AnimatedSholatCharacter, { type AngleMode } from '@/components/AnimatedSholatCharacter';
import AudioPlayer from '@/components/AudioPlayer';
import CoverflowSlider from '@/components/CoverflowSlider';
import Slides, { bacaanItems, potong } from '@/components/Slides';
import StarCelebration from '@/components/StarCelebration';
import type { Material } from '@/data/sholatData';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

const MODES: { id: AngleMode; label: string }[] = [
  { id: 'all', label: 'Semua 3 Sudut' },
  { id: 'front', label: 'Depan' },
  { id: 'side', label: 'Samping' },
  { id: 'back', label: 'Belakang' },
];

type Tab = 'bacaan' | 'cara' | 'perhatikan' | 'lengkap';
const TABS = [
  { id: 'bacaan' as Tab, label: 'Bacaan', icon: BookOpen },
  { id: 'cara' as Tab, label: 'Cara', icon: ListOrdered },
  { id: 'perhatikan' as Tab, label: 'Perhatikan', icon: Lightbulb },
  { id: 'lengkap' as Tab, label: 'Bacaan Lengkap', icon: ScrollText },
];

// Mode gerakan dasar (8 gerakan, per halaman /belajar/[slug]).
export default function LearnView({ slug }: { slug: string }) {
  const app = useApp();
  const router = useRouter();
  const idx = Math.max(0, app.materials.findIndex((m) => m.slug === slug));
  return <Lesson items={app.materials} idx={idx} go={(i) => router.push(`/belajar/${app.materials[i].slug}`, { scroll: false })} />;
}

/** rakaat 0 = tanpa hitungan rakaat; back = tujuan tombol pilih sholat lain (default daftar fardhu). */
export type Sholat = { name: string; rakaat: number; sub: string[]; back?: string };

export function Lesson({ items, idx, go, sholat }: { items: Material[]; idx: number; go: (i: number) => void; sholat?: Sholat }) {
  const app = useApp();
  const router = useRouter();
  const m = items[idx];
  const next = items[idx + 1];
  const [mode, setMode] = useState<AngleMode>('all');
  const [replay, setReplay] = useState(0);
  const [showLatin, setShowLatin] = useState(true);
  const [tabSel, setTab] = useState<Tab>('bacaan');
  const tab = tabSel === 'lengkap' && !m.extra ? 'bacaan' : tabSel; // tab Bacaan Lengkap hanya ada di gerakan yang punya bacaan tambahan
  const [party, setParty] = useState<null | 'new' | 'again' | 'sholat'>(null);
  const done = app.completed.includes(m.slug);

  const finish = () => {
    if (!done) app.completeStep(m.slug);
    if (sholat && next) { play('correct'); go(idx + 1); return; } // mode sholat: langsung ke langkah berikutnya
    setParty(sholat ? 'sholat' : done ? 'again' : 'new');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:px-4">
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-rows-[minmax(0,0.65fr)_minmax(0,1.35fr)] gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_520px] lg:grid-rows-1">
        {/* Panggung sajadah */}
        <section className="flex min-h-0 flex-col rounded-3xl bg-gradient-to-b from-sky-50/90 via-white/80 to-emerald-50/90 p-2 shadow-xl ring-1 ring-white backdrop-blur sm:p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl bg-emerald-50 p-1 ring-1 ring-emerald-100">
              {MODES.map((o) => (
                <button key={o.id} onClick={() => { play('click'); setMode(o.id); }}
                  className={`relative rounded-xl px-2.5 py-1.5 font-display text-xs font-semibold sm:text-sm ${mode === o.id ? 'text-white' : 'text-emerald-700'}`}>
                  {mode === o.id && <motion.span layoutId="angle-pill" className="absolute inset-0 rounded-xl bg-emerald-500" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                  <span className="relative">{o.label}</span>
                </button>
              ))}
            </div>
            <Link href="/belajar/panduan" onClick={() => play('click')} className="btn-3d ml-auto border-sky-600 bg-sky-500 px-3 py-1.5 text-sm text-white">
              <Compass className="h-4 w-4" /> Panduan Sholat
            </Link>
            <button onClick={() => { play('click'); setReplay((r) => r + 1); }} className="btn-3d border-amber-600 bg-amber-400 px-3 py-1.5 text-sm text-amber-950">
              <RotateCcw className="h-4 w-4" /> Ulangi Gerakan
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <AnimatedSholatCharacter key={idx} posture={m.slug} character={app.character} mode={mode} replayKey={replay} loop labels className="h-full gap-1 pt-1" />
          </div>
          <div className="hidden flex-wrap justify-center gap-2 sm:flex">
            {m.points.map((p, i) => (
              <motion.span key={p} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
                className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 sm:text-sm">
                <CheckCircle2 className="h-4 w-4" /> {p}
              </motion.span>
            ))}
          </div>
        </section>

        {/* Kartu bacaan: dipadatkan agar semua detail muat; tombol di bawah selalu terlihat */}
        <motion.section key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-emerald-100">
          <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-2 text-white sm:px-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/25 font-display text-xl font-bold ring-2 ring-white/60">{m.id}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-50">
                <span className="truncate">{sholat ? `Sholat ${sholat.name} · Langkah ${m.id} dari ${items.length} · ${sholat.sub[idx]}` : `Gerakan ${m.id} dari ${items.length}`}</span>
                {!sholat && done && <span className="flex items-center gap-1 rounded-full bg-amber-300 px-2 py-0.5 text-amber-900"><Star className="h-3 w-3 fill-amber-600 text-amber-600" /> Selesai</span>}
              </div>
              <h1 className="truncate font-display text-xl font-bold drop-shadow-sm sm:text-2xl">{m.title}</h1>
              <div className="mt-1 flex gap-1" aria-hidden>
                {items.map((x, j) => (
                  <span key={j} className={`h-1.5 flex-1 rounded-full ${j === idx ? 'bg-white' : (sholat ? j < idx : app.completed.includes(x.slug)) ? 'bg-amber-300' : 'bg-white/30'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-emerald-100 px-2 pt-2" role="tablist">
            {TABS.filter((x) => x.id !== 'lengkap' || m.extra).map(({ id, label, icon: Icon }) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => { play('click'); setTab(id); }}
                className={`flex shrink-0 items-center gap-1 rounded-t-xl px-2.5 py-1.5 font-display text-xs font-semibold sm:text-sm ${tab === id ? 'bg-emerald-500 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <Slides key={`${idx}-${tab}-${showLatin}`} className="grid content-start gap-2 p-3" items={
              tab === 'bacaan' ? [
                ...bacaanItems(m, 'b', { latin: showLatin, besar: true }).toSpliced(potong(m.arabic, 60).length, 0,
                  <button key="latin" onClick={() => { play('click'); setShowLatin((v) => !v); }}
                    className="flex items-center gap-1 justify-self-end rounded-lg px-2 py-0.5 text-xs font-semibold text-sky-600 hover:bg-sky-100">
                    {showLatin ? <><EyeOff className="h-4 w-4" /> Sembunyikan Latin (latih hafalan)</> : <><Eye className="h-4 w-4" /> Tampilkan Teks Latin</>}
                  </button>),
                <p key="tip" className="flex gap-1.5 rounded-2xl border-2 border-dashed border-amber-200 px-3 py-1.5 text-sm leading-snug text-amber-900"><Sparkles className="h-4 w-4 shrink-0 text-amber-500" />{m.tip}</p>,
              ]
              : tab === 'cara' ? m.steps.map((st, i) => (
                <motion.div key={st} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}
                  className="flex gap-2.5 rounded-2xl bg-emerald-50/70 px-3 py-2 leading-snug text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-display text-sm font-bold text-white">{i + 1}</span>
                  {st}
                </motion.div>
              ))
              : tab === 'perhatikan' ? [
                ...m.notes.map((n, i) => (
                  <motion.div key={n} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}
                    className="flex gap-2 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 px-3 py-2 leading-snug text-amber-950">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />{n}
                  </motion.div>
                )),
                <p key="tip" className="flex gap-2 rounded-2xl bg-sky-50 px-3 py-2 text-sm leading-snug text-sky-900"><Sparkles className="h-4 w-4 shrink-0 text-amber-500" />{m.tip}</p>,
              ]
              : (m.extra ?? []).flatMap((r, i) => bacaanItems(r, `x${i}`, { latin: showLatin }))
            } />
          </div>

          <div className="flex shrink-0 gap-2 border-t border-emerald-100 bg-gradient-to-b from-white to-emerald-50/60 p-3 items-center">
            <AudioPlayer material={m} character={app.character} />
            <button onClick={finish} className="btn-3d border-emerald-700 bg-emerald-500 flex-1 py-2.5 text-base text-white">
              <CheckCircle2 className="h-6 w-6" /> {sholat ? (next ? 'Lanjut ➜' : 'Selesai Sholat') : done ? 'Sudah ★ Lanjut' : 'Selesai & Lanjut'}
            </button>
          </div>
        </motion.section>
      </div>

      <div className="mx-auto h-[104px] w-full max-w-5xl shrink-0 sm:h-[132px] lg:h-[112px]">
        <CoverflowSlider items={items} index={idx} onChange={go} onSelect={go} character={app.character} completed={sholat ? [] : app.completed} />
      </div>

      <StarCelebration open={!!party} character={app.character}
        title={party === 'sholat' ? `Sholat ${sholat?.name} Selesai!` : party === 'new' ? 'Kamu Dapat 1 Bintang!' : 'Hebat Sekali!'}
        message={party === 'sholat' ? `Alhamdulillah! Kamu sudah mempelajari ${items.length} langkah sholat ${sholat?.name}${sholat?.rakaat ? ` (${sholat.rakaat} rakaat)` : ''} dari niat sampai salam.`
          : next ? `Kamu sudah belajar ${m.title}. Lanjut ke ${next.title}?` : 'Semua gerakan sholat sudah kamu pelajari. Ayo uji di Kuis Seru!'}>
        {party === 'sholat' ? (
          <>
            <button onClick={() => { play('click'); setParty(null); router.push(sholat?.back ?? '/belajar/fardhu'); }} className="btn-3d border-amber-600 bg-amber-400 px-4 py-2.5 text-amber-950">{sholat?.back ? 'Pilih Sholat Lain' : 'Pilih Waktu Lain'}</button>
            <button onClick={() => { play('click'); setParty(null); router.push('/kuis'); }} className="btn-3d border-emerald-700 bg-emerald-500 px-5 py-2.5 text-white">Ke Kuis Seru ➜</button>
          </>
        ) : (
          <>
            <button onClick={() => { play('click'); setParty(null); }} className="btn-3d border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-600">Ulangi</button>
            <button onClick={() => { play('click'); setParty(null); router.push(next ? `/belajar/${next.slug}` : '/kuis'); }} className="btn-3d border-emerald-700 bg-emerald-500 px-5 py-2.5 text-white">
              {next ? 'Lanjut ➜' : 'Ke Kuis Seru ➜'}
            </button>
          </>
        )}
      </StarCelebration>
    </div>
  );
}
