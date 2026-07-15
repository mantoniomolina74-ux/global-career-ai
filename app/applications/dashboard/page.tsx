"use client";

import { useState } from "react";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type Mode = "score" | "rank" | "recruit";

type EngineResponse = {
  success?: boolean;
  error?: string;
  data?: {
    insights?: {
      avgScore?: number;
      marketFitScore?: number;
      totalProcessed?: number;
      distribution?: Record<string, unknown> | unknown[];
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * =========================================================
 * DASHBOARD PRO — GLOBAL CAREER AI
 * =========================================================
 */

export default function DashboardPage() {
  const [mode, setMode] =
    useState<Mode>("score");

  const [loading, setLoading] =
    useState(false);

  const [response, setResponse] =
    useState<EngineResponse | null>(null);

  const [form, setForm] = useState({
    userId: "demo-user",
    jobId: "job-1",
    jobDescription: "",
  });

  /**
   * =====================================================
   * EXECUTE SAAS ENGINE
   * =====================================================
   */

  async function runEngine() {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`/api/saas/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json =
        await res.json();

      setResponse(json);
    } catch (err: unknown) {
      setResponse({
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Request failed",
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * =====================================================
   * RENDER HELPERS
   * =====================================================
   */

  const isScore = mode === "score";
  const isRank = mode === "rank";

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Arial",
        background: "#0b0b0b",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 10 }}>
        🧠 Global Career AI — Control Center
      </h1>

      <p style={{ opacity: 0.7 }}>
        AI-powered ATS • Scoring • Ranking • Recruitment Engine
      </p>

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <button onClick={() => setMode("score")}>
          Score
        </button>

        <button onClick={() => setMode("rank")}>
          Rank
        </button>

        <button onClick={() => setMode("recruit")}>
          Recruit
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 600,
        }}
      >
        <input
          placeholder="User ID"
          value={form.userId}
          onChange={(e) =>
            setForm({
              ...form,
              userId: e.target.value,
            })
          }
        />

        <input
          placeholder="Job ID"
          value={form.jobId}
          onChange={(e) =>
            setForm({
              ...form,
              jobId: e.target.value,
            })
          }
        />

        <textarea
          placeholder={
            isScore
              ? "Paste job description for scoring..."
              : isRank
              ? "Rank mode: optional job context..."
              : "Recruit mode: job description for hiring decision..."
          }
          value={form.jobDescription}
          onChange={(e) =>
            setForm({
              ...form,
              jobDescription:
                e.target.value,
            })
          }
          rows={5}
        />
      </div>

      <div style={{ marginTop: 15 }}>
        <button
          onClick={runEngine}
          disabled={loading}
        >
          {loading
            ? "Processing AI..."
            : `Run ${mode.toUpperCase()} Engine`}
        </button>
      </div>

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <div>
          <h3>Raw Output</h3>

          <pre
            style={{
              background: "#111",
              padding: 12,
              overflow: "auto",
              height: 400,
            }}
          >
            {response
              ? JSON.stringify(
                  response,
                  null,
                  2
                )
              : "No data"}
          </pre>
        </div>

        <div>
          <h3>Insights</h3>

          {response?.data?.insights && (
            <div
              style={{
                background: "#111",
                padding: 12,
                height: 400,
              }}
            >
              <p>
                <b>Mode:</b> {mode}
              </p>

              {response.data.insights.avgScore && (
                <p>
                  Avg Score:{" "}
                  {
                    response.data.insights.avgScore
                  }
                </p>
              )}

              {response.data.insights.marketFitScore && (
                <p>
                  Market Fit:{" "}
                  {
                    response.data.insights.marketFitScore
                  }
                </p>
              )}

              {response.data.insights.totalProcessed && (
                <p>
                  Candidates:{" "}
                  {
                    response.data.insights.totalProcessed
                  }
                </p>
              )}

              {response.data.insights.distribution && (
  <pre>
    {JSON.stringify(
      response.data.insights.distribution,
      null,
      2
    )}
  </pre>
)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}