"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUser(data.user);

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) {
        console.error(jobsError);
      } else {
        setJobs(jobsData || []);
      }

      const { data: savedData, error: savedError } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (savedError) {
        console.error(savedError);
      } else {
        setSavedJobs(savedData || []);
      }

      setLoading(false);
    };

    init();
  }, []);

  const loadSavedJobs = async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setSavedJobs(data || []);
    }
  };

  const saveJob = async (job: any) => {
    if (!user) {
      setMessage("Usuario no encontrado");
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      title: job.title,
      company: null,
      country: job.country,
      description: job.description,
      job_id: job.id,
    });

    if (error) {
      console.error(error);

      setMessage(
        `Error: ${error.message} | Código: ${error.code || "sin código"}`
      );

      return;
    }

    setMessage("Empleo guardado correctamente");

    await loadSavedJobs(user.id);
  };

  return (
    <main style={{ padding: "20px" }}>
      <h1>Global Career AI Dashboard</h1>

      <p>
        <strong>Usuario:</strong>{" "}
        {user ? user.email : "Cargando usuario..."}
      </p>

      {message && (
        <p style={{ marginTop: "10px" }}>
          <strong>{message}</strong>
        </p>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h2>Vacantes disponibles</h2>

      {loading ? (
        <p>Cargando empleos...</p>
      ) : jobs.length === 0 ? (
        <p>No hay empleos disponibles.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>{job.title}</h3>

              <p>
                <strong>País:</strong> {job.country}
              </p>

              <p>
                <strong>Industria:</strong> {job.industry}
              </p>

              <p>{job.description}</p>

              <button
                onClick={() => saveJob(job)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                Guardar empleo
              </button>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      <h2>Mis empleos guardados</h2>

      {savedJobs.length === 0 ? (
        <p>No tienes empleos guardados.</p>
      ) : (
        <div>
          {savedJobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #4caf50",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>{job.title}</h3>

              <p>
                <strong>País:</strong> {job.country}
              </p>

              <p>{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}