import { db, isGuru } from '@/lib/guru';

// Rekap progres siswa ke tabel Supabase `student_progress`. Tanpa env Supabase: diam saja (data tetap di localStorage).

const CODE_RE = /^[A-Z0-9-]{3,20}$/;
const int = (v: unknown, max: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : null);

export async function POST(req: Request) {
  if (!db) return new Response(null, { status: 204 });
  const b = await req.json().catch(() => null);
  const name = typeof b?.name === 'string' ? b.name.trim().slice(0, 30) : '';
  const classCode = typeof b?.classCode === 'string' ? b.classCode : '';
  const completed = int(b?.completed, 8), stars = int(b?.stars, 100000), quizScore = int(b?.quizScore, 100);
  if (!name || !CODE_RE.test(classCode) || completed === null || stars === null || quizScore === null)
    return Response.json({ error: 'Data tidak valid' }, { status: 400 });
  const { error } = await db.from('student_progress').upsert(
    { name, class_code: classCode, completed, stars, quiz_score: quizScore, updated_at: new Date().toISOString() },
    { onConflict: 'name,class_code' },
  );
  return error ? Response.json({ error: error.message }, { status: 500 }) : new Response(null, { status: 204 });
}

export async function GET() {
  if (!db) return Response.json([]);
  if (!(await isGuru())) return Response.json({ error: 'Khusus Mode Guru' }, { status: 401 });
  const { data, error } = await db.from('student_progress').select('name, class_code, completed, stars, quiz_score').limit(1000);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data.map((r) => ({ name: r.name, classCode: r.class_code, completed: r.completed, stars: r.stars, quizScore: r.quiz_score })));
}
