import { getApplicationInsights } from "../applications/applicationInsights";

type ApplicationInsights = Awaited<
  ReturnType<typeof getApplicationInsights>
>;

export interface CareerCopilotInsights {
  primaryProblem: string;
  rootCause: string;

  strategyMode:
    | "Fix Profile"
    | "Optimize Conversion"
    | "Scale Applications";

  mustDoNow: string;
  criticalActions: string[];
  secondaryActions: string[];
}

/* =========================================================
   CAREER COPILOT ENGINE (USES EXISTING INSIGHTS ONLY)
========================================================= */

export function generateCareerCopilotInsights(
  insights: ApplicationInsights
): CareerCopilotInsights {
  const interviewRate =
    (insights.funnel.conversionRate || 0) * 100;

  const offerRate =
    (insights.funnel.offerRate || 0) * 100;

  const successRate =
    (insights.funnel.successRate || 0) * 100;

  const lowInterviews = interviewRate < 20;
  const lowOffers = offerRate < 15;
  const lowSuccess = successRate < 10;

  /* =========================================================
     CASE 1: LOW INTERVIEWS
  ========================================================= */
  if (lowInterviews) {
    return {
      primaryProblem: "Low interview conversion rate",
      rootCause:
        "CV is not matching ATS filters or lacks keyword alignment",

      strategyMode: "Fix Profile",

      mustDoNow:
        "Stop mass applying and optimize your CV immediately",

      criticalActions: [
        "Rewrite CV using ATS structure",
        "Align keywords with job descriptions",
        "Focus only on 1–2 target industries",
        "Remove irrelevant experience",
      ],

      secondaryActions: [
        "Apply only to high match roles",
        "Standardize CV format",
      ],
    };
  }

  /* =========================================================
     CASE 2: LOW OFFERS
  ========================================================= */
  if (!lowInterviews && lowOffers) {
    return {
      primaryProblem: "Low interview-to-offer conversion",
      rootCause:
        "Interview performance is not strong enough",

      strategyMode: "Optimize Conversion",

      mustDoNow:
        "Improve interview skills before applying more",

      criticalActions: [
        "Practice technical interviews daily",
        "Use STAR method for answers",
        "Conduct mock interviews",
        "Identify weak areas",
      ],

      secondaryActions: [
        "Improve communication clarity",
        "Review past interviews",
      ],
    };
  }

  /* =========================================================
     CASE 3: LOW SUCCESS
  ========================================================= */
  if (offerRate > 20 && lowSuccess) {
    return {
      primaryProblem: "Offers not converting into hires",
      rootCause:
        "Negotiation or decision-making issues",

      strategyMode: "Optimize Conversion",

      mustDoNow:
        "Improve negotiation and decision strategy",

      criticalActions: [
        "Learn salary negotiation frameworks",
        "Compare offers properly",
        "Clarify expectations early",
        "Evaluate company fit",
      ],

      secondaryActions: [
        "Study compensation benchmarks",
        "Improve decision criteria",
      ],
    };
  }

  /* =========================================================
     CASE 4: GLOBAL WEAK PERFORMANCE
  ========================================================= */
  if (lowInterviews && lowOffers && lowSuccess) {
    return {
      primaryProblem: "Severe market mismatch",
      rootCause:
        "Profile not aligned with job market expectations",

      strategyMode: "Fix Profile",

      mustDoNow:
        "Rebuild your CV and reposition your profile",

      criticalActions: [
        "Rebuild CV from scratch",
        "Redefine target roles",
        "Analyze job descriptions",
        "Reduce application volume",
      ],

      secondaryActions: [
        "Focus on one geographic market",
        "Benchmark successful profiles",
      ],
    };
  }

  /* =========================================================
     DEFAULT
  ========================================================= */
  return {
    primaryProblem: "Stable performance",
    rootCause: "No critical issues detected",

    strategyMode: "Scale Applications",

    mustDoNow:
      "Continue applying while optimizing gradually",

    criticalActions: [
      "Maintain application flow",
      "Track interview feedback",
      "Improve CV incrementally",
    ],

    secondaryActions: [
      "Expand to similar roles",
      "Optimize based on data",
    ],
  };
}