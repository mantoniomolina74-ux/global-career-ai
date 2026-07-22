import {
  mapCompetencies
} from "../lib/knowledge/mapping/competencyMapper";


const professionalExperience =
  `
  Managed suppliers,
  negotiated purchasing agreements,
  coordinated purchase orders,
  and controlled operational costs.
  `;


const result =
  mapCompetencies({
    text: professionalExperience
  });


console.log(
  "Competency Mapping Result:"
);


console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);