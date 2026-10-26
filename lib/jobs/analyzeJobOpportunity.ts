import type { JobDetail } from "@/lib/jobs/getJobById";
import { extractJobRequirements } from "@/lib/engine/applications/jobRequirementExtractor";
import { buildJobIntelligence } from "@/lib/engine/intelligence/jobIntelligenceBuilder";
import type { JobIntelligence } from "@/lib/engine/contracts/intelligence/jobIntelligence";

export type JobOpportunityAnalysis = {
  title: string | null;
  company: string | null;
  location: string | null;
  country: string | null;
  category: string | null;
  requirements: string[];
  description: string | null;
  intelligence: JobIntelligence;
};

export function analyzeJobOpportunity(
  job: JobDetail
): JobOpportunityAnalysis {
  const description = job.description?.trim() || null;

  return {
    title: job.title,
    company: job.company,
    location: job.location,
    country: job.country,
    category: job.category,
    requirements: extractJobRequirements(description ?? ""),
    description,
    intelligence: buildJobIntelligence(job),
  };
}