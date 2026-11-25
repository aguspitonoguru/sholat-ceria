'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, School, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AnimatedSholatCharacter, { type CharacterName } from '@/components/AnimatedSholatCharacter';
import JoinClassModal from '@/components/JoinClassModal';
import { useApp } from '@/lib/store';
import { play, say } from '@/lib/sound';

const LINES: Record<CharacterName, string[]> = {
  ali: ['Assalamu’alaikum! Aku Ali. Yuk belajar sholat bareng!', 'Sholat itu tiang agama, lho!', 'Geser kartu di bawah untuk melihat gerakan sholat!', 'Kumpulkan bintang sebanyak-banyaknya ya!'],
  aisyah: ['Assalamu’alaikum! Aku Aisyah. Senang bertemu kamu!', 'Sebelum sholat, jangan lupa berwudhu ya!', 'Ayo coba Kuis Seru setelah belajar!', 'Sholat tepat waktu itu keren!'],
};

const MENU = [
  { href: '/belajar/wudhu', label: 'Wudhu', emoji: '💧', color: 'from-sky-400 to-sky-600' },
  { href: '/belajar', label: 'Gerakan Sholat', emoji: '🕌', color: 'from-emerald-400 to-emerald-600' },
  { href: '/belajar/panduan', label: 'Panduan', emoji: '📖', color: 'from-violet-400 to-violet-600' },
  { href: '/kuis', label: 'Kuis Seru', emoji: '🎮', color: 'from-amber-400 to-orange-500' },
];

function Hero({ who, onTap, jump }: { who: CharacterName; onTap: () => void; jump: number }) {
  return (
    <motion.button onClick={onTap} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} aria-label={`Sapa ${who === 'ali' ? 'Ali' : 'Aisyah'}`}
      // blend di pembungkus: transform hover/lompat mengisolasi blend video, latar putihnya jadi tampak kotak
      className="relative h-full min-w-0 max-w-[320px] flex-1 rounded-3xl mix-blend-multiply">
      <AnimatedSholatCharacter posture="sapa" character={who} jumpKey={jump} loop className="h-full" />
    </motion.button>
  );
}

export default function Home() {
  const app = useApp();
  const router = useRouter();
  const total = app.materials.length;
  const done = app.materials.filter((m) => app.completed.includes(m.slug)).length;
  const [joinOpen, setJoinOpen] = useState(false);
  const [jump, setJump] = useState({ ali: 0, aisyah: 0 });
  const [line, setLine] = useState<{ who: CharacterName; i: number }>({ who: 'ali', i: 0 });

  const greet = app.studentName ? `Halo ${app.studentName}! ` : '';
  const text = (line.i === 0 ? greet : '') + LINES[line.who][line.i];

  const tap = (who: CharacterName) => {
    play('jump');
    setJump((j) => ({ ...j, [who]: j[who] + 1 }));
    const i = line.who === who ? (line.i + 1) % LINES[who].length : 0;
    setLine({ who, i });
    say(LINES[who][i], who);
  };
  const pick = (who: CharacterName) => {
    play('pop');
    app.update({ character: who });
    setJump((j) => ({ ...j, [who]: j[who] + 1 }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2 pt-2 sm:px-4">
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-rows-[minmax(0,1fr)_auto] gap-3 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-1">
        {/* Panggung hero */}
        <section className="relative flex min-h-0 flex-col">
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={text} initial={{ scale: 0.5, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                className={`relative max-w-md rounded-3xl bg-white px-5 py-3 text-center font-display text-base font-semibold shadow-lg sm:text-xl ${line.who === 'ali' ? 'text-sky-700 ring-2 ring-sky-200' : 'text-pink-600 ring-2 ring-pink-200'}`}>
                {text}
                <span className={`absolute -bottom-2 h-4 w-4 rotate-45 bg-white ${line.who === 'ali' ? 'left-1/4' : 'right-1/4'}`} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex min-h-0 flex-1 items-end justify-center gap-2">
            <Hero who="ali" onTap={() => tap('ali')} jump={jump.ali} />
            <Hero who="aisyah" onTap={() => tap('aisyah')} jump={jump.aisyah} />
          </div>
        </section>

        {/* Pilih teman & aksi */}
        <section className="flex flex-col justify-center gap-3 rounded-3xl bg-white/80 p-3 shadow-xl ring-1 ring-white backdrop-blur sm:p-4">
          <h1 className="hidden text-center font-display text-3xl font-bold text-emerald-600 lg:block">
            Ayo Belajar <span className="text-amber-500">Sholat!</span>
          </h1>
          <p className="text-center font-display font-semibold text-slate-500">Pilih Teman Belajarmu</p>
          <div className="grid grid-cols-2 gap-3">
            {(['ali', 'aisyah'] as CharacterName[]).map((who) => {
              const on = app.character === who;
              return (
                <motion.button key={who} onClick={() => pick(who)} whileTap={{ scale: 0.95 }} aria-pressed={on}
                  className={`relative flex items-center gap-2 rounded-3xl p-2 text-left transition-all ${on ? 'bg-amber-50 ring-4 ring-amber-400 shadow-lg shadow-amber-200' : 'bg-slate-50 ring-2 ring-slate-200'}`}>
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-sky-100">
                    <AnimatedSholatCharacter posture="niat" character={who} still className="h-full" svgClassName="h-[190%] w-full" />
                  </div>
                  <div>
                    <div className={`font-display text-lg font-bold ${who === 'ali' ? 'text-sky-700' : 'text-pink-600'}`}>{who === 'ali' ? 'Ali' : 'Aisyah'}</div>
                    <div className="text-xs text-slate-500">{on ? 'Teman belajarmu ✓' : 'Pilih aku!'}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <motion.button onClick={() => { play('correct'); router.push('/belajar'); }} animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              className="btn-3d border-emerald-700 bg-emerald-500 px-4 py-3 text-lg text-white sm:text-xl">
              <Play className="h-6 w-6 shrink-0 fill-white" /> Mulai Belajar<span className="hidden sm:inline"> Sholat!</span>
            </motion.button>
            <button onClick={() => { play('click'); setJoinOpen(true); }} className="btn-3d border-sky-700 bg-sky-500 px-4 py-3 text-lg text-white">
              <School className="h-6 w-6 shrink-0" /> {app.classCode ? `Kelas ${app.classCode}` : 'Masuk Kelas'}
            </button>
          </div>
        </section>
      </div>

      <div className="mx-auto flex w-full max-w-5xl shrink-0 flex-col gap-2">
        <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-3 py-1.5 shadow-md backdrop-blur">
          <Trophy className="h-6 w-6 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between font-display text-sm font-semibold text-slate-600">
              <span>Petualangan Sholatku</span><span>{done}/{total} gerakan</span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400" initial={{ width: 0 }} animate={{ width: `${(done / total) * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>
          <span className="hidden text-2xl sm:block">{done === total ? '🏆' : done ? '🌱' : '🚀'}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MENU.map(({ href, label, emoji, color }, i) => (
            <motion.button key={href} onClick={() => { play('pop'); router.push(href); }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 * i }}
              whileHover={{ y: -4, rotate: i % 2 ? 2 : -2 }} whileTap={{ scale: 0.92 }}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-3xl bg-gradient-to-br ${color} p-2 font-display font-bold text-white shadow-lg ring-2 ring-white sm:flex-row sm:gap-2`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-center text-xs leading-tight sm:text-base">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
