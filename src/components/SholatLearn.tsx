'use client';
import { useMemo, useState } from 'react';
import { Lesson } from '@/components/LearnView';
import { buildSholat, type Langkah } from '@/data/panduanData';
import type { Reading } from '@/data/sholatData';
import { useApp } from '@/lib/store';

// Mode sholat: semua langkah satu sholat (fardhu atau sunnah) sesuai niat dan urutan rakaatnya.
// rakaat 0 = tanpa hitungan rakaat (mis. sholat jenazah). query = parameter URL lain yang dipertahankan.
export default function SholatLearn({ w, niat, urutan, query = '', back, start }: {
  w: { name: string; rakaat: number; jahr: number }; niat?: Reading; urutan?: Langkah[][]; query?: string; back?: string; start: number;
}) {
  const app = useApp();
  const { items, sub } = useMemo(() => buildSholat(app.materials, w, { niat, urutan, tanpaRakaat: !w.rakaat }), [app.materials, w, niat, urutan]);
  const [idx, setIdx] = useState(() => Math.min(Math.max(0, start), items.length - 1));
  const go = (i: number) => { setIdx(i); window.history.replaceState(null, '', `?${query}langkah=${i + 1}`); };
  return <Lesson items={items} idx={idx} go={go} sholat={{ name: w.name, rakaat: w.rakaat, sub, back }} />;
}
