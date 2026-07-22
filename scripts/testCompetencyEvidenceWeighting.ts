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


const competencyResults =
  scoreCompetencies(
    professionalExperience
  );


console.log(
  "Competency Evaluation Result:"
);


console.log(
  JSON.stringify(
    competencyResults,
    null,
    2
  )
);