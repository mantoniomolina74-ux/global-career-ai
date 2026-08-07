"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

type Application = {
  id: string;
  company: string;
  position: string;
  country: string;
  application_date: string;
  status: string;
  notes: string;

  job_description?: string;
  required_skills?: string[];
  matched_skills?: string[];
  cv_strength_score?: number;

  created_at: string;
};

type ApplicationIntelligence = {
  atsScore?: number;
  atsPassProbability?: number;
  riskLevel?: string;
};

type ApplicationInsights = {
  applicationScores: Record<string, number>;
  applicationIntelligence: Record<
    string,
    ApplicationIntelligence
  >;
  statusBreakdown: Record<string, number>;
};

export default function ApplicationsPage() {
  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

  const [user, setUser] = useState<User | null>(null);

  const [applications, setApplications] = useState<
    Application[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [insights, setInsights] =
    useState<ApplicationInsights | null>(null);

  const [form, setForm] = useState({
    company: "",
    position: "",
    country: "",
    application_date: "",
    status: "Applied",
    notes: "",

    job_description: "",
    required_skills: "",
    cv_strength_score: "50",
  });

  /* =========================================================
     ENGINE
  ========================================================= */

  const rankedApplications = useMemo(() => {
    if (!insights?.applicationScores) return [];

    return applications
      .map((app) => ({
        ...app,
        score:
          insights.applicationScores[app.id] ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [
    applications,
    insights?.applicationScores,
  ]);

  /* =========================================================
     INIT
  ========================================================= */

  useEffect(() => {
    async function initialize() {
      setLoading(true);

      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      await loadApplications(data.user.id);

      setLoading(false);
    }

    initialize();
  }, [router]);

  useEffect(() => {
  const userId = user?.id;

  if (!userId) return;

  const loadInsights = async () => {
    const res = await fetch(
      `/api/applications/insights?userId=${userId}`
    );

    const data = await res.json();

    setInsights(data);
  };

  void loadInsights();
}, [user?.id]);

  async function loadApplications(userId: string) {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("application_date", {
        ascending: false,
      });

    if (!data) return;

    setApplications(
      data.map((app) => ({
        ...app,
        required_skills:
          app.required_skills ?? [],

        matched_skills:
          app.matched_skills ?? [],
      }))
    );
  }

  /* =========================================================
     SAVE APPLICATION (ENHANCED)
  ========================================================= */

  async function saveApplication() {
    setMensaje("");
    setErrorMsg("");

    if (
      !form.company ||
      !form.position ||
      !form.country ||
      !form.application_date
    ) {
      setErrorMsg(
        "Completa todos los campos obligatorios."
      );
      return;
    }

    if (!user) return;

    setSaving(true);

    const requiredSkillsArray =
      form.required_skills
        .split(",")
        .map((s) =>
          s.trim().toLowerCase()
        )
        .filter(Boolean);

    const { error } =
      await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          company: form.company,
          position: form.position,
          country: form.country,
          application_date:
            form.application_date,
          status: form.status,
          notes: form.notes,

          job_description:
            form.job_description,

          required_skills:
            requiredSkillsArray,

          matched_skills: [],

          cv_strength_score:
            Number(form.cv_strength_score),
        });

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setMensaje(
      "Postulación guardada correctamente."
    );
    setForm({
      company: "",
      position: "",
      country: "",
      application_date: "",
      status: "Applied",
      notes: "",
      job_description: "",
      required_skills: "",
      cv_strength_score: "50",
    });

    await loadApplications(user.id);
  }

  /* =========================================================
     UI HELPERS
  ========================================================= */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";

      case "Under Review":
      case "Interview Scheduled":
      case "Final Interview":
        return "bg-yellow-100 text-yellow-700";

      case "Offer Received":
      case "Hired":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (
  loading ||
  !user ||
  applications.length === 0 ||
  !insights
) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="animate-pulse text-gray-500">
            Preparando tu dashboard inteligente...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 bg-slate-50">
        <h1 className="text-3xl font-bold mb-6">
          Application Tracker
        </h1>

        {/* METRICS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white p-4 rounded-xl shadow">
            Total: {applications.length}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            Applied:{" "}
            {insights.statusBreakdown["Applied"] || 0}
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            In Process:{" "}
            {(insights.statusBreakdown["Under Review"] || 0) +
              (insights.statusBreakdown[
                "Interview Scheduled"
              ] || 0) +
              (insights.statusBreakdown[
                "Final Interview"
              ] || 0)}
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            Offers:{" "}
            {insights.statusBreakdown[
              "Offer Received"
            ] || 0}
          </div>

        </div>


        {/* TOP OPPORTUNITIES */}

        <div className="bg-white p-6 rounded-xl shadow mb-8">

          <h2 className="text-xl font-semibold mb-4">
            Top Opportunities
          </h2>


          {rankedApplications
            .slice(0, 5)
            .map((app) => {

              const intel =
                insights.applicationIntelligence[
                  app.id
                ];

              return (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg mb-3"
                >

                  <div className="flex justify-between">

                    <div>
                      <p className="font-bold">
                        {app.position}
                      </p>

                      <p className="text-sm text-gray-500">
                        {app.company}
                      </p>
                    </div>


                    <div className="text-right text-sm">

                      <p className="font-bold">
                        Score: {app.score}
                      </p>

                      <p>
                        ATS: {intel?.atsScore ?? 0}
                      </p>

                      <p>
                        Pass:{" "}
                        {intel?.atsPassProbability ?? 0}%
                      </p>

                      <p className="capitalize">
                        Risk:{" "}
                        {intel?.riskLevel ?? "unknown"}
                      </p>

                      <p className="mt-2 font-medium text-xs text-gray-600">
                        {intel?.atsScore &&
                        intel.atsScore >= 75
                          ? "Alta prioridad: aplicar ahora"
                          : intel?.atsScore &&
                            intel.atsScore >= 50
                          ? "Buena oportunidad: mejorar CV ligeramente"
                          : "Baja prioridad: revisar skills antes de aplicar"}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

        </div>


        {/* FORM */}

        <div className="bg-white p-6 rounded-xl shadow mb-8">

          <h2 className="text-xl font-semibold mb-4">
            Nueva Postulación
          </h2>


          <input
            placeholder="Empresa"
            value={form.company}
            onChange={(e) =>
              setForm({
                ...form,
                company: e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <input
            placeholder="Puesto"
            value={form.position}
            onChange={(e) =>
              setForm({
                ...form,
                position: e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <input
            placeholder="País"
            value={form.country}
            onChange={(e) =>
              setForm({
                ...form,
                country: e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <textarea
            placeholder="Descripción del trabajo (IMPORTANTE ATS)"
            value={form.job_description}
            onChange={(e) =>
              setForm({
                ...form,
                job_description:
                  e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <input
            placeholder="Skills requeridas (ej: react, node, sql)"
            value={form.required_skills}
            onChange={(e) =>
              setForm({
                ...form,
                required_skills:
                  e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <input
            type="number"
            placeholder="CV Score (0-100)"
            value={form.cv_strength_score}
            onChange={(e) =>
              setForm({
                ...form,
                cv_strength_score:
                  e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <input
            type="date"
            value={form.application_date}
            onChange={(e) =>
              setForm({
                ...form,
                application_date:
                  e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />


          <textarea
            placeholder="Notas"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            className="border p-2 w-full mb-2"
          />

          <button
            onClick={saveApplication}
            disabled={saving}
            className="bg-blue-600 text-white p-3 rounded"
          >
            {saving
              ? "Guardando..."
              : "Guardar"}
          </button>

          {mensaje && (
            <p className="text-green-600">
              {mensaje}
            </p>
          )}

          {errorMsg && (
            <p className="text-red-600">
              {errorMsg}
            </p>
          )}

        </div>


        {/* LISTA */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Mis Postulaciones
          </h2>


          {applications.map((app) => (

            <div
              key={app.id}
              className="border p-4 mb-2"
            >

              <p className="font-bold">
                {app.position}
              </p>

              <p>
                {app.company}
              </p>

              <span
                className={getStatusColor(
                  app.status
                )}
              >
                {app.status}
              </span>

            </div>

          ))}

        </div>

      </main>
    </div>
  );
}