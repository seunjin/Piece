-- AI Test Engine Tables

-- 1. Test Samples
create table if not exists public.ai_test_samples (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  raw_input text not null,
  job_title text default 'Developer',
  created_at timestamptz default now()
);

-- 2. Prompt Versions
create table if not exists public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  phase text not null, -- 'phase1', 'phase2', 'phase3'
  version text not null, -- 'v1', 'v2', 'v3-temp0.5'
  label text,
  prompt_text text,
  changelog text,
  file_path text,
  created_at timestamptz default now()
);

-- 3. Test Runs
create table if not exists public.ai_test_runs (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid references public.ai_test_samples(id),
  user_id uuid references auth.users(id), -- Nullable for dev/test
  phase1_version_id uuid references public.ai_prompt_versions(id),
  phase2_version_id uuid references public.ai_prompt_versions(id),
  phase3_version_id uuid references public.ai_prompt_versions(id),
  status text not null default 'running', -- 'running', 'success', 'failed'
  total_input_tokens int default 0,
  total_output_tokens int default 0,
  total_cost_usd numeric(10, 6) default 0,
  created_at timestamptz default now(),
  finished_at timestamptz
);

-- 4. Test Run Results (Per Phase)
create table if not exists public.ai_test_run_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.ai_test_runs(id),
  phase text not null, -- 'phase1', 'phase2', 'phase3'
  model text not null, -- 'gpt-4o-mini', 'gpt-4o'
  prompt_version_id uuid references public.ai_prompt_versions(id),
  input_payload jsonb,
  output_payload jsonb,
  input_tokens int default 0,
  output_tokens int default 0,
  cost_usd numeric(10, 6) default 0,
  created_at timestamptz default now()
);

-- Enable RLS (Security)
alter table public.ai_test_samples enable row level security;
alter table public.ai_prompt_versions enable row level security;
alter table public.ai_test_runs enable row level security;
alter table public.ai_test_run_results enable row level security;

-- Policies (Open for MVP/Dev for now, tighten later)
create policy "Allow all access for dev" on public.ai_test_samples for all using (true);
create policy "Allow all access for dev" on public.ai_prompt_versions for all using (true);
create policy "Allow all access for dev" on public.ai_test_runs for all using (true);
create policy "Allow all access for dev" on public.ai_test_run_results for all using (true);
