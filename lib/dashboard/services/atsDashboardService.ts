import type { ATSInsight } from "../contracts/dashboardContract";
import {
  getATSResult,
  getLatestATSResult,
} from "@/lib/db/repositories/atsRepository";


export interface ATSDashboardContext {
  userId: string;

  tenantId: string;

  applicationId?: string;
}


export async function getATSDashboardInsight(
  context: ATSDashboardContext
): Promise<ATSInsight> {

  let ats;

if (context.applicationId) {
  ats = await getATSResult(context.applicationId);
} else {
  ats = await getLatestATSResult(context.userId);
}


  if (!ats) {
    return {
      score: 0,
      strengths: [],
      improvements: [],
    };
  }


  return {
    score: ats.atsScore,

    strengths: ats.matchedSkills,

    improvements: ats.missingSkills,
  };
}