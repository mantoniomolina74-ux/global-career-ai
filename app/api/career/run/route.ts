import { NextResponse } from "next/server";

import { CareerRunSchema } from "@/lib/api/schemas/careerSchema";

import {
  validateCareerOrchestratorInput,
} from "@/lib/validation/orchestrator";

import {
  runCareerOrchestratorV7,
} from "@/lib/engine/orchestration/careerOrchestrator.v7";

import {
  buildCareerState,
} from "@/lib/engine/builders/careerStateBuilder";

import {
  buildSaaSRequestContext,
} from "@/lib/api/middleware/saasGuard";


/**
 * ============================================================
 * Global Career AI
 * API Layer V1.2
 * ============================================================
 *
 * Production entry point for Career Intelligence.
 *
 * Responsibilities:
 * - Validate API input
 * - Preserve SaaS tenant context
 * - Normalize API data into Engine contracts
 * - Execute Career Orchestrator
 * - Compose CareerState
 *
 * No intelligence logic.
 * No scoring logic.
 * No dashboard logic.
 * ============================================================
 */


/**
 * ============================================================
 * APPLICATION INPUT
 * ============================================================
 *
 * Represents the API application payload before normalization.
 *
 * Real job identity is intentionally preserved here so it can
 * travel through the Engine Layer into Matching Intelligence.
 */

type ApplicationInput = {

  applicationId?: string;

  /**
   * Real job information.
   */

  title?: string;

  industry?: string;

  country?: string;


  /**
   * Candidate / matching information.
   */

  candidateSkills?: string[];

  jobDescription?: string;


  /**
   * ATS input.
   */

  cvStrengthScore?: number;

};


export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();


    /**
     * ============================================================
     * SAAS CONTEXT
     * ============================================================
     */

    const saasContext =
      await buildSaaSRequestContext(
        req
      );


    /**
     * ============================================================
     * API VALIDATION LAYER
     * ============================================================
     */

    const parsed =
      CareerRunSchema.safeParse(
        body
      );


    if (!parsed.success) {

      return NextResponse.json(

        {
          error:
            "Invalid input schema",

          details:
            parsed.error.flatten(),
        },

        {
          status: 400,
        }

      );

    }


    /**
     * ============================================================
     * NORMALIZATION LAYER
     * ============================================================
     *
     * Adapt API shape → CareerOrchestratorInput.
     *
     * IMPORTANT:
     * Real job identity must not be discarded here.
     */

    const normalizedInput = {

      userId:
        parsed.data.userId,


      tenantId:
        saasContext.tenant.tenantId,


      profile: {

        professionalText:
          parsed.data.profile
            ?.professionalText,

      },


      candidateSkills:
        parsed.data.candidateSkills ?? [],


      requiredSkills:
        parsed.data.requiredSkills ?? [],


      jobDescription:
        parsed.data.jobDescription ?? "",


      cvStrengthScore:
        parsed.data.cvStrengthScore ?? 0,


      /**
       * ==========================================================
       * APPLICATIONS
       * ==========================================================
       *
       * Preserve real job information:
       *
       * applicationId
       * title
       * industry
       * country
       * jobDescription
       *
       * These values continue through:
       *
       * API
       * ↓
       * CareerApplication
       * ↓
       * MatchingInputAdapter
       * ↓
       * Matching Engine
       * ↓
       * MatchingState
       * ↓
       * Dashboard
       */

      applications:
        parsed.data.applications.map(
          (app: ApplicationInput) => ({

            applicationId:
              app.applicationId ??
              `app-${Date.now()}`,


            /**
             * Real job identity.
             */

            title:
              app.title,


            industry:
              app.industry,


            country:
              app.country,


            /**
             * Candidate / matching data.
             */

            candidateSkills:
              app.candidateSkills ?? [],


            jobDescription:
              app.jobDescription ?? "",


            /**
             * ATS data.
             */

            cvStrengthScore:
              app.cvStrengthScore ?? 0,

          })
        ),


      /**
       * ==========================================================
       * OPTIONAL RANKING PARAMETERS
       * ==========================================================
       */

      rankingStrategy:
        parsed.data.rankingStrategy,


      topK:
        parsed.data.topK,

    };


    /**
     * ============================================================
     * CORE CONTRACT VALIDATION
     * ============================================================
     *
     * Runtime protection before Engine execution.
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
     * ============================================================
     *
     * Compose the unified professional state after all
     * intelligence engines have completed.
     */

    const careerState =
      buildCareerState(
        result
      );


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


  } catch (
    error: unknown
  ) {

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