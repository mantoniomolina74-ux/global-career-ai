"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { generateApplicationInsights } from "@/lib/engine/applications/applicationInsights";
import { generateJobMatches } from "@/lib/engine/jobs/jobMatchEngine";

type Application = {
  id: string;
  company: string;
  position: string;
  country: string;
  application_date: string;
  status: string;
  notes: string;
  created_at: string;
};

export default function ApplicationsPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const insights = useMemo(() => {
    return generateApplicationInsights(applications);
  }, [applications]);

  const total = applications.length;

  const applied = insights.statusBreakdown["Applied"] || 0;

  const underReview = insights.statusBreakdown["Under Review"] || 0;

  const interviews =
    (insights.statusBreakdown["Interview Scheduled"] || 0) +
    (insights.statusBreakdown["Final Interview"] || 0);

  const offers = insights.statusBreakdown["Offer Received"] || 0;

  const hired = insights.statusBreakdown["Hired"] || 0;

  const toPercent = (value: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  const rankedApplications = [...applications]
    .map(app => ({
      ...app,
      score: insights.applicationScores[app.id] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  const [form, setForm] = useState({
  company: "",
  position: "",
  country: "",
  application_date: "",
  status: "Applied",
  notes: "",
});

// =========================
// V5 - MOCK JOB POSTINGS
// =========================

const mockJobs = [
  {
    id: "job-1",
    company: "Google",
    position: "Frontend Engineer",
    country: "USA",
    industry: "Tech",
    job_type: "Full-time",
    salary: 140000,
    currency: "USD",
    source: "LinkedIn",
    requirements: ["React", "TypeScript", "System Design"],
  },
  {
    id: "job-2",
    company: "Microsoft",
    position: "Software Engineer",
    country: "Canada",
    industry: "Tech",
    job_type: "Full-time",
    salary: 130000,
    currency: "USD",
    source: "Company Site",
    requirements: ["C#", ".NET", "Azure"],
  },
  {
    id: "job-3",
    company: "BHP",
    position: "Mining Data Analyst",
    country: "Australia",
    industry: "Mining",
    job_type: "Contract",
    salary: 110000,
    currency: "USD",
    source: "Indeed",
    requirements: ["Python", "SQL", "Power BI"],
  },
];
  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
    await loadApplications(data.user.id);

    setLoading(false);
  }

  async function loadApplications(userId: string) {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("application_date", { ascending: false });

    if (!error) {
      setApplications(data || []);
    }
  }

  async function saveApplication() {
    setMensaje("");
    setErrorMsg("");

    if (
      !form.company ||
      !form.position ||
      !form.country ||
      !form.application_date
    ) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    if (!user) return;

    setSaving(true);

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      company: form.company,
      position: form.position,
      country: form.country,
      application_date: form.application_date,
      status: form.status,
      notes: form.notes,
    });

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setMensaje("Postulación guardada correctamente.");

    setForm({
      company: "",
      position: "",
      country: "",
      application_date: "",
      status: "Applied",
      notes: "",
    });

    await loadApplications(user.id);
  }

  async function updateStatus(
    applicationId: string,
    newStatus: string
  ) {
    const { error } = await supabase
      .from("applications")
      .update({
        status: newStatus,
      })
      .eq("id", applicationId);

    if (!error && user) {
      await loadApplications(user.id);
    }
  }

  async function deleteApplication(applicationId: string) {
    const confirmDelete = window.confirm(
      "¿Deseas eliminar esta postulación?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

    if (!error && user) {
      await loadApplications(user.id);
    }
  }

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

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6">
          <p>Cargando postulaciónes...</p>
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

        {/* MÉTRICAS */}

          <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">
              {applications.length}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm">Applied</p>
            <p className="text-2xl font-bold">
              {insights.statusBreakdown["Applied"] || 0}
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
  <p className="text-sm">In Process</p>
  <p className="text-2xl font-bold">
    {(insights.statusBreakdown["Under Review"] || 0) +
      (insights.statusBreakdown["Interview Scheduled"] || 0) +
      (insights.statusBreakdown["Final Interview"] || 0)}
  </p>
</div>

          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm">Offers / Hired</p>
            <p className="text-2xl font-bold">
  {(insights.statusBreakdown["Offer Received"] || 0) +
    (insights.statusBreakdown["Hired"] || 0)}
</p>
          </div>

          <div className="bg-red-50 p-4 rounded-xl">
            <p className="text-sm">Rejected</p>
            <p className="text-2xl font-bold">
              {insights.statusBreakdown["Rejected"] || 0}
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl">
  <p className="text-sm">Interview Rate</p>
  <p className="text-2xl font-bold">
    {insights.interviewRate}%
  </p>
</div>

<div className="bg-purple-50 p-4 rounded-xl">
  <p className="text-sm">Offer Rate</p>
  <p className="text-2xl font-bold">
    {insights.offerRate}%
  </p>
</div>

<div className="bg-emerald-50 p-4 rounded-xl">
  <p className="text-sm">Success Rate</p>
  <p className="text-2xl font-bold">
    {insights.successRate}%
  </p>
</div>
        </div>

 {/* =========================
   V3 MARKET INTELLIGENCE
========================= */}

<div className="grid md:grid-cols-2 gap-6 mb-8">

  {/* TOP COUNTRIES */}
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-lg font-semibold mb-4">
      Top Countries
    </h2>

    {insights.topCountries.length === 0 ? (
      <p className="text-gray-500 text-sm">No data</p>
    ) : (
      <div className="space-y-3">
        {insights.topCountries.map((c) => (
          <div key={c.country} className="flex justify-between">
            <span>{c.country}</span>
            <span className="font-bold">{c.applications}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* TOP INDUSTRIES */}
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-lg font-semibold mb-4">
      Top Industries
    </h2>

    {insights.topIndustries.length === 0 ? (
      <p className="text-gray-500 text-sm">No data</p>
    ) : (
      <div className="space-y-3">
        {insights.topIndustries.map((i) => (
          <div key={i.industry} className="flex justify-between">
            <span>{i.industry}</span>
            <span className="font-bold">{i.applications}</span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

{/* =========================
   CAREER SIGNALS
========================= */}

<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-lg font-semibold mb-4">
    Career Signals
  </h2>

  <div className="grid md:grid-cols-4 gap-4">
    {insights.careerSignals.map((s) => (
      <div
        key={s.name}
        className="p-4 bg-gray-50 rounded-lg text-center"
      >
        <p className="text-sm text-gray-500">{s.name}</p>
        <p className="text-2xl font-bold">{s.value}</p>
      </div>
    ))}
  </div>
</div>

{/* =========================
   MARKET RECOMMENDATIONS
========================= */}

<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-lg font-semibold mb-4">
    AI Recommendations
  </h2>

  {insights.marketRecommendations.length === 0 ? (
    <p className="text-gray-500 text-sm">No insights yet</p>
  ) : (
    <ul className="space-y-2">
      {insights.marketRecommendations.map((r, idx) => (
        <li
          key={idx}
          className="p-3 bg-blue-50 rounded-lg text-sm"
        >
          {r}
        </li>
      ))}
    </ul>
  )}
</div>
        
        {/* STATUS BREAKDOWN VISUAL */}
<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-xl font-semibold mb-4">
    Status Breakdown
  </h2>

  <div className="space-y-3">
    {Object.entries(insights.statusBreakdown).map(([status, count]) => (
      <div key={status} className="flex justify-between items-center">
        <span className="text-sm">{status}</span>

        <div className="flex items-center gap-3 w-1/2">
          <div className="h-2 bg-gray-200 rounded-full w-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{
                width: `${(count / insights.totalApplications) * 100}%`
              }}
            />
          </div>

          <span className="text-sm font-bold w-8 text-right">
            {count}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

        {/* APPLICATION FUNNEL */}
<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-xl font-semibold mb-4">
    Application Funnel
  </h2>

  {(() => {
    const applied = insights.statusBreakdown["Applied"] || 0;

    const inProcess =
      (insights.statusBreakdown["Under Review"] || 0) +
      (insights.statusBreakdown["Interview Scheduled"] || 0) +
      (insights.statusBreakdown["Final Interview"] || 0);

    const offers =
      (insights.statusBreakdown["Offer Received"] || 0);

    const hired =
      (insights.statusBreakdown["Hired"] || 0);

    const total = insights.totalApplications || 1;

    const steps = [
      { label: "Applied", value: applied, color: "bg-blue-500" },
      { label: "In Process", value: inProcess, color: "bg-yellow-500" },
      { label: "Offers", value: offers, color: "bg-green-500" },
      { label: "Hired", value: hired, color: "bg-emerald-600" },
    ];

    return (
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-4">
            <div className="w-28 text-sm font-medium">
              {step.label}
            </div>

            <div className="flex-1 h-3 bg-gray-200 rounded-full">
              <div
                className={`h-3 rounded-full ${step.color}`}
                style={{
                  width: `${(step.value / total) * 100}%`,
                }}
              />
            </div>

            <div className="w-10 text-right text-sm font-bold">
              {step.value}
            </div>
          </div>
        ))}
      </div>
    );
  })()}
</div>

        {/* CONVERSION RATES */}
<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-xl font-semibold mb-4">
    Conversion Rates
  </h2>

  {(() => {
    const applied = insights.statusBreakdown["Applied"] || 0;

    const interviews =
      (insights.statusBreakdown["Under Review"] || 0) +
      (insights.statusBreakdown["Interview Scheduled"] || 0) +
      (insights.statusBreakdown["Final Interview"] || 0);

    const offers =
      insights.statusBreakdown["Offer Received"] || 0;

    const hired =
      insights.statusBreakdown["Hired"] || 0;

    const safePercent = (num: number, denom: number) =>
      denom > 0 ? Math.round((num / denom) * 100) : 0;

    const rates = [
      {
        label: "Applied → Interview",
        value: safePercent(interviews, applied),
        color: "bg-blue-500",
      },
      {
        label: "Interview → Offer",
        value: safePercent(offers, interviews),
        color: "bg-yellow-500",
      },
      {
        label: "Offer → Hire",
        value: safePercent(hired, offers),
        color: "bg-green-500",
      },
    ];

    return (
      <div className="space-y-4">
        {rates.map((r) => (
          <div key={r.label} className="flex items-center gap-4">
            <div className="w-40 text-sm font-medium">
              {r.label}
            </div>

            <div className="flex-1 h-3 bg-gray-200 rounded-full">
              <div
                className={`h-3 rounded-full ${r.color}`}
                style={{ width: `${r.value}%` }}
              />
            </div>

            <div className="w-12 text-right text-sm font-bold">
              {r.value}%
            </div>
          </div>
        ))}
      </div>
    );
  })()}
</div>
<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-xl font-semibold mb-5">
  
    Conversion Funnel
  </h2>

  <div className="space-y-4">

    {/* APPLIED */}
    <div className="flex items-center justify-between">
      <p>Applied</p>
      <p className="font-bold">
        {insights.statusBreakdown["Applied"] || 0}
      </p>
    </div>

    {/* UNDER REVIEW */}
    <div className="flex items-center justify-between">
      <p>Under Review</p>
      <p className="font-bold">
        {insights.statusBreakdown["Under Review"] || 0}
      </p>
    </div>

    {/* INTERVIEWS */}
    <div className="flex items-center justify-between">
      <p>Interviews</p>
      <p className="font-bold">
        {(insights.statusBreakdown["Interview Scheduled"] || 0) +
         (insights.statusBreakdown["Final Interview"] || 0)}
      </p>
    </div>

    {/* OFFERS */}
    <div className="flex items-center justify-between">
      <p>Offers</p>
      <p className="font-bold">
        {insights.statusBreakdown["Offer Received"] || 0}
      </p>
    </div>

    {/* HIRED */}
    <div className="flex items-center justify-between">
      <p>Hired</p>
      <p className="font-bold">
        {insights.statusBreakdown["Hired"] || 0}
      </p>
    </div>

  </div>
</div>
      <div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-lg font-semibold mb-4">
    AI Career Strategy (V4)
  </h2>

  <p className="mb-3 text-sm text-gray-600">
    Mode: <strong>{insights.careerStrategy?.mode}</strong>
  </p>

  <p className="mb-4 text-sm text-gray-600">
    Priority: <strong>{insights.careerStrategy?.priority}</strong>
  </p>

  <div className="space-y-2">
    {insights.nextBestActions?.map((a, i) => (
      <div key={i} className="p-3 bg-blue-50 rounded">
        {a}
      </div>
    ))}
  </div>
</div>  

     {/* V4 AI CAREER STRATEGY */}
<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-xl font-semibold mb-4">
    AI Career Strategy (V4)
  </h2>

  <div className="mb-4 text-sm text-gray-600">
    <p>
      Mode:{" "}
      <span className="font-bold">
        {insights.careerStrategy?.mode || "N/A"}
      </span>
    </p>

    <p>
      Priority:{" "}
      <span className="font-bold">
        {insights.careerStrategy?.priority || "N/A"}
      </span>
    </p>

    <p>
      Focus:{" "}
      <span className="font-bold">
        {insights.strategySignals?.focusScore || "N/A"}
      </span>
    </p>
  </div>

  <div className="space-y-2">
    {(insights.nextBestActions || []).length === 0 ? (
      <p className="text-gray-500 text-sm">
        No actions available yet.
      </p>
    ) : (
      insights.nextBestActions.map((action, i) => (
        <div
          key={i}
          className="p-3 bg-blue-50 rounded-lg text-sm"
        >
          {action}
        </div>
      ))
    )}
  </div>
</div>

<div className="bg-white p-6 rounded-xl shadow mb-8">
  <h2 className="text-xl font-semibold mb-5">
    Top Opportunities (AI Ranking)
  </h2>

  {rankedApplications.length === 0 ? (
    <p>No applications yet.</p>
  ) : (
    <div className="space-y-3">
      {rankedApplications.slice(0, 5).map((app) => (
        <div
          key={app.id}
          className="flex justify-between items-center p-4 border rounded-lg"
        >
          <div>
            <p className="font-semibold">{app.position}</p>
            <p className="text-sm text-gray-500">
              {app.company}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold">
              {app.score}
            </p>
            <p className="text-xs text-gray-400">
              AI Score
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
        {/* FORMULARIO */}

        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-5">
            Nueva Postulación
          </h2>

          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Empresa"
              value={form.company}
              onChange={(e) =>
                setForm({
                  ...form,
                  company: e.target.value,
                })
              }
              className="border p-3 rounded"
            />

            <input
              type="text"
              placeholder="Puesto"
              value={form.position}
              onChange={(e) =>
                setForm({
                  ...form,
                  position: e.target.value,
                })
              }
              className="border p-3 rounded"
            />

            <input
              type="text"
              placeholder="País"
              value={form.country}
              onChange={(e) =>
                setForm({
                  ...form,
                  country: e.target.value,
                })
              }
              className="border p-3 rounded"
            />

            <input
              type="date"
              value={form.application_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  application_date: e.target.value,
                })
              }
              className="border p-3 rounded"
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="border p-3 rounded"
            >
              <option value="Applied">Applied</option>
              <option value="Under Review">
                Under Review
              </option>
              <option value="Interview Scheduled">
                Interview Scheduled
              </option>
              <option value="Final Interview">
                Final Interview
              </option>
              <option value="Offer Received">
                Offer Received
              </option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>

            <textarea
              placeholder="Notas"
              rows={4}
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              className="border p-3 rounded"
            />

            {mensaje && (
              <p className="text-green-600 font-semibold">
                {mensaje}
              </p>
            )}

            {errorMsg && (
              <p className="text-red-600 font-semibold">
                {errorMsg}
              </p>
            )}

            <button
              onClick={saveApplication}
              disabled={saving}
              className="bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : "Guardar Postulación"}
            </button>
          </div>
        </div>

        {/* LISTA */}

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-5">
            Mis Postulaciones
          </h2>

          {applications.length === 0 ? (
            <p>No hay postulaciones registradas.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-xl p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">
                        {app.position}
                      </h3>

                      <p>{app.company}</p>

                      <p className="text-sm text-gray-500">
                        {app.country}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Application Date:</strong>{" "}
                      {formatDate(app.application_date)}
                    </p>

                    <p>
                      <strong>Created:</strong>{" "}
                      {formatDate(app.created_at)}
                    </p>
                  </div>

                  {app.notes && (
                    <div className="mt-3">
                      <strong>Notas:</strong>
                      <p>{app.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4 flex-wrap">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateStatus(
                          app.id,
                          e.target.value
                        )
                      }
                      className="border px-3 py-2 rounded"
                    >
                      <option value="Applied">
                        Applied
                      </option>
                      <option value="Under Review">
                        Under Review
                      </option>
                      <option value="Interview Scheduled">
                        Interview Scheduled
                      </option>
                      <option value="Final Interview">
                        Final Interview
                      </option>
                      <option value="Offer Received">
                        Offer Received
                      </option>
                      <option value="Hired">
                        Hired
                      </option>
                      <option value="Rejected">
                        Rejected
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        deleteApplication(app.id)
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}