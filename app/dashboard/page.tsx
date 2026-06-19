"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { calculateGlobalReadiness } from "@/lib/engine/readiness/globalReadiness";
import { calculateGapAnalysis } from "@/lib/engine/gapAnalysis/gapAnalysis";
import { getProfile } from "@/lib/engine/profile/getProfile";
import { buildProfileIntelligence } from "@/lib/engine/profile/profileIntelligence";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [profileIntelligence, setProfileIntelligence] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    getProfile(userId)
  .then((profileData) => {
    setProfile(profileData);

    const intelligence =
      buildProfileIntelligence(profileData);

    setProfileIntelligence(intelligence);
  })
  .catch(console.error);

    supabase
      .from("cv_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.length) setCvAnalysis(data[0]);
      });

    fetch(`/api/jobs?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      });

    supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications(data || []);
      });
    supabase
  .from("certifications")
  .select("*")
  .eq("user_id", userId)
  .then(({ data }) => {
    setCertifications(data || []);
  });  
  }, [userId]);

  // ================= CORE UTILITIES =================

  const getColor = (score: number) =>
    score >= 80 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444";

  const getBadge = (score: number) =>
    score >= 80
      ? "🔥 Top Match"
      : score >= 50
      ? "⚡ Good Match"
      : "📉 Low Match";

  // ================= AI DECISION ENGINE =================

  const getJobDecision = (job: any) => {
    const ats = cvAnalysis?.ats_score || 0;
    const match = job.match_score || 0;

    const score = ats * 0.6 + match * 0.4;

    if (score >= 75) {
      return {
        decision: "APPLY",
        color: "#16a34a",
        confidence: score,
        message: "High probability of success",
      };
    }

    if (score >= 50) {
      return {
        decision: "CONSIDER",
        color: "#f59e0b",
        confidence: score,
        message: "Medium chance, optimize CV first",
      };
    }

    return {
      decision: "NO APPLY",
      color: "#ef4444",
      confidence: score,
      message: "Low probability of success",
    };
  };

  // ================= GAP ANALYSIS =================

    const getJobGaps = (job: any) => {
    const cvSkills = cvAnalysis?.skills || [];
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    const missingSkills = cvSkills.filter(
      (s: string) => !jobText.includes(s.toLowerCase())
    );

    const gaps: string[] = [];

    if (missingSkills.length) {
      gaps.push(
        `Missing skills: ${missingSkills.slice(0, 3).join(", ")}`
      );
    }

    if ((cvAnalysis?.ats_score || 0) < 60) {
      gaps.push("ATS score below competitive threshold");
    }

    if (!cvAnalysis?.industry) {
      gaps.push("No defined industry specialization");
    }

    return gaps;
  };
    const averageMatch =
  jobs.length > 0
    ? Math.round(
        jobs.reduce(
          (sum, job) => sum + (job.match_score || 0),
          0
        ) / jobs.length
      )
    : 0;

const topMatches = jobs.filter(
  (job) => (job.match_score || 0) >= 80
).length; 
 const readiness = calculateGlobalReadiness(
  cvAnalysis,
  certifications
);
const gapAnalysis = calculateGapAnalysis(
  cvAnalysis,
  certifications
);
const skillsCount =
  typeof cvAnalysis?.skills === "string"
    ? JSON.parse(cvAnalysis.skills || "[]").length
    : cvAnalysis?.skills?.length || 0;

const professionalSummary = `
International candidate specialized in ${
  cvAnalysis?.industry || "General Industry"
} with ${skillsCount} professional skills and ${
  certifications.length
} certifications.
Current ATS Score: ${
  cvAnalysis?.ats_score || 0
}%.
Global Readiness Level: ${readiness.level}.
`;

  // ================= UI =================

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Arial",
        background: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        🌍 Global Career AI Jobs
      </h1>

      <p style={{ marginBottom: 20, color: "#666" }}>
        AI-powered Autopilot Career System
      </p>

      {!userId && <p>🔐 Loading session...</p>}
      {loading && userId && <p>📦 Loading jobs...</p>}

      {/* ================= METRICS ================= */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
    marginBottom: 25,
  }}
>
  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ margin: 0 }}>💼 Jobs Available</h3>
    <p style={{ fontSize: 28, fontWeight: "bold" }}>
      {jobs.length}
    </p>
  </div>

  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ margin: 0 }}>🎯 Average Match</h3>
    <p style={{ fontSize: 28, fontWeight: "bold" }}>
      {averageMatch}%
    </p>
  </div>

  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ margin: 0 }}>🔥 Top Matches</h3>
    <p style={{ fontSize: 28, fontWeight: "bold" }}>
      {topMatches}
    </p>
  </div>

  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ margin: 0 }}>📌 Applications</h3>
    <p style={{ fontSize: 28, fontWeight: "bold" }}>
      {applications.length}
    </p>
  </div>
</div>
<div
    style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  }}
>
  <h2>🧠 Career Intelligence</</h2>
  <p>
    <strong>Career Level:</strong>{" "}
    {profileIntelligence?.careerLevel || "-"}
  </p>

  <p>
    <strong>Market Fit:</strong>{" "}
    {profileIntelligence?.marketFit || 0}%
  </p>

  <h3>Improvement Areas</h3>

  <ul>
    {profileIntelligence?.improvementAreas?.map(
      (item: string, index: number) => (
        <li key={index}>{item}</li>
      )
    )}
  </ul>
</div>
      {/* ================= GLOBAL READINESS ================= */}

<div
  style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  }}
>
  <h2>🌎 Global Readiness Score</h2>

  <div
    style={{
      background: "#e5e7eb",
      height: 14,
      borderRadius: 10,
      overflow: "hidden",
      marginTop: 15,
    }}
  >
    <div
      style={{
        width: `${readiness.score}%`,
        height: "100%",
        background:
          readiness.score >= 85
            ? "#16a34a"
            : readiness.score >= 70
            ? "#f59e0b"
            : "#ef4444",
      }}
    />
  </div>

  <h3 style={{ marginTop: 15 }}>
    {readiness.score}% — {readiness.level}
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
      gap: 15,
      marginTop: 15,
    }}
  >
    <div>
      <strong>ATS Score</strong>
      <p>{readiness.atsScore}%</p>
    </div>

    <div>
      <strong>Skills</strong>
      <p>{readiness.skillCount}</p>
    </div>

    <div>
      <strong>Certifications</strong>
      <p>{readiness.certificationCount}</p>
    </div>
  </div>

  <div style={{ marginTop: 20 }}>
    <strong>AI Recommendations</strong>

    <ul>
      {readiness.recommendations.map(
        (item: string, index: number) => (
          <li key={index}>{item}</li>
        )
      )}
    </ul>
  </div>
</div>

{/* ================= CAREER GAP ANALYSIS ================= */}

<div
  style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  }}
>
  <h2>🎯 Career Gap Analysis</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: 15,
      marginTop: 15,
    }}
  >
    <div>
      <strong>Readiness Level</strong>
      <p>{gapAnalysis.readiness}</p>
    </div>

    <div>
      <strong>Next Career Step</strong>
      <p>{gapAnalysis.nextCareerStep}</p>
    </div>
  </div>

  <div style={{ marginTop: 20 }}>
    <strong>Missing Skills</strong>

    <ul>
      {gapAnalysis.missingSkills.map(
        (skill: string, index: number) => (
          <li key={index}>{skill}</li>
        )
      )}
    </ul>
  </div>

  <div style={{ marginTop: 20 }}>
    <strong>Recommended Certifications</strong>

    <ul>
      {gapAnalysis.recommendedCertifications.map(
        (cert: string, index: number) => (
          <li key={index}>{cert}</li>
        )
      )}
    </ul>
  </div>
</div>
{/* ================= PROFESSIONAL PROFILE ================= */}

<div
  style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  }}
>
  <h2>👤 Professional Profile</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
      gap: 15,
      marginTop: 15,
    }}
  >
    <div>
      <strong>Industry</strong>
      <p>{cvAnalysis?.industry || "Not Defined"}</p>
    </div>

    <div>
      <strong>ATS Score</strong>
      <p>{cvAnalysis?.ats_score || 0}%</p>
    </div>

    <div>
      <strong>Global Readiness</strong>
      <p>{readiness.score}%</p>
    </div>

    <div>
      <strong>Skills</strong>
      <p>{skillsCount}</p>
    </div>

    <div>
      <strong>Certifications</strong>
      <p>{certifications.length}</p>
    </div>

    <div>
      <strong>Applications</strong>
      <p>{applications.length}</p>
    </div>
  </div>

  <div
    style={{
      marginTop: 20,
      padding: 15,
      borderRadius: 10,
      background: "#f9fafb",
    }}
  >
    <h3>Professional Summary</h3>

    <p
      style={{
        color: "#555",
        lineHeight: 1.6,
      }}
    >
      {professionalSummary}
    </p>
  </div>
</div>
      {/* ================= JOBS ================= */}
      <div style={{ display: "grid", gap: 15 }}>
        {jobs.map((job, index) => {
          const intel = getJobDecision(job);
          const gaps = getJobGaps(job);

          return (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                borderLeft: `6px solid ${getColor(job.match_score)}`,
              }}
            >
              {/* HEADER */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>{job.title}</h2>

                <span
                  style={{
                    fontWeight: "bold",
                    color: getColor(job.match_score),
                  }}
                >
                  {job.match_score}% Match
                </span>
              </div>

              <p
                style={{
                  color: getColor(job.match_score),
                  fontWeight: "bold",
                }}
              >
                {getBadge(job.match_score)}
              </p>

              {/* AI DECISION */}
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: "#f9fafb",
                  borderLeft: `4px solid ${intel.color}`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: "bold",
                    color: intel.color,
                  }}
                >
                  {intel.decision} — {Math.round(intel.confidence)}%
                </p>

                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  {intel.message}
                </p>
              </div>

              <p style={{ marginTop: 10, color: "#555" }}>
                📍 {job.country} • 🏭 {job.industry}
              </p>

              <p style={{ color: "#666" }}>{job.description}</p>

              {/* GAPS */}
              {gaps.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontWeight: "bold" }}>📉 Job gaps</p>
                  <ul>
                    {gaps.map((g: string, i: number) => (
                      <li key={i} style={{ fontSize: 12, color: "#555" }}>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                style={{
                  marginTop: 10,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: getColor(job.match_score),
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                View Job
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= APPLICATIONS ================= */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ marginBottom: 15 }}>📌 Mis Aplicaciones</h2>

        {applications.length === 0 ? (
          <p style={{ color: "#666" }}>No applications yet.</p>
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
                  borderLeft: "5px solid #3b82f6",
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