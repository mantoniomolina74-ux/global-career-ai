import { supabaseServer } from "@/lib/supabase-server";
import { LearningDomainEvent, LearningEventType } from "./learningTypes";

/**
 * ============================================================
 * Global Career AI
 * Learning Event Reader
 * ============================================================
 *
 * Reads persisted learning events for Learning Intelligence.
 *
 * Responsibilities:
 * - Read historical events from learning_events
 * - Isolate events by user and tenant
 * - Convert persisted action values into canonical event types
 * - Preserve the persisted learning context
 *
 * Does not modify learning behavior.
 * Does not write to the database.
 * ============================================================
 */

interface LearningEventRow {
  id: string;
  user_id: string;
  tenant_id: string | null;
  action: string;
  context: Record<string, unknown> | null;
  created_at: string;
}


/**
 * Convert persisted database actions
 * into canonical LearningEventType values.
 */
function resolveEventType(
  action: string
): LearningEventType | "LEARNING_EVENT" {

  switch (action.toLowerCase()) {

    case "ats_evaluated":
      return "ATS_EVALUATED";

    case "ranking_generated":
      return "RANKING_GENERATED";

    case "recommendation_created":
      return "RECOMMENDATION_CREATED";

    case "decision_created":
      return "DECISION_CREATED";

    case "application_submitted":
      return "APPLICATION_SUBMITTED";

    case "interview_received":
      return "INTERVIEW_RECEIVED";

    case "offer_received":
      return "OFFER_RECEIVED";

    case "application_rejected":
    case "rejection_received":
      return "REJECTION_RECEIVED";

    default:
      return "LEARNING_EVENT";
  }
}


/**
 * Resolve the metadata source associated
 * with a canonical learning event.
 */
function resolveSource(
  type: LearningEventType | "LEARNING_EVENT"
):
  | "ATS"
  | "RANKING"
  | "RECOMMENDATION"
  | "DECISION"
  | "ORCHESTRATOR"
  | "USER"
  | "KNOWLEDGE"
  | undefined {

  switch (type) {

    case "ATS_EVALUATED":
      return "ATS";

    case "RANKING_GENERATED":
      return "RANKING";

    case "RECOMMENDATION_CREATED":
      return "RECOMMENDATION";

    case "DECISION_CREATED":
      return "DECISION";

    default:
      return undefined;
  }
}


/**
 * Read persisted learning events
 * for one user and tenant.
 */
export async function readLearningEvents(
  userId: string,
  tenantId: string
): Promise<LearningDomainEvent[]> {

  const {
    data,
    error,
  } = await supabaseServer
    .from("learning_events")
    .select(
      "id,user_id,tenant_id,action,context,created_at"
    )
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "[readLearningEvents] Supabase error:",
      error
    );

    throw error;
  }

  const rows =
    (data ?? []) as LearningEventRow[];


  return rows.map((row) => {

    const type =
      resolveEventType(row.action);

    const context =
      row.context ?? {};


    const source =
      resolveSource(type);


    return {
      id: row.id,

      userId: row.user_id,

      tenantId: row.tenant_id as string,

      type,

      timestamp: row.created_at,

      context: {
        ...context,

        action:
          typeof context.action === "string"
            ? context.action
            : row.action,
      },

      ...(source
        ? {
            metadata: {
              source,
            },
          }
        : {}),
    };
  });
}