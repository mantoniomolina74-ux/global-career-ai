/**
 * ============================================================
 * Global Career AI
 * Adaptive Weight Engine — Stability Hardening (8C.9A)
 * ============================================================
 */

export type WeightState = {
  atsMultiplier: number;
  rankingMultiplier: number;
  decisionSensitivity: number;
};

export type LearningSignal = {
  atsDelta?: number;
  rankingDelta?: number;
  decisionDelta?: number;
  weight?: number;
};

export type WeightHistory = WeightState[];

/**
 * =========================
 * BASE CONFIGURATION
 * =========================
 */

const WINDOW_SIZE = 50;
const DAMPING_FACTOR = 0.2;

const BASELINE: WeightState = {
  atsMultiplier: 1.0,
  rankingMultiplier: 1.0,
  decisionSensitivity: 1.0,
};

const CLAMPS = {
  atsMultiplier: [0.7, 1.3] as const,
  rankingMultiplier: [0.7, 1.3] as const,
  decisionSensitivity: [0.5, 1.5] as const,
};

/**
 * =========================
 * UTILITIES
 * =========================
 */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * =========================
 * SIGNAL PROCESSING
 * =========================
 */

function computeSignalImpact(signals: LearningSignal[]) {
  const initial = {
    atsDelta: 0,
    rankingDelta: 0,
    decisionDelta: 0,
  };

  return signals.reduce(
    (
      acc: {
        atsDelta: number;
        rankingDelta: number;
        decisionDelta: number;
      },
      s: LearningSignal
    ) => {
      const weight = s.weight ?? 1;

      const ats = s.atsDelta ?? 0;
      const ranking = s.rankingDelta ?? 0;
      const decision = s.decisionDelta ?? 0;

      return {
        atsDelta: acc.atsDelta + ats * weight,
        rankingDelta: acc.rankingDelta + ranking * weight,
        decisionDelta: acc.decisionDelta + decision * weight,
      };
    },
    initial
  );
}

/**
 * =========================
 * DRIFT CORRECTION
 * =========================
 */

function applyDriftCorrection(
  current: WeightState,
  history: WeightState[]
): WeightState {
  if (history.length < 10) return current;

  const avg = history.reduce(
    (acc, w) => ({
      atsMultiplier: acc.atsMultiplier + w.atsMultiplier,
      rankingMultiplier: acc.rankingMultiplier + w.rankingMultiplier,
      decisionSensitivity: acc.decisionSensitivity + w.decisionSensitivity,
    }),
    { atsMultiplier: 0, rankingMultiplier: 0, decisionSensitivity: 0 }
  );

  const n = history.length;

  avg.atsMultiplier /= n;
  avg.rankingMultiplier /= n;
  avg.decisionSensitivity /= n;

  const drift =
    Math.abs(avg.atsMultiplier - BASELINE.atsMultiplier) +
    Math.abs(avg.rankingMultiplier - BASELINE.rankingMultiplier) +
    Math.abs(avg.decisionSensitivity - BASELINE.decisionSensitivity);

  if (drift > 0.5) {
    return {
      atsMultiplier: current.atsMultiplier * 0.95 + BASELINE.atsMultiplier * 0.05,
      rankingMultiplier: current.rankingMultiplier * 0.95 + BASELINE.rankingMultiplier * 0.05,
      decisionSensitivity: current.decisionSensitivity * 0.95 + BASELINE.decisionSensitivity * 0.05,
    };
  }

  return current;
}

/**
 * =========================
 * CORE ENGINE
 * =========================
 */

export function applyLearningStep(
  current: WeightState,
  signals: LearningSignal[],
  history: WeightHistory
): WeightState {
  const recentHistory = history.slice(-WINDOW_SIZE);

  const impact = computeSignalImpact(signals);

  const raw: WeightState = {
    atsMultiplier: current.atsMultiplier + impact.atsDelta,
    rankingMultiplier: current.rankingMultiplier + impact.rankingDelta,
    decisionSensitivity: current.decisionSensitivity + impact.decisionDelta,
  };

  const damped: WeightState = {
    atsMultiplier:
      current.atsMultiplier +
      (raw.atsMultiplier - current.atsMultiplier) * DAMPING_FACTOR,

    rankingMultiplier:
      current.rankingMultiplier +
      (raw.rankingMultiplier - current.rankingMultiplier) * DAMPING_FACTOR,

    decisionSensitivity:
      current.decisionSensitivity +
      (raw.decisionSensitivity - current.decisionSensitivity) * DAMPING_FACTOR,
  };

  const clamped: WeightState = {
    atsMultiplier: clamp(
      damped.atsMultiplier,
      CLAMPS.atsMultiplier[0],
      CLAMPS.atsMultiplier[1]
    ),
    rankingMultiplier: clamp(
      damped.rankingMultiplier,
      CLAMPS.rankingMultiplier[0],
      CLAMPS.rankingMultiplier[1]
    ),
    decisionSensitivity: clamp(
      damped.decisionSensitivity,
      CLAMPS.decisionSensitivity[0],
      CLAMPS.decisionSensitivity[1]
    ),
  };

  return applyDriftCorrection(clamped, recentHistory);
}

/**
 * Force module recognition for Next.js / TS strict mode
 */
export {};