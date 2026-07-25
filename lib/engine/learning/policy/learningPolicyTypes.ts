import { LearningSignal } from "../weights/learningWeights.engine";

import {
  LearningPattern,
} from "../../learning-intelligence/learningPatternTypes";


export interface LearningPolicyResult {
  signals: LearningSignal[];

  reasoning: string[];
}


export type {
  LearningPattern,
};