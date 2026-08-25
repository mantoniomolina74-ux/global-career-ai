import {
  LearningPattern,
} from "../../learning-intelligence/learningPatternTypes";

import {
  LearningPolicySignal,
} from "./learningPolicySignal";


export interface LearningPolicyResult {
  signals: LearningPolicySignal[];

  reasoning: string[];
}


export type {
  LearningPattern,
};
