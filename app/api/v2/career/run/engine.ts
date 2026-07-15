import { saasEngine } from "@/lib/infra/saasEngine";

/**
 * ============================================================
 * Global Career AI
 * Career Intelligence API V2
 * Stable Public Contract Layer
 * ============================================================
 */

export type CareerRunRequest<TPayload = unknown> = {
  userId: string;
  organizationId: string;
  mode: "score" | "rank" | "recruit";
  payload: TPayload;
};

export type CareerRunResponse<TData = unknown> = {
  success: boolean;
  data: TData;
  meta: {
    version: string;
    processedAt: string;
  };
};

export async function runCareerEngineV2<
  TPayload = unknown,
  TResponse = unknown
>(
  input: CareerRunRequest<TPayload>
): Promise<CareerRunResponse<TResponse>> {
  const result = await saasEngine({
    userId: input.userId,
    organizationId: input.organizationId,
    mode: input.mode,
    payload: input.payload,
  });

  return {
    success: true,
    data: result as TResponse,
    meta: {
      version: "career-ai-v2",
      processedAt: new Date().toISOString(),
    },
  };
}