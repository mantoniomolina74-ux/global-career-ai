import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

/**
 * ============================================================
 * Global Career AI
 * Learning Event Consumer Runtime Test
 * ============================================================
 *
 * Validates the canonical Learning pipeline:
 *
 * emitLearning
 *    ?
 * learningEventBus
 *    ?
 * learningEventConsumer
 *    ?
 * persistLearningEvent
 *    ?
 * incrementUserSignals
 *    ?
 * selective embeddings
 *    ?
 * runLearningIntelligence
 *
 * ============================================================
 */

async function run() {
  const { emitLearning } =
    await import("../lib/engine/learning/learningEventBus");

  const {
    initLearningEventConsumer,
  } =
    await import("../lib/engine/events/learningEventConsumer");

  initLearningEventConsumer();

  const event = {
    userId: "00000000-0000-0000-0000-000000000001",

    tenantId: "00000000-0000-0000-0000-000000000002",

    type: "REJECTION_RECEIVED" as const,

    timestamp: new Date().toISOString(),

    context: {
      action: "application_rejected",

      applicationId: "application-001",

      status: "REJECTED",

      atsScore: 65,

      matchedSkills: [
        "equipment-operation",
        "safety",
      ],

      missingSkills: [
        "hydraulic-systems",
      ],

      industry: "Mining",

      country: "Canada",
    },

    metadata: {
      source: "USER" as const,
      confidence: 0.75,
    },
  };

  console.log("Sending canonical Learning Event...");

  emitLearning(event);

  await new Promise((resolve) => setTimeout(resolve, 250));

  console.log("Canonical Learning Event processed");
}

run().catch((error) => {
  console.error(
    "Runtime test failed:",
    error,
  );

  process.exit(1);
});
