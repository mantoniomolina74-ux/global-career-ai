import {
  scoreCompetencies
} from "../lib/knowledge/scoring/competencyScorer";

import {
  evaluateKnowledgeDomain
} from "../lib/knowledge/evaluation/knowledgeDomainEvaluator";

import {
  supplyChainDomain
} from "../lib/knowledge/domains/supplyChain";

import {
  procurementDomain
} from "../lib/knowledge/domains/procurementDomain";

import {
  aggregateKnowledgeDomains
} from "../lib/knowledge/aggregation/domainAggregator";


const professionalExperience =
`
Managed strategic suppliers,
negotiated supplier agreements,
processed purchase orders,
and optimized operational costs.
`;


const competencyResults =
  scoreCompetencies(
    professionalExperience
  );


const supplyChainEvaluation =
  evaluateKnowledgeDomain(
    supplyChainDomain,
    competencyResults
  );


const procurementEvaluation =
  evaluateKnowledgeDomain(
    procurementDomain,
    competencyResults
  );


const aggregation =
  aggregateKnowledgeDomains(
    [
      supplyChainEvaluation,
      procurementEvaluation
    ]
  );


console.log(
  "Knowledge Domain Aggregation Result:"
);


console.log(
  JSON.stringify(
    aggregation,
    null,
    2
  )
);