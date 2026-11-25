-- Jalankan di Supabase SQL Editor.
create table if not exists public.classes (
  code text primary key check (code ~ '^[A-Z0-9-]{3,20}$'),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.student_progress (
  name text not null,
  class_code text not null,
  completed int not null default 0 check (completed between 0 and 8),
  stars int not null default 0 check (stars >= 0),
  quiz_score int not null default 0 check (quiz_score between 0 and 100),
  updated_at timestamptz default now(),
  primary key (name, class_code)
);

create table if not exists public.materials (
  slug text primary key,
  title text not null,
  arabic text not null,
  latin text not null,
  meaning text not null,
  audio_ali text default '',     -- suara laki-laki
  audio_aisyah text default ''   -- suara perempuan
);

-- Sesi Mode Guru via QR: layar kelas membuat baris (secret di cookie), HP guru yang login menyetujui (approved_by).
-- Akun guru dibuat manual di Authentication > Users; matikan "Allow new users to sign up" agar tidak ada pendaftaran umum.
create table if not exists public.teacher_sessions (
  id uuid primary key default gen_random_uuid(),
  secret text not null unique,
  approved_by text,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Akses hanya lewat route handler server (service role). Klien publik tidak bisa baca/tulis langsung.
alter table public.classes enable row level security;
alter table public.student_progress enable row level security;
alter table public.materials enable row level security;
alter table public.teacher_sessions enable row level security;

-- Bucket audio publik untuk mp3 bacaan (64–96 kbps):
-- insert into storage.buckets (id, name, public) values ('audio', 'audio', true) on conflict do nothing;
