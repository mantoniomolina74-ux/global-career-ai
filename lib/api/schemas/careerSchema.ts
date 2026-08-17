import { z } from "zod";

/**
 * ============================================================
 * Global Career AI
 * API Schema Layer V1.2
 * ============================================================
 *
 * Runtime validation contract for Career Intelligence.
 *
 * This layer validates and preserves real application/job data
 * before it enters the Engine Layer.
 *
 * No business logic.
 * No intelligence logic.
 * No persistence.
 * ============================================================
 */

export const CareerRunSchema = z.object({

  /**
   * ============================================================
   * USER
   * ============================================================
   */

  userId:
    z.string(),


  /**
   * ============================================================
   * PROFILE
   * ============================================================
   */

  profile:
    z.object({

      professionalText:
        z.string().optional(),

    }).optional(),


  /**
   * ============================================================
   * APPLICATIONS
   * ============================================================
   *
   * Real application + real job information.
   */

  applications:
    z.array(

      z.object({

        applicationId:
          z.string().optional(),

        /**
         * Real job identity.
         */

        title:
          z.string().optional(),

        industry:
          z.string().optional(),

        country:
          z.string().optional(),


        /**
         * Candidate / matching information.
         */

        candidateSkills:
          z.array(
            z.string()
          ).optional(),


        /**
         * Real job description.
         */

        jobDescription:
          z.string().optional(),


        /**
         * CV strength used by ATS.
         */

        cvStrengthScore:
          z.number().optional(),

      })

    ),


  /**
   * ============================================================
   * GLOBAL MATCHING INPUT
   * ============================================================
   */

  requiredSkills:
    z.array(
      z.string()
    ).optional(),

  candidateSkills:
    z.array(
      z.string()
    ).optional(),

  jobDescription:
    z.string().optional(),


  /**
   * ============================================================
   * ATS INPUT
   * ============================================================
   */

  cvStrengthScore:
    z.number().optional(),


  /**
   * ============================================================
   * RANKING
   * ============================================================
   */

  rankingStrategy:
    z.enum([
      "default",
      "ats",
      "hybrid",
    ]).optional(),

  topK:
    z.number().optional(),

});


export type CareerRunInput =
  z.infer<
    typeof CareerRunSchema
  >;