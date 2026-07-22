import {
  analyzeProfessionalKnowledge
} from "../lib/knowledge/adapters/professionalKnowledgeAdapter";

import {
  analyzeCareerTransfers
} from "../lib/knowledge/transfer/careerTransferEngine";


const professionalInput = {
  skills: [
    "Supplier Management",
    "Purchase Orders",
    "Vendor Coordination",
    "Cost Control",
    "Inventory Coordination"
  ],

  industries: [
    "Industrial Operations"
  ],

  experience: [
    "Procurement Coordinator",
    "Operations Support"
  ]
};


const professionalProfile =
  analyzeProfessionalKnowledge(
    professionalInput
  );


console.log(
  "Professional Profile:"
);

console.log(
  JSON.stringify(
    professionalProfile,
    null,
    2
  )
);


const transferAnalysis =
  analyzeCareerTransfers(
    professionalProfile
  );


console.log(
  "\nCareer Transfer Opportunities:"
);

console.log(
  JSON.stringify(
    transferAnalysis,
    null,
    2
  )
);