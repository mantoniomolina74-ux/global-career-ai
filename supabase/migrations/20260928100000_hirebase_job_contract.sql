/*
 * ============================================================
 * GLOBAL CAREER AI V1.0
 * Hirebase Job Contract
 * ============================================================
 *
 * APERTURA: 28/09/2026
 *
 * Purpose:
 * Establish the persistent contract required to synchronize
 * Hirebase jobs with public.jobs.
 *
 * Design principles:
 * - jobs.id remains the internal GCA identifier.
 * - Hirebase _id is persisted as external_id.
 * - Existing application -> jobs relationships remain intact.
 * - Jobs are never physically deleted by synchronization.
 * - Lifecycle is represented explicitly.
 * - The schema supports current Search synchronization and
 *   future Export + Expired Jobs Feed synchronization.
 *
 * ============================================================
 */

alter table public.jobs
  add column if not exists external_id text;

alter table public.jobs
  add column if not exists posted_at timestamp with time zone;

alter table public.jobs
  add column if not exists first_seen_at timestamp with time zone;

alter table public.jobs
  add column if not exists last_seen_at timestamp with time zone;

alter table public.jobs
  add column if not exists is_active boolean not null default true;

alter table public.jobs
  add column if not exists expired_at timestamp with time zone;

/*
 * Hirebase identity.
 *
 * external_id stores Hirebase._id.
 *
 * We scope uniqueness by source because public.jobs may contain
 * jobs from other providers in the future.
 */
create unique index if not exists jobs_source_external_id_unique_idx
  on public.jobs (source, external_id);

/*
 * Lifecycle indexes.
 */
create index if not exists jobs_source_active_idx
  on public.jobs (source, is_active);

create index if not exists jobs_last_seen_at_idx
  on public.jobs (last_seen_at);

/*
 * Existing jobs predate this contract.
 *
 * We do not invent Hirebase IDs for historical records.
 * Their external_id remains NULL until a future synchronization
 * can safely associate them with a real Hirebase._id.
 *
 * Existing records are considered active unless explicitly
 * expired by a future lifecycle synchronization.
 *
 * APERTURA: 28/09/2026
 * CIERRE: pending real migration validation
 */