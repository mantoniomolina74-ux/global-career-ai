import { LearningDomainEvent } from "./learningTypes";

/**
 * Placeholder para la actualización de embeddings.
 */
export async function updateUserEmbeddings(
  userId: string,
  payload: LearningDomainEvent["context"]
): Promise<void> {
  console.log("[updateUserEmbeddings]", {
    userId,
    action: payload.action,
  });
}