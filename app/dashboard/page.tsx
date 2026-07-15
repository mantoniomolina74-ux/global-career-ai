import { getDashboardData } from "@/lib/dashboard/dashboardAdapter.v1";

export default async function DashboardPage() {
  const data = await getDashboardData("demo-user");

  if (!data || data.empty || !data.analytics) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Career Intelligence Dashboard</h1>
        <p>No data available yet. Start using the system to generate insights.</p>
      </div>
    );
  }

  const analytics = data.analytics;

  return (
    <div style={{ padding: 24 }}>
      <h1>Career Intelligence Dashboard</h1>

      <h2>Performance</h2>
      <p>
           ATS Avg: {(analytics?.performance?.avgATS ?? 0).toFixed(2)}
      </p>
      <p>
          Ranking Avg: {(analytics?.performance?.avgRanking ?? 0).toFixed(2)}
      </p>

      <h2>Funnel</h2>
      <p>Applications: {analytics.funnel.applications}</p>
      <p>
        Hire Probability:{" "}
        {(analytics.funnel.estimatedHireProbability * 100).toFixed(1)}%
      </p>

      <h2>Status</h2>
      <strong>{data.ui?.status ?? "UNKNOWN"}</strong>

      <h2>Insights</h2>
      <ul>
        {(analytics?.insights ?? []).map((i: string, idx: number) => (
  <li key={idx}>{i}</li>
))}
      </ul>
    </div>
  );
}