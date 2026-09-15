import {
  KnowledgeDomain
} from "../knowledgeTypes";

export const operationsDomain: KnowledgeDomain = {

  id: "operations",

  name: "Operations",

  competencies: [

    {
      competencyId: "operational_supervision",
      weight: 1.2
    },

    {
      competencyId: "planning_coordination",
      weight: 1.2
    },

    {
      competencyId: "resource_management",
      weight: 1.0
    },

    {
      competencyId: "decision_making",
      weight: 1.0
    }

  ]

};
