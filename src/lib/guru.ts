import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Klien server (service role). Tanpa env Supabase: null, aplikasi jalan dengan localStorage saja.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const db = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export const COOKIE = 'guru';

// Sesi layar kelas dari cookie httpOnly; null bila tidak ada / kedaluwarsa.
export async function guruSession() {
  const secret = (await cookies()).get(COOKIE)?.value;
  if (!db || !secret) return null;
  const { data } = await db.from('teacher_sessions').select('id, approved_by')
    .eq('secret', secret).gt('expires_at', new Date().toISOString()).maybeSingle();
  return data;
}

export const isGuru = async () => !!(await guruSession())?.approved_by;
