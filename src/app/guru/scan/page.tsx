'use client';
import { createClient, type Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// HP guru: login sekali (sesi tersimpan di HP), lalu setiap scan cukup tap "Buka Mode Guru".
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = url && anon ? createClient(url, anon) : null;

const input = 'w-full rounded-2xl border-2 border-violet-200 px-3 py-2 outline-none focus:border-violet-400';

export default function ScanPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- query string hanya ada di browser
    setId(new URLSearchParams(location.search).get('id'));
    sb?.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb) return;
    setBusy(true); setMsg('');
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass });
    setBusy(false);
    if (error) return setMsg('Email atau kata sandi salah.');
    setSession(data.session); setPass('');
  };

  const approve = async () => {
    if (!session || !id) return;
    setBusy(true); setMsg('');
    const r = await fetch('/api/guru/approve', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id }),
    }).catch(() => null);
    setBusy(false);
    if (r?.ok) return setDone(true);
    if (r?.status === 401) { await sb?.auth.signOut(); setSession(null); }
    setMsg((await r?.json().catch(() => null))?.error ?? 'Gagal terhubung ke server.');
  };

  const logout = async () => { await sb?.auth.signOut(); setSession(null); };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-center font-display text-2xl font-bold text-violet-700">Buka Mode Guru</h1>
        {!sb ? <p className="text-sm text-rose-500">Supabase belum diatur.</p>
          : !id ? <p className="text-sm text-slate-600">Scan QR yang tampil di layar Mode Guru.</p>
          : done ? <p className="text-center font-semibold text-emerald-600">Mode Guru sudah terbuka di layar kelas.</p>
          : session ? (
            <>
              <p className="text-sm text-slate-600">Masuk sebagai <b>{session.user.email}</b></p>
              <button onClick={approve} disabled={busy} className="btn-3d border-violet-700 bg-violet-500 py-2.5 text-white disabled:opacity-60">Buka Mode Guru</button>
              <button onClick={logout} className="text-sm text-slate-500 underline">Ganti akun</button>
            </>
          ) : (
            <form onSubmit={login} className="flex flex-col gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email guru" aria-label="Email guru" autoComplete="username" className={input} />
              <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Kata sandi" aria-label="Kata sandi" autoComplete="current-password" className={input} />
              <button disabled={busy} className="btn-3d border-violet-700 bg-violet-500 py-2.5 text-white disabled:opacity-60">Masuk</button>
            </form>
          )}
        {msg && <p className="text-sm font-semibold text-rose-500">{msg}</p>}
      </div>
    </div>
  );
}
