'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactElement, useLayoutEffect, useRef, useState } from 'react';
import type { Reading } from '@/data/sholatData';
import { play } from '@/lib/sound';

const NAV = 44; // tinggi bar navigasi slide (h-11)

/**
 * Isi panjang dibagi menjadi beberapa slide sesuai tinggi layar: tanpa scroll dan tanpa diperkecil.
 * items: setiap item SATU elemen DOM (blok). className: tata letak alirannya, mis. 'grid gap-2' atau grid berkolom;
 * item yang harus selebar penuh di grid berkolom diberi `col-span-full`.
 */
export default function Slides({ items, className = 'grid gap-2' }: { items: ReactElement[]; className?: string }) {
  const box = useRef<HTMLDivElement>(null), layer = useRef<HTMLDivElement>(null);
  const [starts, setStarts] = useState<number[]>([0]); // indeks item pertama tiap slide
  const [p, setP] = useState(0);

  // Ukur semua item di lapisan tak terlihat (lebar sama), lalu kemas berurutan ke slide setinggi kotak.
  useLayoutEffect(() => {
    const measure = () => {
      const b = box.current, l = layer.current;
      if (!b || !l) return;
      const cs = getComputedStyle(l), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const els = [...l.children] as HTMLElement[];
      const pack = (h: number) => {
        const st = [0];
        let top = els[0]?.offsetTop ?? 0;
        els.forEach((e, i) => {
          if (i > st[st.length - 1] && e.offsetTop + e.offsetHeight - top > h) {
            // judul (data-lanjut) tidak boleh tertinggal sendirian di akhir slide: ikut pindah ke slide berikutnya
            const j = els[i - 1].dataset.lanjut !== undefined && i - 1 > st[st.length - 1] ? i - 1 : i;
            st.push(j); top = els[j].offsetTop;
          }
        });
        return st;
      };
      let st = pack(b.clientHeight - pad);
      if (st.length > 1) st = pack(b.clientHeight - pad - NAV);
      setStarts((old) => (old.join() === st.join() ? old : st));
    };
    measure();
    document.fonts?.ready.then(measure); // font Arab/display yang baru termuat mengubah tinggi teks
    const ro = new ResizeObserver(measure);
    ro.observe(box.current!);
    return () => ro.disconnect();
  });

  const n = starts.length, cur = Math.min(p, n - 1);
  const go = (i: number) => { if (i >= 0 && i < n && i !== cur) { play('click'); setP(i); } };
  const page = items.slice(starts[cur], starts[cur + 1]);

  return (
    <div ref={box} data-slides={n} className="relative min-h-0 flex-1 overflow-clip">
      <div ref={layer} aria-hidden className={`pointer-events-none invisible absolute inset-x-0 top-0 ${className}`}>{items}</div>
      <motion.div key={`${cur}-${starts[cur]}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className={className}
        drag={n > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
        onDragEnd={(_, info) => { if (info.offset.x < -60) go(cur + 1); else if (info.offset.x > 60) go(cur - 1); }}>
        {page}
      </motion.div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center gap-2">
          <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Slide sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow disabled:bg-slate-200 disabled:text-slate-400"><ChevronLeft className="h-5 w-5" /></button>
          <div className="flex items-center gap-1.5">
            {starts.map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === cur ? 'w-6 bg-emerald-500' : 'w-2.5 bg-emerald-200 hover:bg-emerald-300'}`} />
            ))}
          </div>
          <span className="font-display text-xs font-semibold text-emerald-700">{cur + 1}/{n}</span>
          <button onClick={() => go(cur + 1)} disabled={cur === n - 1} aria-label="Slide berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow disabled:bg-slate-200 disabled:text-slate-400"><ChevronRight className="h-5 w-5" /></button>
        </div>
      )}
    </div>
  );
}

/** Potong teks panjang setelah tanda pemisah (ayat ۝, koma Arab، , titik) menjadi bagian ≤ max huruf. */
export function potong(t: string, max = 140) {
  const out: string[] = [];
  // bagian tanpa tanda pemisah yang masih terlalu panjang dipecah lagi per kata
  const parts = t.split(/(?<=[۝،.!?])\s+/).flatMap((x) => (x.length <= max ? [x] : x.split(/\s+/)));
  for (const x of parts) {
    if (out.length && (out[out.length - 1] + ' ' + x).length <= max) out[out.length - 1] += ' ' + x;
    else out.push(x);
  }
  return out;
}

/** Satu bacaan (niat/doa/surah) sebagai blok-blok kecil agar bisa terbagi rapi ke beberapa slide. */
export function bacaanItems(r: Pick<Reading, 'arabic' | 'latin' | 'meaning'> & { title?: string }, key: string, opt: { latin?: boolean; besar?: boolean } = {}) {
  const items: ReactElement[] = [];
  if (r.title) items.push(<h3 key={`${key}-t`} data-lanjut className="col-span-full font-display font-bold text-amber-700">{r.title}</h3>);
  potong(r.arabic, 60).forEach((a, i) => items.push(
    <p key={`${key}-a${i}`} dir="rtl" className={`arabic col-span-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 px-3 py-1 text-center leading-[1.9] text-slate-800 ring-1 ring-amber-200 ${opt.besar ? 'text-2xl sm:text-3xl lg:text-[1.65rem]' : 'text-xl sm:text-2xl'}`}>{a}</p>,
  ));
  if (opt.latin !== false) potong(r.latin, 150).forEach((l, i) => items.push(
    <p key={`${key}-l${i}`} className="col-span-full rounded-2xl bg-sky-50/70 px-3 py-1.5 italic leading-snug text-sky-800">{l}</p>,
  ));
  potong(r.meaning, 160).forEach((m, i) => items.push(
    <p key={`${key}-m${i}`} className="col-span-full rounded-2xl bg-emerald-50/70 px-3 py-1.5 leading-snug text-slate-700">
      {i === 0 && <b className="font-display text-emerald-700">Artinya: </b>}{m}
    </p>,
  ));
  return items;
}
