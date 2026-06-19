export interface Application {
  id: string;
  company: string;
  position: string;
  country: string;
  industry?: string;
  job_type?: string;
  salary?: number;
  currency?: string;
  source?: string;
  application_date: string;
  interview_date?: string;
  offer_date?: string;
  rejection_date?: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationInsights {
  totalApplications: number;
  interviewRate: number;
  offerRate: number;
  successRate: number;

  statusBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  industryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  jobTypeBreakdown: Record<string, number>;

  avgSalary?: number;

  recommendations: string[];
  weakPoints: string[];

  applicationScores: Record<string, number>;
}

export function generateApplicationInsights(
  applications: Application[]
): ApplicationInsights {
  const totalApplications = applications.length;

  const interviews = applications.filter(app =>
    ["Interview Scheduled", "Final Interview"].includes(app.status)
  ).length;

  const offers = applications.filter(app =>
    app.status === "Offer Received"
  ).length;

  const hired = applications.filter(app =>
    app.status === "Hired"
  ).length;

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviews / totalApplications) * 100)
      : 0;

  const offerRate =
    totalApplications > 0
      ? Math.round((offers / totalApplications) * 100)
      : 0;

  const successRate =
    totalApplications > 0
      ? Math.round((hired / totalApplications) * 100)
      : 0;

  const statusBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};
  const industryBreakdown: Record<string, number> = {};
  const sourceBreakdown: Record<string, number> = {};
  const jobTypeBreakdown: Record<string, number> = {};

  let salarySum = 0;
  let salaryCount = 0;

  applications.forEach(app => {
    if (app.status) {
      statusBreakdown[app.status] =
        (statusBreakdown[app.status] || 0) + 1;
    }

    if (app.country) {
      countryBreakdown[app.country] =
        (countryBreakdown[app.country] || 0) + 1;
    }

    if (app.industry) {
      industryBreakdown[app.industry] =
        (industryBreakdown[app.industry] || 0) + 1;
    }

    if (app.source) {
      sourceBreakdown[app.source] =
        (sourceBreakdown[app.source] || 0) + 1;
    }

    if (app.job_type) {
      jobTypeBreakdown[app.job_type] =
        (jobTypeBreakdown[app.job_type] || 0) + 1;
    }

    if (app.salary) {
      salarySum += app.salary;
      salaryCount++;
    }
  });

  const avgSalary =
    salaryCount > 0 ? Math.round(salarySum / salaryCount) : undefined;

  const recommendations: string[] = [];
  const weakPoints: string[] = [];
  const applicationScores: Record<string, number> = {};

  // -------------------------
  // AI INSIGHTS (WEAK POINTS)
  // -------------------------

  if (interviewRate < 10 && totalApplications > 5) {
    weakPoints.push(
      "Low interview rate: your CV or targeting may not match job requirements."
    );
  }

  if (offerRate < 5 && interviews > 0) {
    weakPoints.push(
      "Low offer rate: interviews are not converting into offers."
    );
  }

  if (interviews > 0 && offers === 0) {
    weakPoints.push(
      "Critical issue: interviews are not producing any offers."
    );
  }

  if (totalApplications > 20 && interviews === 0) {
    weakPoints.push(
      "No interviews despite high activity: ATS/CV optimization needed."
    );
  }

  if (hired === 0 && offers > 3) {
    weakPoints.push(
      "Offers not converting into hires: negotiation or decision issues."
    );
  }

  // -------------------------
  // AI SCORING POR APLICACIÓN
  // -------------------------

  applications.forEach(app => {
    let score = 0;

    switch (app.status) {
      case "Applied":
        score = 20;
        break;
      case "Under Review":
        score = 40;
        break;
      case "Interview Scheduled":
        score = 60;
        break;
      case "Final Interview":
        score = 75;
        break;
      case "Offer Received":
        score = 90;
        break;
      case "Hired":
        score = 100;
        break;
      case "Rejected":
        score = 0;
        break;
      default:
        score = 10;
    }

    // calidad del perfil
    if (app.notes) score += 2;
    if (app.industry) score += 2;
    if (app.job_type) score += 2;
    if (app.salary) score += 3;
    if (app.source) score += 1;

    // señales de proceso
    if (app.interview_date) score += 3;
    if (app.offer_date) score += 5;

    if (score > 100) score = 100;

    applicationScores[app.id] = score;
  });

  // -------------------------
  // RULE-BASED RECOMMENDATIONS
  // -------------------------

  if (interviewRate < 10) {
    recommendations.push(
      "Low interview rate: improve CV alignment and ATS keywords."
    );
  }

  if (offerRate < 5) {
    recommendations.push(
      "Low offer rate: focus on roles matching your strongest skills."
    );
  }

  if (totalApplications < 10) {
    recommendations.push(
      "Increase application volume to improve statistical reliability."
    );
  }

  if (avgSalary && avgSalary < 20000) {
    recommendations.push(
      "Consider targeting higher salary bands or international roles."
    );
  }

  return {
    totalApplications,
    interviewRate,
    offerRate,
    successRate,
    statusBreakdown,
    countryBreakdown,
    industryBreakdown,
    sourceBreakdown,
    jobTypeBreakdown,
    avgSalary,
    recommendations,
    weakPoints,
    applicationScores,
  };
}