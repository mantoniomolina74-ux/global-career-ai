import type { ATSInsight } from "../contracts/dashboardContract";

import {
  getATSResult,
  getLatestCVATSResult,
} from "@/lib/db/repositories/atsRepository";


export interface ATSDashboardContext {
  userId: string;

  tenantId: string;

  applicationId?: string;
}


export async function getATSDashboardInsight(
  context: ATSDashboardContext
): Promise<ATSInsight> {

  /**
   * =========================================================
   * APPLICATION-SPECIFIC DASHBOARD
   * =========================================================
   *
   * When an applicationId is available, the Dashboard must
   * show the ATS intelligence belonging specifically to that
   * application.
   *
   * Source of truth:
   * public.ats_results
   */

  let ats;

  if (context.applicationId) {

    ats =
      await getATSResult(
        context.applicationId
      );

  } else {

    /**
     * =======================================================
     * GLOBAL DASHBOARD
     * =======================================================
     *
     * No applicationId means the Dashboard is displaying
     * the user's current CV intelligence.
     *
     * Source of truth:
     * public.cv_analyses
     *
     * We use the latest real CV analysis belonging to the
     * authenticated user.
     *
     * We do NOT use application ATS results here because
     * those represent application-specific intelligence.
     */

    ats =
      await getLatestCVATSResult(
        context.userId
      );
  }


  console.log(
    "[ATS DASHBOARD DEBUG]",
    {
      userId:
        context.userId,

      applicationId:
        context.applicationId,

      ats,
    }
  );


  /**
   * =========================================================
   * NO ATS DATA
   * =========================================================
   */

  if (!ats) {

    return {
      score: 0,

      strengths: [],

      improvements: [],
    };

  }


  /**
   * =========================================================
   * DASHBOARD CONTRACT
   * =========================================================
   */

  return {

    score:
      ats.atsScore,

    strengths:
      ats.matchedSkills,

    improvements:
      ats.missingSkills,

  };
}