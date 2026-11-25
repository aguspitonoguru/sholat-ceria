'use client';
import { motion } from 'framer-motion';
import { BookText, Check, LogOut, Mic, Play, Plus, RotateCcw, Square, Star, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { CODE_RE } from '@/components/JoinClassModal';
import { MATERIALS, type Material, type StudentRecord } from '@/data/sholatData';
import { deleteRecording, getRecording, saveRecording } from '@/lib/recordings';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

function KelasNilai() {
  const app = useApp();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [remote, setRemote] = useState<StudentRecord[]>([]);

  // Data dari Supabase (jika sudah diatur) digabung dengan data perangkat ini.
  useEffect(() => {
    fetch('/api/progress').then((r) => (r.ok ? r.json() : [])).then((d) => Array.isArray(d) && setRemote(d)).catch(() => {});
  }, []);

  const all = [...remote, ...app.students.filter((s) => !remote.some((r) => r.name === s.name && r.classCode === s.classCode))];
  const rows = (filter === 'ALL' ? all : all.filter((s) => s.classCode === filter)).sort((a, b) => b.stars - a.stars);
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.quizScore, 0) / rows.length) : 0;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!CODE_RE.test(c)) return setErr('Gunakan huruf, angka, dan strip (3–20 karakter). Contoh: SHOLAT-3A');
    if (app.classes.some((k) => k.code === c)) return setErr('Kode kelas sudah ada.');
    app.update((s) => ({ classes: [...s.classes, { code: c, name: name.trim() || c }] }));
    play('correct');
    setCode(''); setName(''); setErr('');
  };

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 lg:grid-cols-[320px_minmax(0,1fr)] lg:grid-rows-1">
      <form onSubmit={add} className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-lg">
        <h3 className="font-display text-lg font-bold text-violet-700">Buat Kode Kelas</h3>
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(''); }} maxLength={20} placeholder="SHOLAT-3A" aria-label="Kode kelas"
          className="rounded-2xl border-2 border-violet-200 px-3 py-2 font-display uppercase tracking-wider outline-none focus:border-violet-400" />
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Nama kelas (mis. Kelas 3A)" aria-label="Nama kelas"
          className="rounded-2xl border-2 border-violet-200 px-3 py-2 outline-none focus:border-violet-400" />
        {err && <p className="text-sm font-semibold text-rose-500">{err}</p>}
        <button className="btn-3d border-violet-700 bg-violet-500 py-2.5 text-white"><Plus className="h-5 w-5" /> Tambah Kelas</button>
        <div className="mt-2 hidden flex-wrap gap-2 lg:flex">
          {app.classes.map((k) => (
            <span key={k.code} className="rounded-xl bg-violet-50 px-2 py-1 text-xs text-violet-700 ring-1 ring-violet-200"><b>{k.code}</b> · {k.name}</span>
          ))}
        </div>
      </form>
      <section className="flex min-h-0 flex-col gap-2 rounded-3xl bg-white p-3 shadow-lg sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', ...app.classes.map((k) => k.code)].map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`rounded-xl px-3 py-1.5 font-display text-sm font-semibold ${filter === c ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {c === 'ALL' ? 'Semua Kelas' : c}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500">{rows.length} siswa · rata-rata kuis <b className="text-violet-700">{avg}</b></span>
        </div>
        <div className="scroll-soft min-h-0 flex-1 overflow-auto rounded-2xl ring-1 ring-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-violet-50 font-display text-violet-800">
              <tr><th className="p-2.5">Nama</th><th className="p-2.5">Kelas</th><th className="p-2.5">Gerakan Selesai</th><th className="p-2.5">Bintang</th><th className="p-2.5">Skor Kuis</th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.classCode}-${s.name}`} className="border-t border-slate-100">
                  <td className="p-2.5 font-semibold">{s.name}</td>
                  <td className="p-2.5 text-slate-500">{s.classCode}</td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(s.completed / 8) * 100}%` }} /></div>
                      {s.completed}/8
                    </div>
                  </td>
                  <td className="p-2.5"><span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{s.stars}</span></td>
                  <td className="p-2.5 font-bold text-violet-700">{s.quizScore}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Belum ada siswa di kelas ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const FIELDS: { key: keyof Material; label: string; area?: boolean; arabic?: boolean }[] = [
  { key: 'title', label: 'Judul Gerakan' },
  { key: 'arabic', label: 'Teks Arab', area: true, arabic: true },
  { key: 'latin', label: 'Teks Latin', area: true },
  { key: 'meaning', label: 'Arti', area: true },
  { key: 'audioAli', label: 'URL Audio suara laki-laki / Ali (.mp3 64–96 kbps, pisahkan spasi bila lebih dari satu)' },
  { key: 'audioAisyah', label: 'URL Audio suara perempuan / Aisyah (.mp3 64–96 kbps)' },
];

