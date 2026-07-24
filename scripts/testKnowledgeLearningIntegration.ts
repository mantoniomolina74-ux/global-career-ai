import {
  analyzeKnowledgeProfile
} from "../lib/knowledge/services/knowledgeProfileService";

import {
  getLearningEvents,
  clearLearningEvents
} from "../lib/engine/learning/learningMemory.store";

const professionalText = `
Profesional con experiencia en gestión de proveedores,
compras, negociación, control de inventarios,
planeación de demanda y mejora de procesos.

Ha trabajado coordinando operaciones de supply chain,
evaluando proveedores y optimizando costos.
`;

const testUserId = "knowledge-test-user-001";
async function run() {

  console.log(
    "=== ADR-013.6 Knowledge Learning Integration Test ==="
  );


  clearLearningEvents();


  console.log(
    "\n1. Testing without user context..."
  );


  const withoutUser =
    analyzeKnowledgeProfile(
      professionalText
    );


  console.log(
    "Knowledge Analysis generated:",
    !!withoutUser.analysis
  );


  console.log(
    "Learning events:",
    getLearningEvents().length
  );

}


run();
  console.log(
    "\n2. Testing with user context..."
  );


  clearLearningEvents();


  const withUser =
    analyzeKnowledgeProfile(
      professionalText,
      {
        userId: testUserId
      }
    );


  console.log(
    "Knowledge Analysis generated:",
    !!withUser.analysis
  );


  const events =
    getLearningEvents();


  console.log(
    "Learning events:",
    events.length
  );


  console.log(
    "Latest event:",
    JSON.stringify(
      events[0],
      null,
      2
    )
  );