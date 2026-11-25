'use client';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CharacterName } from '@/components/AnimatedSholatCharacter';
import {
  type ClassRoom, type Material, type StudentRecord,
  DEFAULT_CLASSES, DEMO_STUDENTS, MATERIALS,
} from '@/data/sholatData';
import { setMuted } from '@/lib/sound';

const KEY = 'sholat-ceria-v1';

type State = {
  character: CharacterName;
  stars: number;
  completed: string[];
  studentName: string;
  classCode: string;
  muted: boolean;
  quizBest: number; // persen, terbaik dari semua game
  games: Record<string, number>; // skor terbaik (persen) per game kuis
  materials: Material[];
  classes: ClassRoom[];
  students: StudentRecord[];
};

const INITIAL: State = {
  character: 'ali', stars: 0, completed: [], studentName: '', classCode: '', muted: false, quizBest: 0, games: {},
  materials: MATERIALS, classes: DEFAULT_CLASSES, students: DEMO_STUDENTS,
};

// Belum masuk kelas = tamu: progres (bintang, gerakan selesai, kuis) hanya untuk sesi ini, hilang saat refresh.
const isGuest = (s: State) => !s.studentName || !s.classCode;
const forGuest = (s: State): State => (isGuest(s) ? { ...s, stars: 0, completed: [], quizBest: 0, games: {} } : s);

type Ctx = State & {
  ready: boolean;
  update: (patch: Partial<State> | ((s: State) => Partial<State>)) => void;
  completeStep: (slug: string) => void; // +1 bintang hanya saat pertama kali
  addStars: (n: number) => void;
  recordQuiz: (game: string, percent: number) => void;
};
const AppCtx = createContext<Ctx | null>(null);

// Rekap siswa yang sedang masuk kelas ikut disimpan, lalu dikirim ke /api/progress (Supabase bila sudah diatur).
function syncStudent(s: State): State {
  if (!s.studentName || !s.classCode) return s;
  const rec: StudentRecord = { name: s.studentName, classCode: s.classCode, completed: s.completed.length, stars: s.stars, quizScore: s.quizBest };
  const others = s.students.filter((x) => !(x.name === rec.name && x.classCode === rec.classCode));
  fetch('/api/progress', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(rec) }).catch(() => {});
  return { ...s, students: [...others, rec] };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- baca localStorage hanya bisa setelah mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // hanya kolom yang bisa diedit guru yang diambil dari simpanan; sisanya (langkah, catatan, bacaan lengkap) selalu versi terbaru
        const EDITABLE = ['title', 'arabic', 'latin', 'meaning', 'audioAli', 'audioAisyah'];
        const materials = MATERIALS.map((m, i) => ({
          ...m, ...Object.fromEntries(Object.entries(saved.materials?.[i] ?? {}).filter(([k]) => EDITABLE.includes(k))),
        }));
        setState(forGuest({ ...INITIAL, ...saved, materials }));
      }
    } catch {}
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(forGuest(state))); } catch {}
  }, [state, ready]);
  useEffect(() => setMuted(state.muted), [state.muted]);

  const update = useCallback<Ctx['update']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);
  const completeStep = useCallback((slug: string) => {
    setState((s) => (s.completed.includes(slug) ? s : syncStudent({ ...s, completed: [...s.completed, slug], stars: s.stars + 1 })));
  }, []);
  const addStars = useCallback((n: number) => setState((s) => syncStudent({ ...s, stars: s.stars + n })), []);
  const recordQuiz = useCallback((game: string, p: number) => setState((s) => syncStudent({
    ...s, quizBest: Math.max(s.quizBest, p), games: { ...s.games, [game]: Math.max(s.games[game] ?? 0, p) },
  })), []);

  const value = useMemo(() => ({ ...state, ready, update, completeStep, addStars, recordQuiz }), [state, ready, update, completeStep, addStars, recordQuiz]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp harus di dalam AppProvider');
  return c;
}
