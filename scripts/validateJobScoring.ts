import { scoreJobs } from "../lib/engine/jobScoring";

type Scenario = {
  label: string;
  job: {
    id: string;
    title?: string;
    industry?: string;
    description?: string;
    requires_whmis?: boolean;
    requires_csts?: boolean;
    requires_first_aid?: boolean;
  };
  cv: {
    skills?: string[];
    industries?: string[];
    candidateCertifications?: string[];
    professionalText?: string;
  };
  expected: number;
  baseline: number;
};

const scenarios: Scenario[] = [
  {
    label: "Direct declared skill",
    job: { id: "direct", title: "Welder" },
    cv: { skills: ["welding"] },
    expected: 11.25,
    baseline: 37.5,
  },
  {
    label: "Duplicate skill",
    job: { id: "duplicate", title: "Welder" },
    cv: { skills: ["welding", "welding"] },
    expected: 11.25,
    baseline: 75,
  },
  {
    label: "Industry match",
    job: { id: "industry", industry: "mining" },
    cv: { industries: ["mining"] },
    expected: 5.85,
    baseline: 39,
  },
  {
    label: "Strong transferable evidence",
    job: { id: "transfer-strong", title: "Business Analyst" },
    cv: { skills: ["purchasing"] },
    expected: 5.25,
    baseline: 17.5,
  },
  {
    label: "Moderate transferable evidence",
    job: { id: "transfer-moderate", title: "Business Analyst" },
    cv: { skills: ["management"] },
    expected: 2.75,
    baseline: 8.75,
  },
  {
    label: "Low confidence transferable evidence",
    job: { id: "transfer-low", title: "Business Analyst" },
    cv: { professionalText: "purchasing" },
    expected: 3.5,
    baseline: 17.5,
  },
  {
    label: "Direct and transferable overlap",
    job: { id: "overlap", title: "Business Manager" },
    cv: { skills: ["business", "purchasing"] },
    expected: 11.25,
    baseline: 55,
  },
  {
    label: "All required certifications",
    job: {
      id: "certifications",
      title: "Safety Worker",
      requires_whmis: true,
      requires_csts: true,
      requires_first_aid: true,
    },
    cv: {
      candidateCertifications: [
        "WHMIS 2015",
        "CSTS 2020",
        "Standard First Aid",
      ],
    },
    expected: 25,
    baseline: 25,
  },
  {
    label: "No matching evidence",
    job: { id: "no-match", title: "Accountant" },
    cv: { skills: ["welding"] },
    expected: 0,
    baseline: 0,
  },
  {
    label: "Score cap with multiple distinct matches",
    job: {
      id: "cap",
      title:
        "Welder Heavy Equipment Construction Mining Maintenance Agriculture Business",
      requires_whmis: true,
      requires_csts: true,
      requires_first_aid: true,
    },
    cv: {
      skills: [
        "welding",
        "heavy equipment",
        "construction",
        "mining",
        "maintenance",
        "agriculture",
        "business",
      ],
      candidateCertifications: [
        "WHMIS 2015",
        "CSTS 2020",
        "Standard First Aid",
      ],
    },
    expected: 100,
    baseline: 100,
  },
];

let failures = 0;

console.log("=== JOB SCORING VALIDATION ===");
console.log("");

for (const scenario of scenarios) {
  const result = scoreJobs(
    [scenario.job],
    scenario.cv
  )[0];

  const actual = result.match_score;

  const passed =
    Math.abs(actual - scenario.expected) < 0.000001;

  if (!passed) {
    failures += 1;
  }

  console.log(
    `${passed ? "PASS" : "FAIL"} | ${scenario.label} | ` +
    `Baseline: ${scenario.baseline} | ` +
    `Expected: ${scenario.expected} | ` +
    `Actual: ${actual}`
  );
}

console.log("");
console.log("=== DUPLICATE EXPLANATION VALIDATION ===");

const duplicateResult = scoreJobs(
  [{ id: "explanation", title: "Welder" }],
  { skills: ["welding", "welding"] }
)[0];

const duplicateExplanationPassed =
  duplicateResult.match_explanation.matched_skills.length === 1;

if (!duplicateExplanationPassed) {
  failures += 1;
}

console.log(
  `${duplicateExplanationPassed ? "PASS" : "FAIL"} | ` +
  `Repeated skill appears once in matched_skills | ` +
  `Count: ${duplicateResult.match_explanation.matched_skills.length}`
);

console.log("");
console.log("=== DESCENDING ORDER VALIDATION ===");

const orderedResults = scoreJobs(
  [
    { id: "low", title: "Welder" },
    {
      id: "high",
      title: "Welder",
      requires_whmis: true,
      requires_csts: true,
      requires_first_aid: true,
    },
    { id: "medium", title: "Welder", industry: "mining" },
  ],
  {
    skills: ["welding"],
    industries: ["mining"],
    candidateCertifications: [
      "WHMIS 2015",
      "CSTS 2020",
      "Standard First Aid",
    ],
  }
);

const descendingOrderPassed =
  orderedResults.every(
    (item, index, items) =>
      index === 0 ||
      items[index - 1].match_score >= item.match_score
  );

if (!descendingOrderPassed) {
  failures += 1;
}

console.log(
  `${descendingOrderPassed ? "PASS" : "FAIL"} | ` +
  `Results sorted by descending match_score`
);

console.log("");
console.log("=== FINAL RESULT ===");
console.log(
  `Passed: ${scenarios.length + 2 - failures}/${scenarios.length + 2}`
);
console.log(`Failures: ${failures}`);

if (failures > 0) {
  throw new Error(
    "Job scoring validation failed."
  );
}

console.log("ALL JOB SCORING VALIDATIONS PASSED.");