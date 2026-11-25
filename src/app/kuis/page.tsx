'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, Eye, Lightbulb, ListOrdered, type LucideIcon, RotateCcw, Sparkles, Star, ThumbsUp, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import AnimatedSholatCharacter from '@/components/AnimatedSholatCharacter';
import StarCelebration from '@/components/StarCelebration';
import { BENAR_SALAH, type Material, PINTAR_SHOLAT, type Posture, QUIZ, type TextQuiz } from '@/data/sholatData';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const ROUND = 15; // jumlah soal per ronde

type Q = TextQuiz & { posture?: Posture; view?: 'front' | 'side' | 'back'; arabic?: string; latin?: string; fixed?: boolean };

// Acak urutan pilihan (kecuali Benar/Salah) sambil menjaga indeks jawaban.
const mix = (q: Q): Q => {
  if (q.fixed) return q;
  const o = shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer })));
  return { ...q, options: o.map((x) => x.t), answer: o.findIndex((x) => x.ok) };
};
const round = (pool: Q[]) => shuffle(pool).slice(0, ROUND).map(mix);
const others = (ms: Material[], m: Material) => shuffle(ms.filter((x) => x.slug !== m.slug)).slice(0, 3).map((x) => x.title);

type Game = { id: string; title: string; desc: string; icon: LucideIcon; color: string; ring: string; build?: (ms: Material[]) => Q[] };

const GAMES: Game[] = [
  {
    id: 'tebak', title: 'Tebak Gerakan', desc: 'Lihat gaya Ali & Aisyah, lalu tebak nama gerakannya.', icon: Eye,
    color: 'from-sky-400 to-blue-500', ring: 'ring-sky-200',
    build: (ms) => round([
      ...QUIZ.map((q) => ({ ...q, explain: ms.find((m) => m.slug === q.posture)?.tip ?? '' })),
      // soal tambahan: pose dari sudut acak
      ...ms.map((m) => ({
        question: 'Gerakan apakah ini?', posture: m.slug, view: shuffle(['front', 'side', 'back'] as const)[0],
        options: [m.title, ...others(ms, m)], answer: 0, explain: m.tip,
      })),
    ]),
  },
  {
    id: 'bacaan', title: 'Cocokkan Bacaan', desc: 'Baca teks Arabnya, pilih gerakan yang tepat.', icon: BookOpen,
    color: 'from-amber-400 to-orange-500', ring: 'ring-amber-200',
    // Takbir dilewati: "Allahu Akbar" juga diucapkan saat pindah gerakan, jadi jawabannya bisa ganda.
    build: (ms) => round([
      ...ms.filter((m) => m.slug !== 'takbir').map((m) => ({
        question: 'Bacaan ini dibaca saat gerakan apa?', arabic: m.arabic, latin: m.latin,
        options: [m.title, ...others(ms, m)], answer: 0, explain: `Artinya: ${m.meaning}`,
      })),
      ...ms.map((m) => ({
        question: `Apa bacaan saat ${m.title}?`,
        options: [m.latin, ...shuffle(ms.filter((x) => x.slug !== m.slug)).slice(0, 3).map((x) => x.latin)], answer: 0,
        explain: `${m.latin} Artinya: ${m.meaning}`,
      })),
      ...ms.map((m) => ({
        question: 'Apa arti bacaan ini?', arabic: m.arabic, latin: m.latin,
        options: [m.meaning, ...shuffle(ms.filter((x) => x.slug !== m.slug)).slice(0, 3).map((x) => x.meaning)], answer: 0,
        explain: `Bacaan ini dibaca saat ${m.title}.`,
      })),
    ]),
  },
  {
    id: 'urut', title: 'Susun Urutan', desc: 'Susun 8 gerakan sholat dari niat sampai salam.', icon: ListOrdered,
    color: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-200',
  },
  {
    id: 'pintar', title: 'Pintar Sholat', desc: 'Rakaat, waktu sholat, wudhu, kiblat, dan lainnya.', icon: Lightbulb,
    color: 'from-violet-400 to-purple-500', ring: 'ring-violet-200', build: () => round(PINTAR_SHOLAT),
  },
  {
    id: 'benar', title: 'Benar atau Salah?', desc: 'Tentukan apakah pernyataannya benar atau salah.', icon: ThumbsUp,
    color: 'from-pink-400 to-rose-500', ring: 'ring-pink-200', build: () => round(BENAR_SALAH.map((q) => ({ ...q, fixed: true }))),
  },
];

