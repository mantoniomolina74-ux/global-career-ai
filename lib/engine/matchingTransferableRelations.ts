/**
 * ============================================================
 * Global Career AI
 * Matching Transferable Relations V1.0
 * ============================================================
 *
 * Source of truth for transferable relationships used by
 * the Premium Matching Evidence Layer.
 *
 * Responsibilities:
 * - Define approved transferable relationships.
 *
 * Does NOT:
 * - score evidence
 * - inspect CV text
 * - run ATS logic
 * - generate match explanations
 * - persist data
 *
 * Weak relationships are intentionally excluded from the
 * active catalog for V1.0 to avoid artificial match inflation.
 * ============================================================
 */

export type TransferableRelation = {
  source: string;
  target: string;
  strength: "strong" | "moderate";
};

export const MATCHING_TRANSFERABLE_RELATIONS: TransferableRelation[] = [
  // ----------------------------------------------------------
  // STRONG
  // ----------------------------------------------------------

  { source: "purchasing", target: "business", strength: "strong" },
  { source: "procurement", target: "business", strength: "strong" },

  { source: "communication", target: "stakeholder management", strength: "strong" },
  { source: "coordination", target: "stakeholder management", strength: "strong" },
  { source: "negotiation", target: "stakeholder management", strength: "strong" },
  { source: "client", target: "stakeholder management", strength: "strong" },
  { source: "supplier", target: "stakeholder management", strength: "strong" },

  { source: "planning", target: "project management", strength: "strong" },
  { source: "coordination", target: "project management", strength: "strong" },

  { source: "analysis", target: "data analysis", strength: "strong" },
  { source: "investigation", target: "research", strength: "strong" },

  { source: "leadership", target: "decision making", strength: "strong" },

  { source: "management", target: "leadership", strength: "strong" },
  { source: "supervision", target: "leadership", strength: "strong" },

  { source: "leadership", target: "management", strength: "strong" },
  { source: "supervision", target: "management", strength: "strong" },

  // ----------------------------------------------------------
  // MODERATE
  // ----------------------------------------------------------

  { source: "management", target: "business", strength: "moderate" },
  { source: "administration", target: "business", strength: "moderate" },
  { source: "planning", target: "business", strength: "moderate" },
  { source: "coordination", target: "business", strength: "moderate" },
  { source: "negotiation", target: "business", strength: "moderate" },

  { source: "management", target: "strategy", strength: "moderate" },
  { source: "planning", target: "strategy", strength: "moderate" },
  { source: "decision making", target: "strategy", strength: "moderate" },
  { source: "research", target: "strategy", strength: "moderate" },
  { source: "analysis", target: "strategy", strength: "moderate" },

  { source: "management", target: "stakeholder management", strength: "moderate" },

  { source: "negotiation", target: "communication", strength: "moderate" },
  { source: "customer", target: "communication", strength: "moderate" },

  { source: "analysis", target: "consulting", strength: "moderate" },
  { source: "research", target: "consulting", strength: "moderate" },
  { source: "communication", target: "consulting", strength: "moderate" },
  { source: "problem solving", target: "consulting", strength: "moderate" },

  { source: "management", target: "project management", strength: "moderate" },
  { source: "supervision", target: "project management", strength: "moderate" },

  { source: "technology", target: "information technology", strength: "moderate" },
];