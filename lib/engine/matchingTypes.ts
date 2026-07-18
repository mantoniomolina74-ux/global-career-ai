export type EvidenceType =
  | "experience"
  | "project"
  | "certification"
  | "skill"
  | "education"
  | "course"
  | "keyword";

export type EvidenceSource =
  | "work_experience"
  | "projects"
  | "certifications"
  | "skills_section"
  | "education_section"
  | "courses_section"
  | "other";

export type EvidenceConfidence =
  | "high"
  | "medium"
  | "low";

export type CandidateEvidence = {
  skill: string;

  evidenceType: EvidenceType;

  source: EvidenceSource;

  details?: string;

  yearsOfExperience?: number;

  role?: string;

  industry?: string;

  confidence: EvidenceConfidence;
};

export type SkillEvidenceProfile = {
  skill: string;

  evidences: CandidateEvidence[];
};