function KelolaMateri() {
  const app = useApp();
  const [i, setI] = useState(0);
  const m = app.materials[i];
  const set = (key: keyof Material, value: string) =>
    app.update((s) => ({ materials: s.materials.map((x, k) => (k === i ? { ...x, [key]: value } : x)) }));
  const reset = () => { app.update((s) => ({ materials: s.materials.map((x, k) => (k === i ? MATERIALS[k] : x)) })); play('click'); };

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-1">
      <nav className="flex gap-2 overflow-x-auto rounded-3xl bg-white p-2 shadow-lg lg:flex-col lg:overflow-y-auto">
        {app.materials.map((x, k) => (
          <button key={x.slug} onClick={() => setI(k)} className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-left font-display text-sm font-semibold ${k === i ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${k === i ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-700'}`}>{x.id}</span>
            {x.title}
          </button>
        ))}
      </nav>
      <section className="scroll-soft flex min-h-0 flex-col gap-3 overflow-y-auto rounded-3xl bg-white p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-emerald-700">Edit: {m.title}</h3>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Tersimpan otomatis</span>
          <button onClick={reset} className="ml-auto flex items-center gap-1 rounded-xl px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /> Kembalikan bawaan</button>
        </div>
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-sm font-semibold text-slate-600">
            {f.label}
            {f.area ? (
              <textarea value={String(m[f.key])} onChange={(e) => set(f.key, e.target.value)} rows={f.arabic ? 2 : 2} dir={f.arabic ? 'rtl' : 'ltr'}
                className={`mt-1 w-full resize-none rounded-2xl border-2 border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-400 ${f.arabic ? 'arabic text-2xl' : ''}`} />
            ) : (
              <input value={String(m[f.key])} onChange={(e) => set(f.key, e.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-400" />
            )}
          </label>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <Recorder slug={m.slug} who="ali" />
          <Recorder slug={m.slug} who="aisyah" />
        </div>
      </section>
    </div>
  );
}

// Rekam suara asli guru langsung dari mikrofon (paling alami, tidak robotik).
function Recorder({ slug, who }: { slug: string; who: 'ali' | 'aisyah' }) {
  const key = `${who}/${slug}`;
  const [has, setHas] = useState(false);
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { getRecording(key).then((b) => setHas(!!b)); }, [key]);

  const start = async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mr = new MediaRecorder(stream, { audioBitsPerSecond: 96000 });
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await saveRecording(key, new Blob(chunks, { type: mr.mimeType }));
        setHas(true); setRec(null); play('correct');
      };
      mr.start();
      setRec(mr);
    } catch { setErr('Mikrofon tidak bisa dipakai. Izinkan akses mikrofon di browser.'); }
  };
  const listen = async () => { const b = await getRecording(key); if (b) void new Audio(URL.createObjectURL(b)).play(); };
  const remove = async () => { await deleteRecording(key); setHas(false); };

  return (
    <div className={`rounded-2xl p-3 ring-1 ${who === 'ali' ? 'bg-sky-50 ring-sky-200' : 'bg-pink-50 ring-pink-200'}`}>
      <div className="font-display text-sm font-bold text-slate-700">Rekam suara {who === 'ali' ? 'laki-laki (Ali)' : 'perempuan (Aisyah)'}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {rec ? (
          <button onClick={() => rec.stop()} className="btn-3d border-rose-700 bg-rose-500 px-3 py-1.5 text-sm text-white"><Square className="h-4 w-4 fill-white" /> Selesai Rekam</button>
        ) : (
          <button onClick={start} className="btn-3d border-emerald-700 bg-emerald-500 px-3 py-1.5 text-sm text-white"><Mic className="h-4 w-4" /> {has ? 'Rekam Ulang' : 'Mulai Rekam'}</button>
        )}
        {has && !rec && <button onClick={listen} className="btn-3d border-sky-600 bg-white px-3 py-1.5 text-sm text-sky-700"><Play className="h-4 w-4" /> Putar</button>}
        {has && !rec && <button onClick={remove} className="btn-3d border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-500"><Trash2 className="h-4 w-4" /> Hapus</button>}
      </div>
      {rec && <p className="mt-1 animate-pulse text-xs font-semibold text-rose-600">● Merekam...</p>}
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
      <p className="mt-1 text-xs text-slate-500">Tersimpan di browser ini dan langsung dipakai tombol Dengarkan Bacaan.</p>
    </div>
  );
}

