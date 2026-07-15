import { eventBus } from "@/lib/events/core/eventBus";
import {
  learningEngineV2,
  LearningEvent,
} from "@/lib/engine/learning/learningEngine.v2";

eventBus.on<LearningEvent>(
  "learning:event",
  async (payload) => {
    try {
      await learningEngineV2(payload);
    } catch (err) {
      console.error("[learning listener error]", err);
    }
  }
);