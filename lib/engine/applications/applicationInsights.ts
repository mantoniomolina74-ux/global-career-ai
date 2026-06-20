export interface Application {
  id: string;
  company: string;
  position: string;
  country: string;
  industry?: string;
  job_type?: string;
  salary?: number;
  currency?: string;
  source?: string;
  application_date: string;
  interview_date?: string;
  offer_date?: string;
  rejection_date?: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationInsights {
  totalApplications: number;

  interviewRate: number;
  offerRate: number;
  successRate: number;

  statusBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  industryBreakdown: Record<string, number>;

  avgSalary?: number;

  recommendations: string[];
  weakPoints: string[];

  applicationIntelligence: Record<
    string,
    {
      score: number;
      probabilityOfHire: number;
      momentum: number;
      riskLevel: "low" | "medium" | "high";
      nextAction:
        | "FOLLOW_UP"
        | "PREPARE_INTERVIEW"
        | "IMPROVE_CV"
        | "WAIT"
        | "MOVE_ON";
    }
  >;

  applicationScores: Record<string, number>;

  // -------------------------
  // V5 JOB MATCH TYPES (PLACEHOLDER SAFE)
  // -------------------------

  topCountries: {
    country: string;
    applications: number;
  }[];

  topIndustries: {
    industry: string;
    applications: number;
  }[];

  marketRecommendations: string[];

  careerSignals: {
    name: string;
    value: number;
  }[];
}

/* =========================================================
   ENGINE (REQUIRED FOR NEXT.JS RUNTIME EXPORT)
========================================================= */

export function generateApplicationInsights(
  applications: Application[]
): ApplicationInsights {
  const total = applications.length;

  let interviews = 0;
  let offers = 0;
  let hired = 0;

  const statusBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};
  const industryBreakdown: Record<string, number> = {};

  let salarySum = 0;
  let salaryCount = 0;

  const applicationIntelligence: ApplicationInsights["applicationIntelligence"] = {};
  const applicationScores: Record<string, number> = {};

  for (const app of applications) {
    statusBreakdown[app.status] =
      (statusBreakdown[app.status] || 0) + 1;

    if (app.status.includes("Interview")) interviews++;
    if (app.status === "Offer Received") offers++;
    if (app.status === "Hired") hired++;

    if (app.country) {
      countryBreakdown[app.country] =
        (countryBreakdown[app.country] || 0) + 1;
    }

    if (app.industry) {
      industryBreakdown[app.industry] =
        (industryBreakdown[app.industry] || 0) + 1;
    }

    if (app.salary) {
      salarySum += app.salary;
      salaryCount++;
    }

    const baseScore =
      app.status === "Hired"
        ? 100
        : app.status === "Offer Received"
        ? 90
        : app.status.includes("Interview")
        ? 60
        : app.status === "Under Review"
        ? 40
        : 20;

    const momentum =
      (app.interview_date ? 30 : 0) +
      (app.offer_date ? 60 : 0) +
      (app.notes ? 10 : 0);

    const score = Math.min(100, baseScore);

    applicationIntelligence[app.id] = {
      score,
      probabilityOfHire: Math.round(score * 0.7 + momentum * 0.3),
      momentum,
      riskLevel: score > 70 ? "low" : score < 30 ? "high" : "medium",
      nextAction:
        app.status === "Applied"
          ? "FOLLOW_UP"
          : app.status === "Interview Scheduled"
          ? "PREPARE_INTERVIEW"
          : "WAIT",
    };

    applicationScores[app.id] = score;
  }

  const interviewRate =
    total > 0 ? Math.round((interviews / total) * 100) : 0;

  const offerRate =
    total > 0 ? Math.round((offers / total) * 100) : 0;

  const successRate =
    total > 0 ? Math.round((hired / total) * 100) : 0;

  const avgSalary =
    salaryCount > 0 ? Math.round(salarySum / salaryCount) : undefined;

  return {
    totalApplications: total,
    interviewRate,
    offerRate,
    successRate,

    statusBreakdown,
    countryBreakdown,
    industryBreakdown,

    avgSalary,

    recommendations: [],
    weakPoints: [],

    applicationIntelligence,
    applicationScores,

    topCountries: [],
    topIndustries: [],
    marketRecommendations: [],
    careerSignals: [],
  };
}