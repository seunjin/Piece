
create table if not exists public.projects (
  id uuid not null default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint projects_pkey primary key (id)
);

-- Add RLS policies (optional for now but good practice)
alter table public.projects enable row level security;

create policy "Allow all access for now"
on public.projects
for all
using (true)
with check (true);
