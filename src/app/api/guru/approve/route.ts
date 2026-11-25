import { db } from '@/lib/guru';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Dipanggil HP guru (sudah login akun Supabase) setelah scan QR: buka Mode Guru di layar kelas selama 8 jam.
export async function POST(req: Request) {
  if (!db) return Response.json({ error: 'Supabase belum diatur' }, { status: 503 });
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
  const { data: { user } } = token ? await db.auth.getUser(token) : { data: { user: null } };
  if (!user) return Response.json({ error: 'Silakan masuk dengan akun guru' }, { status: 401 });

  const id = (await req.json().catch(() => null))?.id;
  if (typeof id !== 'string' || !UUID_RE.test(id)) return Response.json({ error: 'QR tidak valid' }, { status: 400 });

  const now = new Date();
  const { data } = await db.from('teacher_sessions')
    .update({ approved_by: user.email ?? user.id, expires_at: new Date(now.getTime() + 8 * 3600_000).toISOString() })
    .eq('id', id).is('approved_by', null).gt('expires_at', now.toISOString()).select('id');
  return data?.length ? new Response(null, { status: 204 }) : Response.json({ error: 'QR sudah kedaluwarsa, muat ulang di layar kelas' }, { status: 410 });
}
