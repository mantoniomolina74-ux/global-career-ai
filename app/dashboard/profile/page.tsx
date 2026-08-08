"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { KnowledgeProfile } from "@/lib/knowledge/knowledgeTypes";



/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type UserProfile = {
  id: string;
  email?: string;
};

type CvAnalysis = {
  id: string;
  user_id: string;
  ats_score?: number;
  industry?: string;
  skills?: string[] | string | null;
  created_at?: string;
};

type Certification = {
  id?: string;
  name?: string;
  issuing_body?: string;
  country?: string;
};
/**
 * =========================================================
 * PROFILE PAGE
 * =========================================================
 */

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [cv, setCv] =
    useState<CvAnalysis | null>(null);

  const [certifications, setCertifications] =
    useState<Certification[]>([]);

  const [knowledgeProfile, setKnowledgeProfile] =
    useState<KnowledgeProfile | null>(null);

  /**
   * =====================================================
   * LOAD PROFILE DATA
   * =====================================================
   */

  const init = useCallback(async () => {
    const { data } =
      await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email ?? undefined,
    });

    const { data: cvData } =
      await supabase
        .from("cv_analyses")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

    if (cvData && cvData.length > 0) {
      setCv(cvData[0] as CvAnalysis);
    }

    const { data: certData } =
      await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", data.user.id);

    setCertifications(
      (certData ?? []) as Certification[]
    );

    try {

  const response =
    await fetch(
      "/api/knowledge/profile"
    );

  if (response.ok) {

    const result =
      await response.json();

    setKnowledgeProfile(
      result.profile
    );

  }

} catch (error) {

  console.error(
    "Knowledge profile error:",
    error
  );

}
  }, [router]);

  useEffect(() => {
  let mounted = true;

  async function loadProfile() {
    if (mounted) {
      await init();
    }
  }

  void loadProfile();

  return () => {
    mounted = false;
  };
}, [init]);

  /**
   * =====================================================
   * SKILLS NORMALIZATION
   * =====================================================
   */

  const skills: string[] = (() => {
    if (!cv?.skills) {
      return [];
    }

    if (Array.isArray(cv.skills)) {
      return cv.skills;
    }

    try {
      const parsed =
        JSON.parse(cv.skills);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  })();

  // ================= CAREER ENGINE =================

  const getCareerLevel = () => {
    const ats = cv?.ats_score || 0;
    const skillCount = skills.length;
    const certCount = certifications.length;

    const score =
      ats * 0.5 +
      skillCount * 2 +
      certCount * 5;

    if (score >= 120) return "Advanced";
    if (score >= 80) return "Senior";
    if (score >= 40) return "Mid-level";

    return "Junior";
  };

  const getProfileStrength = () => {
    const hasCV = cv ? 40 : 0;
    const hasSkills =
      skills.length > 0 ? 20 : 0;
    const hasCerts =
      certifications.length > 0 ? 20 : 0;
    const hasIndustry =
      cv?.industry ? 20 : 0;

    return (
      hasCV +
      hasSkills +
      hasCerts +
      hasIndustry
    );
  };

  // ================= CAREER GAP INTELLIGENCE =================

  const getCareerGap = () => {
    const ats = cv?.ats_score || 0;

    const gaps: string[] = [];

    if (ats < 70) {
      gaps.push(
        "Improve ATS optimization (keywords + structure)"
      );
    }

    if (skills.length < 5) {
      gaps.push(
        "Add more professional / technical skills"
      );
    }

    if (certifications.length === 0) {
      gaps.push(
        "Add at least 1 international certification"
      );
    }

    if (!cv?.industry) {
      gaps.push(
        "Define a clear target industry"
      );
    }

    return gaps;
  };

  const getCareerUpgrade = () => {
    const ats = cv?.ats_score || 0;

    if (ats >= 80) {
      return "Ready for Senior / International roles 🌍";
    }

    if (ats >= 60) {
      return "Close to Senior level. Focus on specialization.";
    }

    if (ats >= 40) {
      return "Mid-level profile. Needs optimization and skill growth.";
    }

    return "Junior profile. Focus on core skills + certifications.";
  };

  const getMarketFit = () => {
    const ats = cv?.ats_score || 0;
    const score =
      ats +
      skills.length * 3;

    if (score >= 120) {
      return "High global competitiveness 🌍";
    }

    if (score >= 80) {
      return "Medium competitiveness 📊";
    }

    return "Emerging profile 📈";
  };

  const getAIRecommendations = () => {
    const recommendations: string[] = [];

    if ((cv?.ats_score || 0) < 70) {
      recommendations.push(
        "Improve ATS score by adding more industry-specific keywords."
      );
    }

    if (skills.length < 5) {
      recommendations.push(
        "Add more technical and professional skills to your profile."
      );
    }

    if (certifications.length === 0) {
      recommendations.push(
        "Earn at least one international certification."
      );
    }

    if (!cv?.industry) {
      recommendations.push(
        "Define a target industry to improve job matching."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Excellent profile. Continue applying for international opportunities."
      );
    }

    return recommendations;
  };

    return (
    <div
      style={{
        padding: 30,
        fontFamily: "Arial",
        background: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 5 }}>
        👤 Professional Profile
      </h1>

      <p style={{ color: "#666", marginBottom: 20 }}>
        Your AI-powered career identity
      </p>

      {/* HEADER */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>
          {user?.email}
        </h2>

        <p style={{ color: "#666" }}>
          User ID: {user?.id}
        </p>
      </div>

      {/* CAREER LEVEL */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2>
          🚀 Career Level
        </h2>

        <p
          style={{
            fontSize: 22,
            fontWeight: "bold",
          }}
        >
          {getCareerLevel()}
        </p>

        <h3>
          📊 Profile Strength
        </h3>

        <div
          style={{
            background: "#e5e7eb",
            height: 10,
            borderRadius: 5,
          }}
        >
          <div
            style={{
              width: `${getProfileStrength()}%`,
              height: "100%",
              background:
                getProfileStrength() > 70
                  ? "#16a34a"
                  : "#f59e0b",
              borderRadius: 5,
            }}
          />
        </div>

        <p style={{ marginTop: 10 }}>
          {getProfileStrength()}% Complete
        </p>
      </div>

      {/* CAREER GAP INTELLIGENCE */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2>
          🧠 Career Gap Intelligence
        </h2>

        <p style={{ fontWeight: "bold" }}>
          {getCareerUpgrade()}
        </p>

        <p style={{ marginTop: 8 }}>
          🌍 Market Fit: {getMarketFit()}
        </p>

        <h3 style={{ marginTop: 15 }}>
          📉 Improvement Areas
        </h3>

        {getCareerGap().length > 0 ? (
          <ul>
            {getCareerGap().map((gap, i) => (
              <li
                key={i}
                style={{ marginBottom: 6 }}
              >
                {gap}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Perfect profile. No gaps detected.
          </p>
        )}
      </div>

      {/* AI RECOMMENDATIONS */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2>
          🤖 AI Recommendations
        </h2>

        <ul>
          {getAIRecommendations().map(
            (recommendation, i) => (
              <li
                key={i}
                style={{ marginBottom: 6 }}
              >
                {recommendation}
              </li>
            )
          )}
        </ul>
      </div>

      {/* STATS */}
      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(200px,1fr))",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 12,
          }}
        >
          <strong>
            ATS Score
          </strong>

          <p style={{ fontSize: 22 }}>
            {cv?.ats_score || 0}%
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 12,
          }}
        >
          <strong>
            Industry
          </strong>

          <p style={{ fontSize: 18 }}>
            {cv?.industry || "Not defined"}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 12,
          }}
        >
          <strong>
            Skills
          </strong>

          <p style={{ fontSize: 22 }}>
            {skills.length}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 12,
          }}
        >
          <strong>
            Certifications
          </strong>

          <p style={{ fontSize: 22 }}>
            {certifications.length}
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2>
          🧠 AI Career Summary
        </h2>

        <p
          style={{
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          {cv
            ? `Professional with experience in ${
                cv.industry || "multiple industries"
              }. Current ATS score is ${
                cv.ats_score || 0
              }% with ${skills.length} skills detected.`
            : "No CV analysis available yet. Upload a CV to generate your profile."}
        </p>
      </div>

            {/* KNOWLEDGE INTELLIGENCE */}
      {knowledgeProfile && (
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <h2>
            🧠 Knowledge Intelligence
          </h2>

          <p>
            <strong>Dominant Domain:</strong>{" "}
            {knowledgeProfile.dominantDomainId ?? "N/A"}
          </p>

          <p>
            <strong>Knowledge Confidence:</strong>{" "}
            {Math.round(
              knowledgeProfile.averageConfidence * 100
            )}
            %
          </p>

          <p>
            <strong>Knowledge Score:</strong>{" "}
            {Math.round(
              knowledgeProfile.averageScore * 100
            )}
            %
          </p>
        </div>
      )}

      {/* SKILLS */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2>
          🛠 Skills
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 10,
          }}
        >
          {skills.length > 0 ? (
            skills.map((skill, i) => (
              <span
                key={i}
                style={{
                  background: "#e5e7eb",
                  padding: "6px 10px",
                  borderRadius: 20,
                  fontSize: 13,
                }}
              >
                {skill}
              </span>
            ))
          ) : (
            <p style={{ color: "#666" }}>
              No skills detected
            </p>
          )}
        </div>
      </div>

      {/* CERTIFICATIONS */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h2>
          🎓 Certifications
        </h2>

        {certifications.length === 0 ? (
          <p style={{ color: "#666" }}>
            No certifications added yet
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 10,
            }}
          >
            {certifications.map((cert, i) => (
              <div
                key={cert.id ?? i}
                style={{
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <strong>
                  {cert.name}
                </strong>

                <p
                  style={{
                    margin: 0,
                    color: "#666",
                  }}
                >
                  {cert.issuing_body} • {cert.country}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}