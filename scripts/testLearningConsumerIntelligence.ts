import "dotenv/config";

import {
  processLearningEventBatch,
} from "../lib/engine/learning/consumers/learningEventConsumer";

import {
  WeightState,
} from "../lib/engine/learning/weights/learningWeights.engine";


const event = {
  type: "REJECTION_RECEIVED",

  timestamp:
    Date.now(),

  payload: {
    applicationId:
      "application-001",

    status:
      "REJECTED",

    success:
      false,

    confidence:
      0.75,

    context: {
      industry:
        "Mining",

      country:
        "Canada",

      skills: [
        "equipment-operation",
        "safety",
      ],

      missingSkills: [
        "hydraulic-systems",
      ],
    },
  },
};


const initialState: WeightState = {
  atsMultiplier: 1,
  rankingMultiplier: 1,
  decisionSensitivity: 1,
};


const history: WeightState[] = [
  initialState,
];


const result =
  processLearningEventBatch(
    [event],
    initialState,
    history,
  );


console.log(
  "Final Weight State:",
  JSON.stringify(
    result,
    null,
    2,
  ),
);