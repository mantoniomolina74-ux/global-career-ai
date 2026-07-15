export interface CalibrationWeights {
  ats: number;
  ranking: number;
  recommendation: number;
  cv: number;
  learning: number;
  semantic: number;
}

const DEFAULT_WEIGHTS: CalibrationWeights = {
  ats: 0.30,
  ranking: 0.25,
  recommendation: 0.25,
  cv: 0.10,
  learning: 0.10,
  semantic: 1.00,
};

let activeWeights = { ...DEFAULT_WEIGHTS };

export function getCalibrationWeights(): CalibrationWeights {
  return activeWeights;
}

export function updateCalibrationWeights(
  weights: Partial<CalibrationWeights>
) {
  activeWeights = {
    ...activeWeights,
    ...weights,
  };
}

export function resetCalibrationWeights() {
  activeWeights = { ...DEFAULT_WEIGHTS };
}