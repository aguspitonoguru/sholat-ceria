'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';
import AnimatedSholatCharacter, { type CharacterName } from '@/components/AnimatedSholatCharacter';
import type { Material } from '@/data/sholatData';
import { play } from '@/lib/sound';

type Props = {
  items: Material[];
  index: number;
  onChange: (i: number) => void; // geser (panah, keyboard, swipe)
  onSelect: (i: number) => void; // klik kartu
  character: CharacterName;
  completed?: string[];
};

const look = (abs: number) =>
  abs === 0 ? { scale: 1, opacity: 1 } : abs === 1 ? { scale: 0.82, opacity: 0.8 } : abs === 2 ? { scale: 0.66, opacity: 0.55 } : { scale: 0.55, opacity: 0 };

export default function CoverflowSlider({ items, index, onChange, onSelect, character, completed = [] }: Props) {
  const go = (i: number) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    if (n !== index) { play('slide'); onChange(n); }
  };
  const goRef = useRef(go);
  useEffect(() => { goRef.current = go; });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') goRef.current(index - 1);
      if (e.key === 'ArrowRight') goRef.current(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index]);

  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  return (
    <div className="relative flex h-full items-center gap-1 sm:gap-2">
      <button onClick={() => go(index - 1)} disabled={index === 0} aria-label="Gerakan sebelumnya" className="btn-3d z-20 h-11 w-11 shrink-0 border-emerald-700 bg-emerald-500 text-white">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div
        className="relative h-full min-w-0 flex-1 touch-pan-y select-none overflow-hidden"
        onPointerDown={(e) => { startX.current = e.clientX; swiped.current = false; }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) { swiped.current = true; go(index + (dx < 0 ? 1 : -1)); }
        }}
        onPointerLeave={() => { startX.current = null; }}
      >
        {items.map((m, i) => {
          const off = i - index;
          const abs = Math.abs(off);
          const done = completed.includes(m.slug);
          return (
            <motion.button
              key={i}
              onClick={() => { if (swiped.current) return; play('pop'); onSelect(i); }}
              initial={false}
              animate={{ x: `${-50 + off * 92}%`, ...look(abs) }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{ zIndex: 10 - abs, pointerEvents: abs > 2 ? 'none' : 'auto' }}
              tabIndex={abs > 2 ? -1 : 0}
              aria-label={`Gerakan ${m.id}: ${m.title}`}
              aria-current={abs === 0}
              className={`absolute left-1/2 top-1/2 flex aspect-[4/5] h-[92%] -translate-y-1/2 flex-col overflow-hidden rounded-3xl bg-white text-left shadow-lg ${abs === 0 ? 'ring-4 ring-amber-400 shadow-amber-300/70' : 'ring-1 ring-emerald-100'}`}
            >
              <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 font-display text-xs font-bold text-white">{m.id}</span>
              {done && <Star className="absolute right-2 top-2 z-10 h-6 w-6 fill-amber-400 text-amber-500 drop-shadow" />}
              <div className="min-h-0 flex-1 bg-gradient-to-b from-sky-50 to-emerald-50 pt-3">
                <AnimatedSholatCharacter posture={m.slug} character={character} mode="side" still className="h-full" />
              </div>
              <span className="truncate px-2 py-1 text-center font-display text-xs font-semibold text-emerald-800 sm:text-sm">{m.shortTitle}</span>
            </motion.button>
          );
        })}
      </div>
      <button onClick={() => go(index + 1)} disabled={index === items.length - 1} aria-label="Gerakan berikutnya" className="btn-3d z-20 h-11 w-11 shrink-0 border-emerald-700 bg-emerald-500 text-white">
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
