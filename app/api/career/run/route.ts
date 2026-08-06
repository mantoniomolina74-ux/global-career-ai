import { NextResponse } from "next/server";

import { CareerRunSchema } from "@/lib/api/schemas/careerSchema";
import {
validateCareerOrchestratorInput,
} from "@/lib/validation/orchestrator";

import { runCareerOrchestratorV7 } from "@/lib/engine/orchestration/careerOrchestrator.v7";

import {
buildCareerState,
} from "@/lib/engine/builders/careerStateBuilder";

import { buildSaaSRequestContext } from "@/lib/api/middleware/saasGuard";

/**

* ============================================================
* Global Career AI
* API Layer V1 (Production Entry Point)
* ============================================================
  */

type ApplicationInput = {
applicationId?: string;
candidateSkills?: string[];
jobDescription?: string;
cvStrengthScore?: number;
};

export async function POST(req: Request) {
try {
const body = await req.json();


const saasContext =
  await buildSaaSRequestContext(req);


/**
 * ============================================================
 * API VALIDATION LAYER
 * ============================================================
 */

const parsed =
  CareerRunSchema.safeParse(body);


if (!parsed.success) {
  return NextResponse.json(
    {
      error: "Invalid input schema",
      details: parsed.error.flatten(),
    },
    {
      status: 400,
    }
  );
}


/**
 * ============================================================
 * NORMALIZATION LAYER
 * Adapt API shape → CareerOrchestratorInput
 * ============================================================
 */

  const normalizedInput = {

  userId:
    parsed.data.userId,

  tenantId:
    saasContext.tenant.tenantId,


  profile: {
    professionalText:
      parsed.data.profile?.professionalText,
  },


  candidateSkills:
    parsed.data.candidateSkills ?? [],


  requiredSkills:
    parsed.data.requiredSkills ?? [],


  jobDescription:
    parsed.data.jobDescription ?? "",


  cvStrengthScore:
    parsed.data.cvStrengthScore ?? 0,


  applications:
    parsed.data.applications.map(
      (app: ApplicationInput) => ({

        applicationId:
          app.applicationId ??
          `app-${Date.now()}`,

        candidateSkills:
          app.candidateSkills ?? [],

        jobDescription:
          app.jobDescription ?? "",

        cvStrengthScore:
          app.cvStrengthScore ?? 0,

      })
    ),


  rankingStrategy:
    parsed.data.rankingStrategy,


  topK:
    parsed.data.topK,
};


/**
 * ============================================================
 * CORE CONTRACT VALIDATION
 * Runtime protection before Engine execution
 * ============================================================
 */

const validatedInput =
  validateCareerOrchestratorInput(
    normalizedInput
  );


/**
 * ============================================================
 * CORE ENGINE EXECUTION
 * ============================================================
 */

const result =
  await runCareerOrchestratorV7(
    validatedInput
  );


/**
 * ============================================================
 * CAREER INTELLIGENCE STATE
 * Compose unified professional state
 * ============================================================
 */

const careerState =
  buildCareerState(result);


/**
 * ============================================================
 * RESPONSE
 * ============================================================
 */

return NextResponse.json({

  success: true,

  data: {

    ...result,

    careerState,

  },

});


} catch (error: unknown) {

return NextResponse.json(

  {
    success: false,

    error:
      "Internal Server Error",

    message:
      error instanceof Error
        ? error.message
        : "Unknown error",
  },

  {
    status: 500,
  }

);

}
  }