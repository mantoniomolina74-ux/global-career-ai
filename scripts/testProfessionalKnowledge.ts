import {
  analyzeProfessionalKnowledge
} from "../lib/knowledge/adapters/professionalKnowledgeAdapter";


const testProfile = {
  skills: [
    "Supplier Management",
    "Purchase Orders",
    "Vendor Coordination",
    "Cost Control",
    "Industrial Safety"
  ],

  industries: [
    "Industrial Operations"
  ],

  experience: [
    "Procurement Coordinator",
    "Operations Support"
  ]
};


const result =
  analyzeProfessionalKnowledge(testProfile);


console.log(
  "Professional Knowledge Analysis:"
);

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);