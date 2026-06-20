import { Application } from "../applications/applicationInsights";

/* =========================
   TYPES V5 ENGINE
========================= */

export interface JobPosting {
  id: string;
  company: string;
  position: string;
  country: string;
  industry?: string;
  job_type?: string;
  salary?: number;
  currency?: string;
  source?: string;
  requirements?: string[];
}

export interface JobMatchResult {
  jobId: string;

  matchScore: number;
  interviewProbability: number;
  hireProbability: number;

  fitLevel: "low" | "medium" | "high";
  recommendation: "APPLY" | "SKIP" | "PREPARE";

  reasoning: string[];
  missingSkills: string[];
  strengths: string[];
}

/* =========================
   HELPERS
========================= */

function normalize(text?: string) {
  return (text || "").toLowerCase();
}

function hasKeyword(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

/* =========================
   ENGINE V5
========================= */

export function generateJobMatches(
  applications: Application[],
  jobs: JobPosting[]
): JobMatchResult[] {
  return jobs.map((job) => {
    let score = 50;

    const reasoning: string[] = [];
    const strengths: string[] = [];
    const missingSkills: string[] = [];

    const jobText =
      normalize(job.position) + " " + normalize(job.industry);

    // COUNTRY MATCH
    const countryMatch = applications.some(
      (a) => a.country === job.country
    );

    if (countryMatch) {
      score += 15;
      strengths.push("Same country experience");
    } else {
      score -= 10;
      missingSkills.push("No country experience");
    }

    // INDUSTRY MATCH
    const industryMatch = applications.some((a) =>
      normalize(job.industry).includes(normalize(a.industry))
    );

    if (industryMatch) {
      score += 20;
      strengths.push("Industry match detected");
    } else {
      score -= 15;
      missingSkills.push("Industry mismatch");
    }

    // TECH SKILL SIGNAL
    const techSkills = ["react", "node", "python", "sql", "aws"];

    const hasSkills = hasKeyword(jobText, techSkills);

    if (hasSkills) {
      score += 15;
      strengths.push("Technical alignment");
    } else {
      missingSkills.push("Missing technical stack");
    }

    // FINAL SCORE
    score = Math.max(0, Math.min(100, Math.round(score)));

    const interviewProbability = Math.round(score * 0.75);
    const hireProbability = Math.round(score * 0.55);

    const fitLevel =
      score > 75 ? "high" : score > 45 ? "medium" : "low";

    const recommendation =
      score > 70 ? "APPLY" : score > 40 ? "PREPARE" : "SKIP";

    return {
      jobId: job.id,
      matchScore: score,
      interviewProbability,
      hireProbability,
      fitLevel,
      recommendation,
      reasoning,
      missingSkills,
      strengths,
    };
  });
}