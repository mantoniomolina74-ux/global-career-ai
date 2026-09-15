import {
  KnowledgeDomain
} from "../knowledgeTypes";

export const securityInvestigationDomain: KnowledgeDomain = {

  id: "security_investigation",

  name: "Security & Investigation",

  competencies: [

    {
      competencyId: "security_management",
      weight: 1.3
    },

    {
      competencyId: "investigation",
      weight: 1.2
    }

  ]

};
