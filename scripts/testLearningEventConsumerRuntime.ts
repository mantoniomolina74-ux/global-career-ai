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
 * Validates:
 *
 * eventBus
 *    ↓
 * learningEventConsumer
 *    ↓
 * persistLearningEvent
 *    ↓
 * learningEngineV2
 *    ↓
 * runLearningIntelligence
 *
 * ============================================================
 */


async function run() {

  const { eventBus } =
    await import("../lib/events/core/eventBus");


  const {
    initLearningEventConsumer,
  } =
    await import("../lib/engine/events/learningEventConsumer");


  initLearningEventConsumer();


  const event = {
    userId: "00000000-0000-0000-0000-000000000001",

    type: "REJECTION_RECEIVED",

    timestamp:
      new Date().toISOString(),

    context: {
      action:
        "application_rejected",

      applicationId:
        "application-001",

      status:
        "REJECTED",

      atsScore:
        65,

      matchedSkills: [
        "equipment-operation",
        "safety",
      ],

      missingSkills: [
        "hydraulic-systems",
      ],

      industry:
        "Mining",

      country:
        "Canada",
    },

    payload: {
      source:
        "TEST",

      confidence:
        0.75,
    },
  };


  console.log(
    "Sending Learning Event..."
  );


  await eventBus.emit(
    "learning:event",
    event,
  );


  console.log(
    "Learning Event processed"
  );
}


run()
  .catch((error) => {

    console.error(
      "Runtime test failed:",
      error,
    );

    process.exit(1);
  });