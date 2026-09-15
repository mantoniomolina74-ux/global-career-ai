import {
  KnowledgeDomain
} from "../knowledgeTypes";

export const managementLeadershipDomain: KnowledgeDomain = {

  id: "management_leadership",

  name: "Management & Leadership",

  competencies: [

    {
      competencyId: "personnel_management",
      weight: 1.2
    },

    {
      competencyId: "leadership",
      weight: 1.2
    },

    {
      competencyId: "communication",
      weight: 1.0
    },

    {
      competencyId: "negotiation_conflict_resolution",
      weight: 1.0
    },

    {
      competencyId: "teamwork",
      weight: 0.8
    }

  ]

};