// Karakter pemberi semangat dengan balon ucapan
function Buddy({ mood, jump, text }: { mood: 'idle' | 'happy' | 'sad'; jump: number; text: string }) {
  const app = useApp();
  return (
    <div className="flex min-h-0 items-end gap-2">
      <div className="h-full min-h-[90px] w-24 shrink-0 sm:w-28">
        <AnimatedSholatCharacter posture={mood === 'happy' ? 'sapa' : 'niat'} character={app.character} jumpKey={jump} className="h-full" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={text} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
          className={`mb-6 rounded-3xl px-4 py-2 font-display text-lg font-bold shadow-md ${mood === 'happy' ? 'bg-emerald-100 text-emerald-700' : mood === 'sad' ? 'bg-rose-100 text-rose-600' : 'bg-white text-sky-700'}`}>
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EndButtons({ restart, back }: { restart: () => void; back: () => void }) {
  return (
    <>
      <button onClick={() => { play('click'); restart(); }} className="btn-3d border-amber-600 bg-amber-400 px-4 py-2.5 text-amber-950"><RotateCcw className="h-5 w-5" /> Main Ulang</button>
      <button onClick={() => { play('click'); back(); }} className="btn-3d border-emerald-700 bg-emerald-500 px-4 py-2.5 text-white"><Trophy className="h-5 w-5" /> Pilih Game Lain</button>
    </>
  );
}

// Satu mesin pilihan ganda untuk semua game soal. Kunci jawaban & penjelasan baru dibuka di Pembahasan setelah semua soal dijawab.
function PilihanGanda({ game, back }: { game: Game; back: () => void }) {
  const app = useApp();
  const [qs, setQs] = useState(() => game.build!(app.materials));
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<'play' | 'done' | 'review'>('play');
  const [jump, setJump] = useState(0);
  const q = qs[qi];
  const Icon = game.icon;
  const score = answers.filter((a, i) => a === qs[i].answer).length;
  const nilai = Math.round((score / qs.length) * 100);

  const answer = (i: number) => {
    if (answers.length > qi) return; // sudah dijawab, menunggu pindah soal
    const all = [...answers, i];
    play('pop');
    setJump((j) => j + 1);
    setAnswers(all);
    // jeda singkat agar pilihan terlihat, lalu pindah soal / selesai
    setTimeout(() => {
      if (qi + 1 < qs.length) return setQi(qi + 1);
      const benar = all.filter((a, k) => a === qs[k].answer).length;
      app.addStars(benar);
      app.recordQuiz(game.id, Math.round((benar / qs.length) * 100));
      setPhase('done');
    }, 650);
  };

  const restart = () => { setQs(game.build!(app.materials)); setQi(0); setAnswers([]); setPhase('play'); };

  if (phase === 'review') return <Pembahasan qs={qs} answers={answers} score={score} nilai={nilai} restart={restart} back={back} />;

  const picked = answers[qi];
  return (
    <>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1">
        <section className="flex min-h-0 flex-col rounded-3xl bg-white/80 p-3 shadow-xl ring-1 ring-white backdrop-blur">
          <div className="flex items-center gap-1.5">
            {qs.map((_, i) => (
              <span key={i} className={`h-2.5 flex-1 rounded-full ${i < answers.length ? 'bg-sky-400' : i === qi ? 'bg-amber-400' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {q.posture ? (
              <AnimatedSholatCharacter key={qi} posture={q.posture} character={app.character} mode={q.view} still className="h-full w-full" />
            ) : q.arabic ? (
              <motion.div key={qi} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-full rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center ring-2 ring-amber-200">
                <p className="arabic text-2xl leading-[1.9] text-slate-800 sm:text-3xl">{q.arabic}</p>
                <p className="mt-1 text-sm italic text-amber-800 sm:text-base">{q.latin}</p>
              </motion.div>
            ) : (
              <motion.div key={qi} initial={{ rotate: -12, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className={`flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br ${game.color} text-white shadow-xl sm:h-36 sm:w-36`}>
                <Icon className="h-14 w-14 sm:h-20 sm:w-20" />
              </motion.div>
            )}
          </div>
          <div className="hidden sm:block"><Buddy mood={picked != null ? 'happy' : 'idle'} jump={jump} text={picked != null ? 'Oke, jawaban disimpan!' : 'Pilih jawabanmu, ya!'} /></div>
        </section>
        <section className="scroll-soft flex min-h-0 flex-col gap-3 overflow-y-auto rounded-3xl bg-white p-3 shadow-xl sm:p-4">
          <div className="flex items-center justify-between font-display text-sm font-semibold text-slate-400">
            <span>Soal {qi + 1} dari {qs.length}</span>
            <span>Kunci jawaban ada di akhir 🔒</span>
          </div>
          <motion.h2 key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-lg font-bold text-slate-700 sm:text-2xl">{q.question}</motion.h2>
          <div className={`grid content-start gap-3 ${q.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {q.options.map((o, i) => {
              const tf = q.options.length === 2, mine = picked === i;
              return (
                <motion.button key={`${qi}-${i}`} onClick={() => answer(i)} animate={mine ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 0.35 }}
                  className={`btn-3d px-3 py-3 text-base sm:text-lg ${tf ? 'min-h-[88px] text-xl' : 'min-h-[60px]'} ${mine ? 'border-amber-600 bg-amber-400 text-amber-950'
                    : picked != null ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : tf ? (i === 0 ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100')
                    : 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'}`}>
                  {o}
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
      <StarCelebration open={phase === 'done'} character={app.character} stars={score}
        title={`Nilaimu ${nilai}!`} message={`Benar ${score} dari ${qs.length} soal, kamu dapat ${score} bintang. Yuk lihat pembahasannya!`}
        speech={nilai >= 80 ? 'Luar biasa! Kamu hebat sekali!' : 'Bagus! Ayo terus belajar!'}>
        <button onClick={() => { play('click'); setPhase('review'); }} className="btn-3d border-sky-700 bg-sky-500 px-4 py-2.5 text-white"><Eye className="h-5 w-5" /> Lihat Pembahasan</button>
        <EndButtons restart={restart} back={back} />
      </StarCelebration>
    </>
  );
}

// Pembahasan: jawaban siswa, kunci jawaban, dan penjelasan setiap soal.
function Pembahasan({ qs, answers, score, nilai, restart, back }: { qs: Q[]; answers: number[]; score: number; nilai: number; restart: () => void; back: () => void }) {
  const app = useApp();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-white p-3 shadow-xl">
        <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-white shadow ${nilai >= 80 ? 'bg-emerald-500' : nilai >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}>
          <span className="text-[10px] font-semibold uppercase">Nilai</span><span className="font-display text-2xl font-bold leading-none">{nilai}</span>
        </div>
        <h2 className="font-display text-xl font-bold text-slate-700">Pembahasan</h2>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-display font-bold text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-500" /> Benar {score} dari {qs.length}</span>
        <div className="ml-auto flex flex-wrap gap-2"><EndButtons restart={restart} back={back} /></div>
      </div>
      <div className="scroll-soft grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pb-1 md:grid-cols-2">
        {qs.map((q, i) => {
          const ok = answers[i] === q.answer;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className={`flex gap-3 rounded-3xl bg-white p-3 shadow-md ring-2 ${ok ? 'ring-emerald-200' : 'ring-rose-200'}`}>
              {q.posture && <div className="h-24 w-16 shrink-0 rounded-2xl bg-sky-50"><AnimatedSholatCharacter posture={q.posture} character={app.character} mode={q.view} still className="h-full" /></div>}
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}>{ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
                  <span className="font-display font-semibold text-slate-400">Soal {i + 1}</span>
                </div>
                <p className="mt-1 font-display text-base font-bold text-slate-700">{q.question}</p>
                {q.arabic && <p className="arabic text-xl text-slate-800">{q.arabic}</p>}
                <p className="mt-1">Jawabanmu: <b className={ok ? 'text-emerald-700' : 'text-rose-600'}>{q.options[answers[i]]}</b></p>
                {!ok && <p>Jawaban benar: <b className="text-emerald-700">{q.options[q.answer]}</b></p>}
                <p className="mt-1.5 flex gap-1.5 rounded-xl bg-emerald-50 px-2 py-1.5 text-emerald-900"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{q.explain}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SusunUrutan({ back }: { back: () => void }) {
  const app = useApp();
  const [pool, setPool] = useState<Material[]>(() => shuffle(app.materials));
  const [placed, setPlaced] = useState<Material[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [jump, setJump] = useState(0);
  const done = placed.length === app.materials.length;

  const pick = (m: Material) => {
    if (m.id === placed.length + 1) {
      const np = [...placed, m];
      setPlaced(np);
      setPool((p) => p.filter((x) => x.slug !== m.slug));
      setJump((j) => j + 1);
      if (np.length === app.materials.length) {
        app.addStars(3);
        app.recordQuiz('urut', Math.max(0, 100 - mistakes * 10));
        setTimeout(() => play('fanfare'), 100);
      } else play('correct');
    } else {
      setShake(m.slug);
      setMistakes((x) => x + 1);
      play('wrong');
      setTimeout(() => setShake(null), 450);
    }
  };
  const restart = () => { setPool(shuffle(app.materials)); setPlaced([]); setMistakes(0); };
  const text = done ? 'Urutannya benar semua!' : shake ? 'Coba Lagi Yuk!' : `Gerakan ke-${placed.length + 1} apa, ya?`;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <section className="rounded-3xl bg-white/80 p-2 shadow-xl ring-1 ring-white backdrop-blur sm:p-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {app.materials.map((_, i) => {
              const m = placed[i];
              return (
                <div key={i} className={`relative flex aspect-[4/5] max-h-[22vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed ${m ? 'border-emerald-300 bg-emerald-50' : i === placed.length ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white/60'}`}>
                  <span className="absolute left-1.5 top-1 font-display text-sm font-bold text-slate-400">{i + 1}</span>
                  {m && (
                    <motion.div layoutId={m.slug} className="flex h-full w-full flex-col">
                      <div className="min-h-0 flex-1"><AnimatedSholatCharacter posture={m.slug} character={app.character} mode="side" still className="h-full" /></div>
                      <span className="truncate text-center font-display text-xs font-semibold text-emerald-700">{m.shortTitle}</span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="grid min-h-0 grid-cols-4 content-start gap-2 rounded-3xl bg-white p-2 shadow-xl sm:p-3">
            {pool.map((m) => (
              <motion.button key={m.slug} layoutId={m.slug} onClick={() => pick(m)}
                animate={shake === m.slug ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}
                whileHover={{ y: -4 }} whileTap={{ scale: 0.94 }}
                className={`flex aspect-[4/5] max-h-[22vh] flex-col overflow-hidden rounded-2xl bg-sky-50 ring-2 ${shake === m.slug ? 'ring-rose-400' : 'ring-sky-200'}`}>
                <div className="min-h-0 flex-1"><AnimatedSholatCharacter posture={m.slug} character={app.character} mode="side" still className="h-full" /></div>
                <span className="truncate px-1 text-center font-display text-xs font-semibold text-sky-800 sm:text-sm">{m.shortTitle}</span>
              </motion.button>
            ))}
          </section>
          <section className="hidden min-h-0 flex-col justify-end rounded-3xl bg-white/70 p-3 lg:flex">
            <Buddy mood={shake ? 'sad' : placed.length ? 'happy' : 'idle'} jump={jump} text={text} />
            <p className="mt-2 text-center text-sm text-slate-500">Salah pilih: {mistakes}</p>
          </section>
        </div>
      </div>
      <StarCelebration open={done} character={app.character} stars={3} title="Urutan Sholat Benar!" message={`Hebat! Kamu menyusun 8 gerakan dengan ${mistakes} kali salah pilih. +3 bintang!`}>
        <EndButtons restart={restart} back={back} />
      </StarCelebration>
    </>
  );
}

function Dashboard({ pick }: { pick: (g: Game) => void }) {
  const app = useApp();
  const played = GAMES.filter((g) => app.games[g.id] != null).length;
  return (
    <div className="scroll-soft flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
      <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 p-3 text-white shadow-xl sm:p-4">
        <div className="h-20 w-16 shrink-0 sm:h-24 sm:w-20"><AnimatedSholatCharacter posture="sapa" character={app.character} className="h-full" /></div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold drop-shadow sm:text-3xl">Arena Kuis Sholat</h1>
          <p className="text-sm text-emerald-50 sm:text-base">Pilih game favoritmu, kumpulkan bintang, dan jadi juara sholat!</p>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <div className="rounded-2xl bg-white/20 px-3 py-2 text-center ring-1 ring-white/40">
            <div className="flex items-center justify-center gap-1 font-display text-2xl font-bold"><Star className="h-5 w-5 fill-amber-300 text-amber-300" />{app.stars}</div>
            <div className="text-xs">Bintang</div>
          </div>
          <div className="rounded-2xl bg-white/20 px-3 py-2 text-center ring-1 ring-white/40">
            <div className="font-display text-2xl font-bold">{played}/{GAMES.length}</div>
            <div className="text-xs">Game dimainkan</div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => {
          const best = app.games[g.id];
          const Icon = g.icon;
          return (
            <motion.button key={g.id} onClick={() => { play('click'); pick(g); }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }}
              className={`group flex items-center gap-3 overflow-hidden rounded-3xl bg-white p-3 text-left shadow-lg ring-2 ${g.ring} sm:flex-col sm:items-stretch sm:p-0`}>
              <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${g.color} text-white sm:h-20 sm:w-auto sm:rounded-none`}>
                <Icon className="h-9 w-9 transition-transform group-hover:scale-125 group-hover:-rotate-6 sm:h-11 sm:w-11" />
                {best != null && (
                  <span className="absolute right-2 top-2 hidden items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-display text-xs font-bold text-amber-600 sm:flex">
                    <Trophy className="h-3.5 w-3.5" /> {best}%
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 sm:p-3 sm:pt-0">
                <h2 className="font-display text-lg font-bold text-slate-700">{g.title}</h2>
                <p className="text-sm text-slate-500">{g.desc}</p>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{g.build ? `${ROUND} soal acak` : '8 gerakan'}</span>
                  {best != null && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 sm:hidden">Terbaik {best}%</span>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function KuisPage() {
  const [game, setGame] = useState<Game | null>(null);
  const back = () => setGame(null);
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-2 px-2 pb-2 pt-2 sm:gap-3 sm:px-4">
      {game ? (
        <>
          <div className="flex items-center gap-2">
            <button onClick={() => { play('click'); back(); }} className="btn-3d border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" /> Pilih Game</button>
            <h1 className={`rounded-2xl bg-gradient-to-r ${game.color} px-3 py-1.5 font-display text-base font-bold text-white shadow sm:text-lg`}>{game.title}</h1>
          </div>
          {game.build ? <PilihanGanda key={game.id} game={game} back={back} /> : <SusunUrutan back={back} />}
        </>
      ) : <Dashboard pick={setGame} />}
    </div>
  );
}
