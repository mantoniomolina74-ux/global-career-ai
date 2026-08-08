"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SavedJob = {
  id: string;
  title: string;
  company: string;
  country: string;
  description: string;
  created_at?: string;
};

export default function SavedJobsPage() {
  const supabase = createSupabaseBrowserClient();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setJobs((data as SavedJob[]) || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let active = true;

  async function initialize() {
    if (!active) return;

    await loadJobs();
  }

  initialize();

  return () => {
    active = false;
  };
}, [loadJobs]);

  const deleteJob = async (id: string) => {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error eliminando empleo");
      return;
    }

    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando empleos...</div>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>💼 Mis Empleos Guardados</h1>

      {jobs.length === 0 && (
        <p>No tienes empleos guardados todavía.</p>
      )}

      {jobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginTop: 15,
            background: "#fff",
          }}
        >
          <h3>{job.title}</h3>

          <p>
            <strong>Empresa:</strong> {job.company}
          </p>

          <p>
            <strong>País:</strong> {job.country}
          </p>

          <p>{job.description}</p>

          <button
            onClick={() => deleteJob(job.id)}
            style={{
              marginTop: 10,
              padding: "8px 14px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            🗑 Eliminar
          </button>
        </div>
      ))}
    </main>
  );
}