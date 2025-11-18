begin;

create table if not exists public.belt_levels (
  id uuid primary key default gen_random_uuid(),
  color text not null,
  rank int not null,
  requirements jsonb not null default '[]'::jsonb,
  min_age int,
  min_sessions int,
  next_level_id uuid references public.belt_levels(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists belt_levels_rank_key on public.belt_levels(rank);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  belt_level_id uuid not null references public.belt_levels(id) on delete cascade,
  status text not null check (status in ('needs_work','ready','passed','deferred')) default 'needs_work',
  assessment_date date,
  coach_notes text,
  evidence_media_urls text[] not null default '{}',
  assessed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, belt_level_id)
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists belt_levels_touch on public.belt_levels;
create trigger belt_levels_touch
before update on public.belt_levels
for each row execute procedure public.touch_updated_at();

drop trigger if exists student_progress_touch on public.student_progress;
create trigger student_progress_touch
before update on public.student_progress
for each row execute procedure public.touch_updated_at();

alter table public.belt_levels enable row level security;
alter table public.student_progress enable row level security;

drop policy if exists "Admins manage belt levels" on public.belt_levels;
create policy "Admins manage belt levels"
  on public.belt_levels
  for all
  using (
    auth.uid() in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

drop policy if exists "Admins manage student progress" on public.student_progress;
create policy "Admins manage student progress"
  on public.student_progress
  for all
  using (
    auth.uid() in (
      select id from auth.users
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

insert into public.belt_levels (color, rank, requirements, min_age, min_sessions)
values
  ('White', 1, '[{"focus":"Basics","techniques":["Stance","Guard"]}]', 5, 0),
  ('Yellow', 2, '[{"focus":"Kicks","techniques":["Front Kick","Side Kick"]}]', 7, 12),
  ('Orange', 3, '[{"focus":"Combinations","techniques":["1-2-3","Parry & Counter"]}]', 8, 24),
  ('Green', 4, '[{"focus":"Defense","techniques":["Blocks","Footwork"]}]', 9, 40),
  ('Blue', 5, '[{"focus":"Sparring","techniques":["Light Spar","Ring Craft"]}]', 10, 60),
  ('Brown', 6, '[{"focus":"Advanced","techniques":["Feints","Counters"]}]', 12, 90),
  ('Black', 7, '[{"focus":"Mastery","techniques":["Full Spar","Teaching"]}]', 14, 120)
on conflict (rank) do nothing;

commit;
