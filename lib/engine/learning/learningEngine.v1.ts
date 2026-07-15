import { eventBus } from "@/lib/events/core/eventBus";

/**
 * ============================================================
 * Global Career AI
 * Learning Engine V1 (Closed-loop RAM-based system)
 * ============================================================
 */

type LearningEvent = {
  userId: string;
  organizationId: string;
  applicationId: string;
  atsScore: number;
  status: "rejected" | "applied" | "in_review" | "interview" | "offer";
  matchedSkills: string[];
  missingSkills: string[];
};

type LearningSignal = {
  userId: string;
  signalType: "IMPROVE_SCORING" | "SKILL_GAP" | "SUCCESS_PATTERN";
  weight: number;
  metadata: Record<string, unknown>;
};

const signalBuffer: LearningSignal[] = [];

/**
 * ============================================================
 * INIT LEARNING ENGINE
 * ============================================================
 */

export function initLearningEngineV1() {
  eventBus.on("learning:event", processLearningEvent);
}

/**
 * ============================================================
 * EVENT PROCESSOR
 * ============================================================
 */

async function processLearningEvent(event: LearningEvent) {
  const signals: LearningSignal[] = [];

  /**
   * SUCCESS PATTERN
   */
  if (event.status === "offer" || event.status === "interview") {
    signals.push({
      userId: event.userId,
      signalType: "SUCCESS_PATTERN",
      weight: event.atsScore,
      metadata: {
        applicationId: event.applicationId,
        matchedSkills: event.matchedSkills,
      },
    });
  }

  /**
   * SKILL GAP SIGNAL
   */
  if (event.missingSkills && event.missingSkills.length > 0) {
    signals.push({
      userId: event.userId,
      signalType: "SKILL_GAP",
      weight: event.missingSkills.length,
      metadata: {
        missingSkills: event.missingSkills,
      },
    });
  }

  /**
   * LOW SCORE SIGNAL
   */
  if (event.atsScore < 50) {
    signals.push({
      userId: event.userId,
      signalType: "IMPROVE_SCORING",
      weight: 100 - event.atsScore,
      metadata: {
        atsScore: event.atsScore,
      },
    });
  }

  /**
   * ============================================================
   * MEMORY LAYER (V1 ONLY)
   * ============================================================
   */

  signalBuffer.push(...signals);

  console.log("[LearningEngineV1] Signals generated:", signals);
}

/**
 * ============================================================
 * ACCESSOR (runtime use)
 * ============================================================
 */

export function getLearningSignals() {
  return signalBuffer;
}