import {
  scoreCompetencies
} from "../lib/knowledge/scoring/competencyScorer";


const professionalExperience =
  `
  Managed strategic suppliers,
  negotiated supplier agreements,
  processed purchase orders,
  and optimized operational costs.
  `;


const result =
  scoreCompetencies(
    professionalExperience
  );


console.log(
  "Competency Scoring Result:"
);


console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);