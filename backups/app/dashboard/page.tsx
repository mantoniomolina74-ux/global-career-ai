"use client";

import { analyzeCvGap } from "@/lib/engine/cvGapAnalysis";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    // JOBS
    fetch(`/api/jobs?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      });

    // APPLICATIONS
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications(data || []);
      });
  }, [userId]);

  const getColor = (score: number) => {
    if (score >= 80) return "#16a34a";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getBadge = (score: number) => {
    if (score >= 80) return "🔥 Top Match";
    if (score >= 50) return "⚡ Good Match";
    return "📉 Low Match";
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Arial",
        background: "#f4f6f8",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        🌍 Global Career AI Jobs
      </h1>

      <p style={{ marginBottom: 20, color: "#666" }}>
        Personalized international job recommendations powered by AI
      </p>

      {!userId && <p>🔐 Loading user session...</p>}
      {loading && userId && <p>📦 Loading jobs...</p>}

      {/* ================= JOBS ================= */}
      <div style={{ display: "grid", gap: 15 }}>
        {jobs.map((job, index) => (
          <div
            key={index}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              borderLeft: `6px solid ${getColor(job.match_score)}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0 }}>{job.title}</h2>

              <span style={{ fontWeight: "bold", color: getColor(job.match_score) }}>
                {job.match_score}% Match
              </span>
            </div>

            <p style={{ color: getColor(job.match_score), fontWeight: "bold" }}>
              {getBadge(job.match_score)}
            </p>

            <p style={{ color: "#555" }}>
              📍 {job.country} • 🏭 {job.industry}
            </p>

            <p style={{ color: "#666" }}>{job.description}</p>

            <button
              style={{
                marginTop: 10,
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                background: getColor(job.match_score),
                color: "white",
                fontWeight: "bold"
              }}
            >
              View Job
            </button>
          </div>
        ))}
      </div>

      {/* ================= APPLICATIONS ================= */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ marginBottom: 15 }}>📌 Mis Aplicaciones</h2>

        {applications.length === 0 ? (
          <p style={{ color: "#666" }}>
            No hay aplicaciones aún.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {applications.map((app, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: 16,
                  borderRadius: 10,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderLeft: "5px solid #3b82f6"
                }}
              >
                <h3 style={{ margin: 0 }}>{app.position}</h3>

                <p style={{ margin: "5px 0", color: "#555" }}>
                  🏢 {app.company} • 📍 {app.country}
                </p>

                <p style={{ margin: 0, color: "#666" }}>
                  📅 {new Date(app.application_date).toLocaleDateString()}
                </p>

                <p style={{ marginTop: 8, fontWeight: "bold", color: "#3b82f6" }}>
                  Status: {app.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}