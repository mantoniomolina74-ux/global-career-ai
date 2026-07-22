export const SCORING_WEIGHTS = {
  skillsMatch: 25,
  industryMatch: 30,

  certifications: {
    whmis: 10,
    csts: 10,
    firstAid: 5
  },
  
geography: {
  countryMatch: 5
},

  context: {
    title: 1.5,
    industry: 1.3,
    category: 1.2,
    tags: 1.1,
    description: 1.0
  },

  confidenceBonus: {
    twoFields: 2,
    threeFields: 4,
    fourOrMoreFields: 6
  }
};

export const SCORE_LIMITS = {
  maxScore: 100
};

export const EVIDENCE_WEIGHTS = {
  relevance: {
    direct: 1.0,
    related: 0.75,
    transferable: 0.45,
    irrelevant: 0
  },

  confidence: {
  verified: 1.0,
  inferred: 0.75,
  uncertain: 0.5,

  high: 1.0,
  medium: 0.75,
  low: 0.5
},

  experience: {
  lessThanOneYear: 0.4,
  oneToThreeYears: 0.7,
  threeToFiveYears: 0.9,
  moreThanFiveYears: 1.0,
  maxYearsContribution: 10
},

  accumulation: {
    diminishingReturns: 0.5
  },

  limits: {
    maxSingleEvidenceContribution: 100,
    maxSkillEvidenceScore: 100
  }
};