import {
  scoreCompetencies
} from "../lib/knowledge/scoring/competencyScorer";

import {
  procurementDomain
} from "../lib/knowledge/domains/procurementDomain";

import {
  evaluateKnowledgeDomain
} from "../lib/knowledge/evaluation/knowledgeDomainEvaluator";


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


const domainEvaluation =
  evaluateKnowledgeDomain(
    procurementDomain,
    competencyResults
  );


console.log(
  "Knowledge Domain Evaluation Result:"
);


console.log(
  JSON.stringify(
    domainEvaluation,
    null,
    2
  )
);


console.log(
  "\nDomain Scoring Strategy:"
);


console.log(
  JSON.stringify(
    procurementDomain.competencies,
    null,
    2
  )
);