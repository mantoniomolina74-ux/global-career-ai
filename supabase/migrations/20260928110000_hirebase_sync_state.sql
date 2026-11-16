/*
 * GLOBAL CAREER AI V1.0
 * Hirebase Search Incremental Sync State
 *
 * APERTURA: 28/09/2026
 *
 * Purpose:
 * Persist the synchronization checkpoint and monthly Hirebase Free quota state.
 *
 * Design:
 * - One persistent state row for the Hirebase Search synchronization.
 * - last_posted_at is the incremental checkpoint.
 * - jobs_consumed tracks the current monthly quota usage.
 * - The checkpoint advances only after a complete successful sync.
 * - Page numbers are execution state, not persistent checkpoints.
 * - Hirebase job identity remains jobs.external_id.
 */

create table if not exists public.hirebase_sync_state (
  id uuid primary key default gen_random_uuid(),

  source text not null default 'hirebase',

  period_start date not null,

  jobs_consumed integer not null default 0,

  last_posted_at timestamp with time zone,

  last_successful_sync_at timestamp with time zone,

  created_at timestamp with time zone not null default now(),

  updated_at timestamp with time zone not null default now(),

  constraint hirebase_sync_state_source_unique
    unique (source),

  constraint hirebase_sync_state_jobs_consumed_check
    check (jobs_consumed >= 0),

  constraint hirebase_sync_state_source_check
    check (source = 'hirebase')
);

create index if not exists hirebase_sync_state_period_idx
  on public.hirebase_sync_state (period_start);

create index if not exists hirebase_sync_state_last_posted_idx
  on public.hirebase_sync_state (last_posted_at);

/*
 * APERTURA: 28/09/2026
 * CIERRE: pending migration validation
 */