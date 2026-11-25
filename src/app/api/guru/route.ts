import { cookies } from 'next/headers';
import { COOKIE, db, guruSession } from '@/lib/guru';

const NO_DB = () => Response.json({ error: 'Supabase belum diatur' }, { status: 503 });

// Status layar kelas: ok = sudah disetujui HP guru; id = QR yang masih menunggu scan.
export async function GET() {
  if (!db) return NO_DB();
  const s = await guruSession();
  return Response.json({ ok: !!s?.approved_by, id: s && !s.approved_by ? s.id : null });
}

// Buat QR baru (berlaku 5 menit). Rahasia hanya di cookie httpOnly perangkat ini, QR cuma berisi id.
export async function POST() {
  if (!db) return NO_DB();
  const secret = crypto.randomUUID() + crypto.randomUUID();
  const { data, error } = await db.from('teacher_sessions')
    .insert({ secret, expires_at: new Date(Date.now() + 5 * 60_000).toISOString() }).select('id').single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  (await cookies()).set(COOKIE, secret, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 3600, path: '/' });
  return Response.json({ id: data.id });
}

// Keluar dari Mode Guru di layar kelas.
export async function DELETE() {
  const jar = await cookies();
  const secret = jar.get(COOKIE)?.value;
  if (db && secret) await db.from('teacher_sessions').delete().eq('secret', secret);
  jar.delete(COOKIE);
  return new Response(null, { status: 204 });
}
