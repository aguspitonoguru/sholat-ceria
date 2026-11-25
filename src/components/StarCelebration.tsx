'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import AnimatedSholatCharacter, { type CharacterName } from '@/components/AnimatedSholatCharacter';
import { play, say } from '@/lib/sound';

const COLORS = ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#f472b6'];

// Hujan bintang konfeti; acak dibuat saat modal dibuka (bukan saat render server).
function Confetti() {
  const [bits] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      x: (Math.random() - 0.5) * 560, y: -160 - Math.random() * 220, r: Math.random() * 540 - 270,
      s: 0.6 + Math.random() * 0.9, d: Math.random() * 0.25, c: COLORS[i % COLORS.length],
    })),
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {bits.map((b, i) => (
        <motion.div key={i} className="absolute" initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 420], rotate: b.r, scale: b.s, opacity: [1, 1, 0] }}
          transition={{ duration: 2.2, delay: b.d, ease: 'easeOut', times: [0, 0.35, 1] }}>
          <Star className="h-6 w-6" style={{ color: b.c, fill: b.c }} />
        </motion.div>
      ))}
    </div>
  );
}

type Props = {
  open: boolean;
  title: string;
  message: string;
  character: CharacterName;
  stars?: number;
  speech?: string;
  children?: ReactNode; // tombol aksi
};

export default function StarCelebration({ open, title, message, character, stars = 1, speech = 'Hebat! Kamu dapat bintang!', children }: Props) {
  const [jump, setJump] = useState(0);
  useEffect(() => {
    if (!open) return;
    play('fanfare');
    const t1 = setTimeout(() => { setJump((j) => j + 1); play('jump'); }, 250);
    const t2 = setTimeout(() => say(speech, character), 700);
    const t3 = setTimeout(() => setJump((j) => j + 1), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open, speech, character]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Confetti />
          <motion.div role="dialog" aria-modal aria-label={title}
            initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-5 text-center shadow-2xl ring-4 ring-amber-300">
            <div className="mx-auto -mt-2 h-40 w-40">
              <AnimatedSholatCharacter posture="sapa" character={character} jumpKey={jump} loop className="h-full" />
            </div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: Math.min(stars, 10) }, (_, i) => (
                <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.12, type: 'spring' }}>
                  <Star className="h-9 w-9 fill-amber-400 text-amber-500" />
                </motion.span>
              ))}
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-emerald-600">{title}</h2>
            <p className="mt-1 text-slate-600">{message}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
