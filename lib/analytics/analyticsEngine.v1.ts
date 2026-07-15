import { LearningMemory } from "@/lib/engine/learning/memory/learningMemoryEngine.v2";
import { UserAnalytics } from "./analyticsTypes";

/**

* ============================================================
* Global Career AI
* Analytics Engine V1 (Product Intelligence Layer)
* ============================================================
  */

export function generateUserAnalytics(
memory: LearningMemory,
_rankingScore?: number
): UserAnalytics {
const atsHistory = memory.trends.atsHistory || [];
const rankingHistory = memory.trends.rankingHistory || [];
const decisionHistory = memory.trends.decisionHistory || [];
const recommendationHistory = memory.trends.recommendationHistory || [];

const avg = (arr: number[]) =>
arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const avgATS = avg(atsHistory);
const avgRanking = avg(rankingHistory);
const avgDecisionScore = avg(
decisionHistory.map((d) => d.score || 0)
);
const avgRecommendationScore = avg(recommendationHistory);

const applications = atsHistory.length;

const highScoreApplications = atsHistory.filter((s) => s >= 75).length;

const estimatedInterviewRate =
applications === 0
? 0
: highScoreApplications / applications;

const estimatedHireProbability =
(avgATS * 0.4 +
avgRanking * 0.3 +
avgDecisionScore * 0.2 +
avgRecommendationScore * 0.1) / 100;

const improvementRate =
atsHistory.length < 2
? 0
: (atsHistory[atsHistory.length - 1] - atsHistory[0]) /
atsHistory.length;

const volatility =
atsHistory.length < 2
? 0
: Math.sqrt(
atsHistory.reduce((acc, val) => {
const mean = avgATS;
return acc + Math.pow(val - mean, 2);
}, 0) / atsHistory.length
);

const insights: string[] = [];

if (avgATS < 50) insights.push("Low ATS performance baseline");
if (estimatedInterviewRate < 0.3)
insights.push("Low interview conversion potential");
if (improvementRate > 5)
insights.push("Strong upward performance trend");
if (volatility > 20)
insights.push("High performance instability detected");

return {
userId: memory.userId,

performance: {
  avgATS,
  avgRanking,
  avgDecisionScore,
  avgRecommendationScore,
},

funnel: {
  applications,
  highScoreApplications,
  estimatedInterviewRate,
  estimatedHireProbability,
},

trends: {
  improvementRate,
  volatility,
},

insights,

};
}