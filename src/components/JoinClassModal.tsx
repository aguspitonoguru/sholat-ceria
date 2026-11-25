'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { School, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

export const CODE_RE = /^[A-Z0-9-]{3,20}$/;

// Siswa cukup isi nama panggilan + kode kelas. Tanpa email/password.
export default function JoinClassModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <AnimatePresence>{open && <JoinForm onClose={onClose} />}</AnimatePresence>;
}

function JoinForm({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [name, setName] = useState(app.studentName);
  const [code, setCode] = useState(app.classCode);
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim().slice(0, 30);
    const c = code.trim().toUpperCase();
    if (!n) return setErr('Tulis nama panggilanmu dulu ya.');
    if (!CODE_RE.test(c)) return setErr('Kode kelas hanya huruf, angka, dan tanda strip. Contoh: SHOLAT-3A');
    app.update({ studentName: n, classCode: c });
    app.addStars(0); // simpan rekap siswa ke daftar kelas
    play('correct');
    onClose();
  };

  return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.form onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label="Masuk Kelas"
            initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-4 ring-sky-200">
            <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Tutup"><X className="h-5 w-5" /></button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"><School className="h-8 w-8" /></div>
            <h2 className="mt-2 text-center font-display text-2xl font-bold text-sky-700">Masuk Kelas</h2>
            <p className="text-center text-sm text-slate-500">Minta kode kelas dari Bapak/Ibu Guru ya!</p>
            <label className="mt-4 block font-display text-sm font-semibold text-slate-600">Nama Panggilan
              <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} maxLength={30} placeholder="Contoh: Zahra"
                className="mt-1 w-full rounded-2xl border-2 border-sky-200 px-4 py-3 text-lg outline-none focus:border-sky-400" />
            </label>
            <label className="mt-3 block font-display text-sm font-semibold text-slate-600">Kode Kelas
              <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(''); }} maxLength={20} placeholder="SHOLAT-3A"
                className="mt-1 w-full rounded-2xl border-2 border-sky-200 px-4 py-3 font-display text-lg uppercase tracking-wider outline-none focus:border-sky-400" />
            </label>
            {err && <p className="mt-2 text-sm font-semibold text-rose-500">{err}</p>}
            <button className="btn-3d mt-5 w-full border-emerald-700 bg-emerald-500 py-3 text-lg text-white">Ayo Masuk!</button>
          </motion.form>
        </motion.div>
  );
}