// Mode Guru terkunci sampai QR di layar ini di-scan dan disetujui HP guru yang sudah login.
function Gerbang({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<{ ok?: boolean; id?: string | null; error?: string }>({});
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let alive = true;
    const tick = async () => {
      let r = await fetch('/api/guru').then((x) => x.json()).catch(() => ({ error: 'Gagal terhubung ke server' }));
      if (!r.ok && !r.id && !r.error) r = await fetch('/api/guru', { method: 'POST' }).then((x) => x.json()).catch(() => ({ error: 'Gagal membuat QR' }));
      if (!alive) return;
      setSt(r);
      if (!r.ok) timer = setTimeout(tick, r.error ? 10000 : 2000);
    };
    void tick();
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  // shortcut: di `next dev` tanpa Supabase gerbang dilewati agar frontend bisa dikerjakan; production tetap terkunci.
  if (st.ok || (process.env.NODE_ENV === 'development' && st.error === 'Supabase belum diatur')) return children;
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-lg">
        <h1 className="font-display text-2xl font-bold text-violet-700">Mode Guru</h1>
        {st.error ? <p className="text-sm font-semibold text-rose-500">{st.error}</p> : st.id ? (
          <>
            <QRCodeSVG value={`${location.origin}/guru/scan?id=${st.id}`} size={220} className="rounded-xl" />
            <p className="text-sm text-slate-600">Scan QR ini dengan HP guru, lalu masuk dengan akun guru yang sudah terdaftar.</p>
          </>
        ) : <p className="text-sm text-slate-500">Menyiapkan QR...</p>}
      </div>
    </div>
  );
}

export default function GuruPage() {
  return <Gerbang><GuruDashboard /></Gerbang>;
}

function GuruDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'kelas' | 'materi'>('kelas');
  const tabs = [
    { id: 'kelas' as const, label: 'Kelola Kelas & Nilai', icon: Users },
    { id: 'materi' as const, label: 'Kelola Materi Sholat', icon: BookText },
  ];
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 px-2 pb-2 pt-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-white/80 p-2 shadow-lg backdrop-blur">
        <h1 className="px-2 font-display text-xl font-bold text-violet-700">Mode Guru</h1>
        <div className="flex gap-1 rounded-2xl bg-violet-50 p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { play('click'); setTab(id); }} className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-display text-sm font-semibold ${tab === id ? 'text-white' : 'text-violet-700'}`}>
              {tab === id && <motion.span layoutId="guru-tab" className="absolute inset-0 rounded-xl bg-violet-500" />}
              <Icon className="relative h-4 w-4" /><span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => fetch('/api/guru', { method: 'DELETE' }).finally(() => router.push('/'))} className="ml-auto flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
      {tab === 'kelas' ? <KelasNilai /> : <KelolaMateri />}
    </div>
  );
}
