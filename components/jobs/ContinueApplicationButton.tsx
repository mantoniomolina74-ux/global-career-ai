"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContinueApplicationButtonProps = {
  jobId: string;
};

export default function ContinueApplicationButton({
  jobId,
}: ContinueApplicationButtonProps) {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId,
          }),
        }
      );

      if (response.status === 401) {
        router.push(
          `/registro?jobId=${encodeURIComponent(jobId)}`
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "No fue posible guardar la aplicación."
        );
      }

      router.push("/applications");
    } catch (error) {
      console.error(
        "[CONTINUE APPLICATION]",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible continuar con la aplicación."
      );

      setIsSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
      <button
        type="button"
        onClick={handleContinue}
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving
          ? "GUARDANDO APLICACIÓN..."
          : "CONTINUAR CON LA APLICACIÓN"}
      </button>

      {error && (
        <p
          role="alert"
          className="max-w-sm text-right text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}