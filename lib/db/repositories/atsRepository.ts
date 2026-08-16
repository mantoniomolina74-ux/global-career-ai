import { supabaseServer } from "@/lib/supabase-server";

/**
 * =========================================================
 * ATS PERSISTENCE LAYER
 * =========================================================
 */

export type ATSResult = {
  atsScore: number;

  passProbability: number;

  interviewProbability: number;

  offerProbability: number;

  matchedSkills: string[];

  missingSkills: string[];
};


/**
 * =========================================================
 * INTERNAL MAPPER
 * =========================================================
 */

function mapATSResult(data: any): ATSResult {
  return {
    atsScore:
      typeof data.ats_score === "number"
        ? data.ats_score
        : 0,

    passProbability:
      typeof data.pass_probability === "number"
        ? data.pass_probability
        : 0,

    interviewProbability:
      typeof data.interview_probability === "number"
        ? data.interview_probability
        : 0,

    offerProbability:
      typeof data.offer_probability === "number"
        ? data.offer_probability
        : 0,

    matchedSkills:
      Array.isArray(data.matched_skills)
        ? data.matched_skills
        : [],

    missingSkills:
      Array.isArray(data.missing_skills)
        ? data.missing_skills
        : [],
  };
}


/**
 * =========================================================
 * SAVE ATS RESULT
 * =========================================================
 *
 * Persists application-specific ATS intelligence.
 *
 * Source of truth:
 * public.ats_results
 *
 * One ATS result per application.
 * =========================================================
 */

export async function saveATSResult(
  userId: string,
  applicationId: string,
  ats: ATSResult
) {

  const { error } =
    await supabaseServer
      .from("ats_results")
      .upsert(
        {
          user_id: userId,

          application_id:
            applicationId,

          ats_score:
            ats.atsScore,

          pass_probability:
            ats.passProbability,

          interview_probability:
            ats.interviewProbability,

          offer_probability:
            ats.offerProbability,

          matched_skills:
            ats.matchedSkills,

          missing_skills:
            ats.missingSkills,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "application_id",
        }
      );

  if (error) {
    throw new Error(error.message);
  }
}


/**
 * =========================================================
 * FETCH ATS BY APPLICATION
 * =========================================================
 *
 * Source of truth for
 * application-specific intelligence.
 * =========================================================
 */

export async function getATSResult(
  applicationId: string
): Promise<ATSResult | null> {

  const {
    data,
    error,
  } =
    await supabaseServer
      .from("ats_results")
      .select("*")
      .eq(
        "application_id",
        applicationId
      )
      .single();


  if (error || !data) {
    return null;
  }


  return mapATSResult(data);
}


/**
 * =========================================================
 * FETCH LATEST ATS BY USER
 * =========================================================
 *
 * Used when the product explicitly needs
 * the most recently generated ATS result.
 *
 * NOTE:
 * This is NOT an average.
 * =========================================================
 */

export async function getLatestATSResult(
  userId: string
): Promise<ATSResult | null> {

  const {
    data,
    error,
  } =
    await supabaseServer
      .from("ats_results")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .order(
        "updated_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .single();


  if (error || !data) {
    return null;
  }


  return mapATSResult(data);
}


/**
 * =========================================================
 * FETCH LATEST CV ATS RESULT
 * =========================================================
 *
 * Source of truth:
 * public.cv_analyses
 *
 * Used by the global Dashboard when it needs the ATS
 * score generated from the user's latest CV analysis.
 *
 * This is intentionally separate from ats_results because
 * ats_results represents application-specific ATS
 * intelligence.
 *
 * No artificial score is generated.
 * =========================================================
 */

export async function getLatestCVATSResult(
  userId: string
): Promise<ATSResult | null> {

  const {
    data,
    error,
  } =
    await supabaseServer
      .from("cv_analyses")
      .select(
        "ats_score, skills"
      )
      .eq(
        "user_id",
        userId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .single();


  if (error || !data) {
    return null;
  }


  return {
    atsScore:
      typeof data.ats_score === "number"
        ? data.ats_score
        : 0,

    passProbability: 0,

    interviewProbability: 0,

    offerProbability: 0,

    matchedSkills:
      Array.isArray(data.skills)
        ? data.skills.filter(
            (value): value is string =>
              typeof value === "string"
          )
        : [],

    missingSkills: [],
  };
}


/**
 * =========================================================
 * FETCH ATS RESULTS BY USER
 * =========================================================
 *
 * Returns all persisted ATS results belonging
 * to the user.
 *
 * Only real persisted ATS results are returned.
 * Applications without ATS results are NOT converted
 * into artificial zero scores.
 * =========================================================
 */

export async function getATSResultsByUser(
  userId: string
): Promise<ATSResult[]> {

  const {
    data,
    error,
  } =
    await supabaseServer
      .from("ats_results")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .order(
        "updated_at",
        {
          ascending: false,
        }
      );


  if (error || !data) {
    return [];
  }


  return data.map(
    mapATSResult
  );
}


/**
 * =========================================================
 * CALCULATE AVERAGE ATS BY USER
 * =========================================================
 *
 * Dashboard metric:
 *
 * "ATS Avg"
 *
 * The average is calculated ONLY from real persisted
 * ATS results.
 *
 * Applications without ATS results are excluded.
 *
 * Example:
 *
 * Application 10 → 13
 * Application 11 → 72
 * Application 12 → 81
 *
 * Average:
 *
 * (13 + 72 + 81) / 3 = 55.33
 *
 * =========================================================
 */

export async function getAverageATSResult(
  userId: string
): Promise<ATSResult | null> {

  const results =
    await getATSResultsByUser(
      userId
    );


  if (results.length === 0) {
    return null;
  }


  const count =
    results.length;


  const average = (
    values: number[]
  ): number =>
    values.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    ) / count;


  const atsScore =
    Math.round(
      average(
        results.map(
          (result) =>
            result.atsScore
        )
      )
    );


  const passProbability =
    Math.round(
      average(
        results.map(
          (result) =>
            result.passProbability
        )
      )
    );


  const interviewProbability =
    Math.round(
      average(
        results.map(
          (result) =>
            result.interviewProbability
        )
      )
    );


  const offerProbability =
    Math.round(
      average(
        results.map(
          (result) =>
            result.offerProbability
        )
      )
    );


  const matchedSkills =
    Array.from(
      new Set(
        results.flatMap(
          (result) =>
            result.matchedSkills
        )
      )
    );


  const missingSkills =
    Array.from(
      new Set(
        results.flatMap(
          (result) =>
            result.missingSkills
        )
      )
    );


  return {
    atsScore,

    passProbability,

    interviewProbability,

    offerProbability,

    matchedSkills,

    missingSkills,
  };
}