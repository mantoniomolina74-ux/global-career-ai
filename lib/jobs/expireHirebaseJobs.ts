import { supabaseServer } from "@/lib/supabase-server";

/*
 * ============================================================
 * GLOBAL CAREER AI V1.0
 * Hirebase Expired Jobs Lifecycle
 * ============================================================
 *
 * APERTURA: 28/09/2026
 *
 * Purpose:
 * Mark Hirebase jobs as inactive when Hirebase reports that
 * their external_id has expired.
 *
 * Design principles:
 * - Never physically delete jobs.
 * - Match only by source + external_id.
 * - Preserve the internal jobs.id.
 * - Preserve application -> jobs relationships.
 * - Store the expiration timestamp.
 *
 * This service intentionally does NOT call Hirebase.
 * The external Expired Jobs Feed will be connected separately.
 *
 * ============================================================
 */

export type ExpiredHirebaseJob = {
  external_id: string;
  expired_at: string;
};

export async function expireHirebaseJobs(
  expiredJobs: ExpiredHirebaseJob[]
): Promise<number> {
  if (expiredJobs.length === 0) {
    return 0;
  }

  let updated = 0;

  for (const job of expiredJobs) {
    const { data, error } = await supabaseServer
      .from("jobs")
      .update({
        is_active: false,
        expired_at: job.expired_at,
        last_seen_at: job.expired_at,
      })
      .eq("source", "hirebase")
      .eq("external_id", job.external_id)
      .select("id");

    if (error) {
      throw new Error(
        `Error expirando empleo Hirebase ${job.external_id}: ${error.message}`
      );
    }

    updated += data?.length ?? 0;
  }

  return updated;
}