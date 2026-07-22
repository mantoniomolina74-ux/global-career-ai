import {
  KnowledgeDomain
} from "../knowledgeTypes";


/**
 * Procurement knowledge domain.
 *
 * Produced by ADR-012 Knowledge Domain Intelligence Engine.
 *
 * Extended by ADR-013.1 Domain Scoring Strategy.
 */
export const procurementDomain: KnowledgeDomain = {

  id: "procurement",

  name: "Procurement",

  competencies: [

    {
      competencyId:
        "supplier_management",

      weight:
        1.3
    },


    {
      competencyId:
        "purchase_management",

      weight:
        1.0
    },


    {
      competencyId:
        "negotiation",

      weight:
        1.2
    },


    {
      competencyId:
        "cost_control",

      weight:
        0.8
    }

  ]

};