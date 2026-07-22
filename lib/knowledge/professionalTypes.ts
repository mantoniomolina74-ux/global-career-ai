import {
  SemanticPattern
} from "./types/semanticPattern";


export type ProfessionalLevel =
  | "entry"
  | "intermediate"
  | "senior"
  | "lead";


export type ProfessionalDomain = {
  id: string;
  name: string;
  description?: string;

  roles: ProfessionalRole[];
};


export type ProfessionalRole = {
  id: string;
  title: string;

  domainId: string;

  level?: ProfessionalLevel;

  competencies: ProfessionalCompetency[];

  relatedRoles?: string[];

  transferablePaths?: string[];
};


export type ProfessionalCompetency = {
  id: string;
  name: string;

  category:
    | "technical"
    | "operational"
    | "management"
    | "compliance"
    | "administrative";

  description?: string;

  recognitionPatterns?: string[];

  semanticPatterns?: SemanticPattern[];
};


export type ProfessionalProfile = {
  domains: string[];

  roles: string[];

  competencies: string[];

  transferableSkills: string[];

  confidence: number;
};