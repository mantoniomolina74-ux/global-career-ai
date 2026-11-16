
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
 * - Restore original event trace when available
 * - Preserve compatibility with historical records
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

interface PersistedEventMetadata {
  source:
    | "ATS"
    | "RANKING"
    | "RECOMMENDATION"
    | "DECISION"
    | "ORCHESTRATOR"
    | "USER"
    | "KNOWLEDGE";
  confidence?: number;
  traceId?: string;
}

function isLearningEventType(
  value: unknown
): value is LearningEventType | "LEARNING_EVENT" {
  return (
    typeof value === "string" &&
    [
      "ATS_EVALUATED",
      "RANKING_GENERATED",
      "RECOMMENDATION_CREATED",
      "DECISION_CREATED",
      "APPLICATION_SUBMITTED",
      "INTERVIEW_RECEIVED",
      "OFFER_RECEIVED",
      "REJECTION_RECEIVED",
      "LEARNING_EVENT",
    ].includes(value)
  );
}

function isPersistedEventMetadata(
  value: unknown
): value is PersistedEventMetadata {
  if (
    typeof value !== "object" ||
    value === null ||
    !("source" in value)
  ) {
    return false;
  }

  const metadata = value as Record<string, unknown>;

  return [
    "ATS",
    "RANKING",
    "RECOMMENDATION",
    "DECISION",
    "ORCHESTRATOR",
    "USER",
    "KNOWLEDGE",
  ].includes(String(metadata.source));
}

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
    const context = row.context ?? {};

    const originalType = context.__learningEventType;
    const originalId = context.__learningEventId;
    const originalTimestamp = context.__learningEventTimestamp;
    const originalMetadata = context.__learningEventMetadata;

    const type = isLearningEventType(originalType)
      ? originalType
      : resolveEventType(row.action);

    const metadata = isPersistedEventMetadata(originalMetadata)
      ? originalMetadata
      : undefined;

    const {
      __learningEventId: _eventId,
      __learningEventType: _eventType,
      __learningEventTimestamp: _eventTimestamp,
      __learningEventMetadata: _eventMetadata,
      ...eventContext
    } = context;

    return {
      id:
        typeof originalId === "string"
          ? originalId
          : row.id,

      userId: row.user_id,

      tenantId: row.tenant_id as string,

      type,

      timestamp:
        typeof originalTimestamp === "string"
          ? originalTimestamp
          : row.created_at,

      context: {
        ...eventContext,
        action:
          typeof eventContext.action === "string"
            ? eventContext.action
            : row.action,
      },

      ...(metadata ? { metadata } : {}),
    };
  });
}
