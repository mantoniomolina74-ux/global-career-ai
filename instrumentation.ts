
import { initLearningEventConsumer } from "@/lib/engine/events/learningEventConsumer";

export function register() {
  console.log("[Learning Instrumentation] register() ejecutado");
  initLearningEventConsumer();
}
