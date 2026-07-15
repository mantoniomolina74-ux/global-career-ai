import { supabase } from "@/lib/supabase";

/**
 * ============================
 * TYPES
 * ============================
 */

export interface ApplicationRecord {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  country?: string;
  industry?: string;
  required_skills?: string[];
  matched_skills?: string[];
  job_description?: string;
  cv_strength_score?: number;

  atsResult?: AtsResult;
  ats?: AtsResult;
}

interface AtsResult {
  atsScore: number;
  passProbability: number;
  interviewProbability?: number;
  offerProbability?: number;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * ============================
 * DATA ACCESS
 * ============================
 */

async function fetchApplications(userId: string): Promise<ApplicationRecord[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return (data || []) as ApplicationRecord[];
}

/**
 * ============================
 * FUNNEL ENGINE
 * ============================
 */

export function calculateFunnel(apps: ApplicationRecord[]) {
  const safeDiv = (a: number, b: number) =>
    b === 0 ? 0 : a / b;

  const saved = apps.filter((a) => a.status === "saved").length;
  const applied = apps.filter((a) => a.status === "applied").length;
  const in_review = apps.filter((a) => a.status === "in_review").length;
  const interview = apps.filter((a) => a.status === "interview").length;
  const offer = apps.filter((a) => a.status === "offer").length;
  const rejected = apps.filter((a) => a.status === "rejected").length;

  return {
    total: apps.length,
    saved,
    applied,
    in_review,
    interview,
    offer,
    rejected,
    conversionRate: safeDiv(interview, applied),
    offerRate: safeDiv(offer, applied),
    successRate: safeDiv(offer, interview),
  };
}

/**
 * ============================
 * PERFORMANCE ENGINE
 * ============================
 */

export function calculatePerformance(apps: ApplicationRecord[]) {
  const total = apps.length;

  const activePipeline = apps.filter((a) =>
    ["applied", "in_review", "interview"].includes(a.status)
  ).length;

  const responded = apps.filter((a) =>
    ["in_review", "interview", "offer", "rejected"].includes(a.status)
  ).length;

  const rejected = apps.filter((a) => a.status === "rejected").length;

  const responseRate = total === 0 ? 0 : responded / total;
  const rejectionRate = total === 0 ? 0 : rejected / total;

  return {
    totalApplications: total,
    activePipeline,
    responseRate,
    rejectionRate,
  };
}

/**
 * ============================
 * INSIGHTS ENGINE
 * ============================
 */

export async function getApplicationInsights(userId: string) {
  const applications = await fetchApplications(userId);

  const funnel = calculateFunnel(applications);
  const performance = calculatePerformance(applications);

  const statusBreakdown: Record<string, number> = {};
  const applicationScores: Record<string, number> = {};
  const applicationIntelligence: Record<string, ApplicationIntelligence> = {};

  for (const app of applications) {
    statusBreakdown[app.status] =
      (statusBreakdown[app.status] || 0) + 1;

    const ats: AtsResult =
      app.atsResult ??
      app.ats ??
      {
        atsScore: app.cv_strength_score ?? 50,
        passProbability: Math.round(
          (app.cv_strength_score ?? 50) * 0.9
        ),
        interviewProbability: Math.round(
          (app.cv_strength_score ?? 50) * 0.6
        ),
        offerProbability: Math.round(
          (app.cv_strength_score ?? 50) * 0.4
        ),
        matchedSkills: app.matched_skills || [],
        missingSkills: [],
      };

    applicationScores[app.id] = ats.atsScore;

    applicationIntelligence[app.id] = {
      atsScore: ats.atsScore,
      atsPassProbability: ats.passProbability,
      riskLevel:
        ats.atsScore >= 75
          ? "low"
          : ats.atsScore >= 50
          ? "medium"
          : "high",
      matchedSkills: ats.matchedSkills,
      missingSkills: ats.missingSkills,
    };
  }

  return {
    funnel,
    performance,
    statusBreakdown,
    applicationScores,
    applicationIntelligence,
    meta: {
      generatedAt: new Date().toISOString(),
      source: "server-engine-v2",
    },
  };
}

/**
 * ============================
 * LIGHTWEIGHT HELPERS
 * ============================
 */

export async function getFunnelStats(userId: string) {
  const apps = await fetchApplications(userId);
  return calculateFunnel(apps);
}

export async function getPerformanceMetrics(userId: string) {
  const apps = await fetchApplications(userId);
  return calculatePerformance(apps);
}

interface ApplicationIntelligence {
  atsScore: number;
  atsPassProbability: number;
  riskLevel: "low" | "medium" | "high";
  matchedSkills: string[];
  missingSkills: string[];
}