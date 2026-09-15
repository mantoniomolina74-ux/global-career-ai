"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

type JobMatch = {
  match: number;
  reasons: string[];
  job: Job;
};

type AnalysisResult = {
  matchResults: JobMatch[];
};

export default function SubirCVPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadCV = async () => {
    if (!file) {
      throw new Error("No file selected");
    }

    const fileName = `cvs/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("cvs")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error("No se pudo obtener URL pública");
    }

    return data.publicUrl;
  };

  const saveJob = async (job: Job) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Debes iniciar sesión");
        return;
      }

      const { error } = await supabase
        .from("saved_jobs")
        .insert({
          user_id: user.id,
          job_id: job.id,
          title: job.title,
          company: job.company,
          country: job.location,
          description: job.description,
        });

      if (error) {
        if (error.code === "23505") {
          alert("ℹ️ Este empleo ya estaba guardado.");
          return;
        }

        throw error;
      }

      alert("✅ Empleo guardado correctamente");
    } catch (error: unknown) {
      console.error(error);
      alert("❌ Error al guardar empleo");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Debes iniciar sesión");
      }

      if (!file) {
        throw new Error("Selecciona un archivo PDF");
      }

      // 1. Subir CV
      const fileUrl = await uploadCV();

      console.log("CV URL:", fileUrl);

      // 2. Analizar CV
      const res = await fetch("/api/ai/analyze-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl,
          user_id: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error en análisis");
      }

      console.log("[CV ANALYSIS COMPLETE]", {
        userId: user.id,
        atsScore: data?.atsScore,
        skills: data?.skills,
        industries: data?.industries,
      });

      setResult(data);

      // 3. El análisis terminó correctamente.
      //    El siguiente paso del flujo V1.0 es Dashboard.
      router.push(jobId ? `/premium/demo?jobId=${encodeURIComponent(jobId)}` : "/premium/demo");
    } catch (err: unknown) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Professional Profile
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Mi CV
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Sube tu CV para analizar y actualizar tu perfil profesional
            con información real de tu experiencia.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Actualizar CV
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Formato aceptado: PDF
            </p>
          </div>

          <label
            htmlFor="cv-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 px-6 py-10 text-center transition hover:border-slate-500 hover:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xl">
              +
            </div>

            <span className="text-base font-medium text-slate-200">
              Selecciona tu CV
            </span>

            <span className="mt-2 text-sm text-slate-500">
              Haz clic aquí para seleccionar un archivo PDF
            </span>

            <input
              id="cv-file"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </label>

          {file && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                CV seleccionado
              </p>

              <p className="mt-1 truncate text-sm font-medium text-slate-200">
                {file.name}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="mt-6 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "PROCESANDO..."
              : "ANALIZAR CV"}
          </button>
        </section>

        {(result?.matchResults?.length ?? 0) > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2
            style={{
              fontSize: 22,
              marginBottom: 20,
            }}
          >
            💼 Empleos recomendados para ti
          </h2>

          {result!.matchResults.map(
            (
              item: JobMatch,
              index: number
            ) => {
              const score = item.match;

              let color = "#22c55e";

              if (score < 70) {
                color = "#f59e0b";
              }

              if (score < 50) {
                color = "#ef4444";
              }

              return (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 18,
                    marginBottom: 16,
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 10,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 18,
                      }}
                    >
                      {item.job.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#6b7280",
                      }}
                    >
                      {item.job.company}
                    </p>
                  </div>

                  <div
                    style={{
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        height: 10,
                        background: "#e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${score}%`,
                          height: "100%",
                          background: color,
                        }}
                      />
                    </div>

                    <p
                      style={{
                        marginTop: 5,
                        fontSize: 14,
                      }}
                    >
                      Compatibilidad:{" "}
                      <b>{score}%</b>
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#4b5563",
                    }}
                  >
                    Coincidencias:{" "}
                    {item.reasons.join(", ") ||
                      "N/A"}
                  </p>

                  <button
                    onClick={() =>
                      saveJob(item.job)
                    }
                    style={{
                      marginTop: 10,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: color,
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    💾 Guardar empleo
                  </button>
                </div>
              );
            }
          )}
                </div>
      )}
      </div>
    </main>
  );
}


