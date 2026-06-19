"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ⚠️ cliente (ok aquí, pero estable)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubirCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

    const uploadCV = async () => {
  if (!file) {
    throw new Error("No file selected");
  }

  const fileName = `cvs/${Date.now()}-${file.name}`;

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

  const saveJob = async (job: any) => {
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
        throw error;
      }

      alert("✅ Empleo guardado correctamente");
    } catch (error: any) {
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

      // 1. subir
      const fileUrl = await uploadCV();

      console.log("CV URL:", fileUrl);

      // 2. analizar
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

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Subir CV</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Procesando..." : "Subir y analizar CV"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result?.matchResults?.length > 0 && (
  <div style={{ marginTop: 40 }}>
    <h2 style={{ fontSize: 22, marginBottom: 20 }}>
      💼 Empleos recomendados para ti
    </h2>

    {result.matchResults.map((item: any, index: number) => {
      const score = item.match;

      let color = "#22c55e"; // verde
      if (score < 70) color = "#f59e0b"; // amarillo
      if (score < 50) color = "#ef4444"; // rojo

      return (
        <div
          key={index}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              {item.job.title}
            </h3>

            <p style={{ margin: 0, color: "#6b7280" }}>
              {item.job.company}
            </p>
          </div>

          {/* SCORE BAR */}
          <div style={{ marginBottom: 10 }}>
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

            <p style={{ marginTop: 5, fontSize: 14 }}>
              Compatibilidad: <b>{score}%</b>
            </p>
          </div>

          {/* REASONS */}
          <p style={{ fontSize: 13, color: "#4b5563" }}>
            Coincidencias: {item.reasons.join(", ") || "N/A"}
          </p>

          {/* BUTTON */}
          <button
  onClick={() => saveJob(item.job)}
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
    })}
  </div>
)}
    </main>
  );
}