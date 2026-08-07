
import { supabaseServer } from "@/lib/supabase-server";

/**
 * =========================================================
 * ATS PERSISTENCE LAYER
 * =========================================================
 */

type ATSResult = {
  atsScore: number;

  passProbability: number;

  interviewProbability: number;

  offerProbability: number;

  matchedSkills: string[];

  missingSkills: string[];
};


function mapATSResult(data: any): ATSResult {
  return {
    atsScore: data.ats_score,

    passProbability: data.pass_probability,

    interviewProbability: data.interview_probability,

    offerProbability: data.offer_probability,

    matchedSkills: data.matched_skills || [],

    missingSkills: data.missing_skills || [],
  };
}


export async function saveATSResult(
  userId: string,
  applicationId: string,
  ats: ATSResult
) {

  const { error } = await supabaseServer
    .from("ats_results")
    .upsert({

      user_id: userId,

      application_id: applicationId,

      ats_score: ats.atsScore,

      pass_probability: ats.passProbability,

      interview_probability: ats.interviewProbability,

      offer_probability: ats.offerProbability,

      matched_skills: ats.matchedSkills,

      missing_skills: ats.missingSkills,

      updated_at: new Date().toISOString(),

    });


  if (error) {
    throw new Error(error.message);
  }
}


/**
 * FETCH ATS BY APPLICATION
 *
 * Source of truth for
 * application-specific intelligence.
 */
export async function getATSResult(
  applicationId: string
) {

  const { data, error } = await supabaseServer
    .from("ats_results")
    .select("*")
    .eq("application_id", applicationId)
    .single();


  if (error || !data) {
    return null;
  }


  return mapATSResult(data);
}


/**
 * FETCH LATEST ATS BY USER
 *
 * Used by global Dashboard experience.
 */
export async function getLatestATSResult(
  userId: string
) {

  const { data, error } = await supabaseServer
    .from("ats_results")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    })
    .limit(1)
    .single();


  if (error || !data) {
    return null;
  }


  return mapATSResult(data);
}
