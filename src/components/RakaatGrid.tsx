'use client';
import Link from 'next/link';
import type { ComponentProps, ReactElement } from 'react';
import AnimatedSholatCharacter from '@/components/AnimatedSholatCharacter';
import type { Langkah } from '@/data/panduanData';
import { play } from '@/lib/sound';

/** Tata letak aliran untuk Slides yang memuat kartu gerakan. Blok lain di aliran ini perlu `col-span-full`. */
export const RAKAAT_FLOW = 'grid grid-cols-3 content-start gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-10';

// Urutan gerakan per rakaat sebagai blok-blok untuk Slides: judul rakaat (selebar penuh) lalu kartu tiap gerakan.
// judul = ganti “Rakaat N” bila sholat tidak dihitung per rakaat.
export function rakaatItems(rakaat: Langkah[][], character: ComponentProps<typeof AnimatedSholatCharacter>['character'], judul?: string) {
  return rakaat.flatMap((items, ri): ReactElement[] => {
    const has = (label: string) => items.some((l) => l.label === label);
    const keras = items.some((l) => l.note?.includes('dibaca keras'));
    return [
      <div key={`r${ri}`} data-lanjut className="col-span-full flex flex-wrap items-center gap-2 pt-1">
        <h3 className="font-display text-lg font-bold text-violet-700">{judul ?? `Rakaat ${ri + 1}`}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${keras ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{keras ? 'Bacaan keras' : 'Bacaan pelan'}</span>
        {!judul && !has('Surah pendek') && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Tanpa surah pendek</span>}
        {has('Tasyahud awal') && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">Ada tasyahud awal</span>}
        {!judul && ri === rakaat.length - 1 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Rakaat terakhir</span>}
      </div>,
      ...items.map((it, i) => (
        <Link key={`r${ri}-${i}`} href={`/belajar/${it.posture}`} onClick={() => play('click')}
          className="flex flex-col overflow-hidden rounded-2xl bg-white shadow ring-1 ring-violet-100 transition hover:-translate-y-1 hover:ring-violet-300">
          <div className="relative h-16 bg-gradient-to-b from-sky-50 to-emerald-50 sm:h-20">
            <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white">{i + 1}</span>
            <AnimatedSholatCharacter posture={it.posture} character={character} mode="side" still className="h-full" />
          </div>
          <span className="px-1 pt-1 text-center font-display text-xs font-semibold leading-tight text-slate-700">{it.label}</span>
          {it.note && <span className="px-1 pb-1.5 text-center text-[10px] leading-tight text-slate-500">{it.note}</span>}
        </Link>
      )),
    ];
  });
}
