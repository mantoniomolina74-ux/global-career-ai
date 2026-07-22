import {
  scoreCompetencies
} from "../lib/knowledge/scoring/competencyScorer";

import {
  evaluateKnowledgeDomain
} from "../lib/knowledge/evaluation/knowledgeDomainEvaluator";

import {
  getKnowledgeDomains,
  getKnowledgeDomainById
} from "../lib/knowledge/knowledgeDomainCatalog";


console.log(
  "=== Knowledge Domain Hierarchy Validation ==="
);


const domains =
  getKnowledgeDomains();


console.log(
  "\nRegistered Domains:"
);


console.log(
  JSON.stringify(
    domains.map(
      domain => ({
        id: domain.id,
        name: domain.name,
        parentDomainId:
          domain.parentDomainId
      })
    ),
    null,
    2
  )
);



const supplyChainDomain =
  getKnowledgeDomainById(
    "supply_chain"
  );


const procurementDomain =
  getKnowledgeDomainById(
    "procurement"
  );


console.log(
  "\nHierarchy Validation:"
);


console.log(
  JSON.stringify(
    {
      supplyChainExists:
        Boolean(supplyChainDomain),

      procurementExists:
        Boolean(procurementDomain),

      procurementParent:
        procurementDomain?.parentDomainId

    },
    null,
    2
  )
);



if (!procurementDomain) {

  throw new Error(
    "Procurement domain not found"
  );

}



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
  "\nKnowledge Domain Evaluation Result:"
);


console.log(
  JSON.stringify(
    domainEvaluation,
    null,
    2
  )
);



console.log(
  "\nDomain Competency Weights:"
);


console.log(
  JSON.stringify(
    procurementDomain.competencies,
    null,
    2
  )
);