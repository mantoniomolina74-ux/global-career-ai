import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

async function main() {
  const { readLearningEvents } =
    await import("@/lib/engine/learning/learningEventReader");

  const userId =
    "00000000-0000-0000-0000-000000000001";

  const tenantId =
    "00000000-0000-0000-0000-000000000002";

  const events = await readLearningEvents(
    userId,
    tenantId
  );

  console.log(
    "Learning Events Read:",
    JSON.stringify(events, null, 2)
  );
}

main().catch((error) => {
  console.error(
    "[testLearningEventReader]",
    error
  );

  process.exit(1);
});