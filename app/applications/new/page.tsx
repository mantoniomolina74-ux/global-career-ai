"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewApplicationPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function createApplication() {
      if (!jobId) {
        setError("No se recibió un jobId válido.");
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          window.location.href =
            `/login?jobId=${encodeURIComponent(jobId)}`;
          return;
        }

        const response = await fetch("/api/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            jobId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data?.error ||
              "No fue posible crear la aplicación."
          );
          return;
        }

        window.location.href = "/applications";
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado."
        );
      }
    }

    void createApplication();
  }, [jobId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900">
              No fue posible guardar la aplicación
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/applications";
              }}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Ir a Applications
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">
              Guardando aplicación...
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Estamos registrando esta oportunidad en tu pipeline.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
