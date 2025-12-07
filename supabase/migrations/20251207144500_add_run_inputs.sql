-- Add snapshot columns to ai_test_runs to support ad-hoc runs without permanent samples
alter table public.ai_test_runs
add column if not exists raw_input text,
add column if not exists job_title text;
