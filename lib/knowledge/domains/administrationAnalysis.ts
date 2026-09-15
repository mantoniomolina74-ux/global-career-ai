import {
  KnowledgeDomain
} from "../knowledgeTypes";

export const administrationAnalysisDomain: KnowledgeDomain = {

  id: "administration_analysis",

  name: "Administration & Analysis",

  competencies: [

    {
      competencyId: "administration",
      weight: 1.2
    },

    {
      competencyId: "data_analysis",
      weight: 1.1
    },

    {
      competencyId: "research_information",
      weight: 1.0
    },

    {
      competencyId: "digital_tools",
      weight: 0.8
    }

  ]

};
