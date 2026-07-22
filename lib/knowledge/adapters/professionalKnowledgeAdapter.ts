import {
  ProfessionalProfile
} from "../professionalTypes";


export type KnowledgeAdapterInput = {
  skills: string[];
  industries?: string[];
  experience?: string[];
};


export function analyzeProfessionalKnowledge(
  input: KnowledgeAdapterInput
): ProfessionalProfile {

  const normalizedSkills = input.skills.map(
    skill => skill.toLowerCase()
  );


  const procurementIndicators = [
    "supplier",
    "purchase",
    "procurement",
    "purchasing",
    "vendor",
    "orders"
  ];


  const procurementMatches =
    normalizedSkills.filter(skill =>
      procurementIndicators.some(indicator =>
        skill.includes(indicator)
      )
    );


  const confidence =
    procurementMatches.length > 0
      ? Math.min(
          procurementMatches.length / 5,
          1
        )
      : 0;


  return {
    domains:
      procurementMatches.length > 0
        ? ["procurement_supply_chain"]
        : [],

    roles:
      procurementMatches.length > 0
        ? ["procurement_specialist"]
        : [],

    competencies: procurementMatches,

    transferableSkills: [],

    confidence
  };
}