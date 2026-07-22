import {
  ProfessionalProfile
} from "../professionalTypes";


export type CareerTransferOpportunity = {
  roleId: string;

  compatibility: number;

  reason: string;
};


export type CareerTransferResult = {
  opportunities: CareerTransferOpportunity[];

  confidence: number;
};


export function analyzeCareerTransfers(
  profile: ProfessionalProfile
): CareerTransferResult {

  const opportunities: CareerTransferOpportunity[] = [];


  if (
    profile.roles.includes(
      "procurement_specialist"
    )
  ) {

    opportunities.push(
      {
        roleId: "operations_coordinator",

        compatibility: 0.75,

        reason:
          "Procurement experience shares operational coordination and process management capabilities."
      },

      {
        roleId: "logistics_specialist",

        compatibility: 0.70,

        reason:
          "Supplier coordination and inventory-related experience transfer to logistics functions."
      },

      {
        roleId: "project_coordinator",

        compatibility: 0.65,

        reason:
          "Planning, documentation and coordination skills are transferable."
      }
    );
  }


  return {
    opportunities,

    confidence:
      opportunities.length > 0
        ? 0.75
        : 0
  };
}