"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [estado, setEstado] = useState("Probando conexión...");
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    const test = async () => {
      const result = await supabase.from("profiles").select("*");

      setData(result.data);
      setError(result.error);

      if (result.error) {
        setEstado("❌ Error detectado");
      } else {
        setEstado("✔ Conexión exitosa");
      }
    };

    void test();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">{estado}</h1>

      {/* ERROR VISUAL */}
      {Boolean(error) && (
        <div className="bg-red-100 text-red-700 p-4 rounded w-full max-w-xl">
          <h2 className="font-bold">Error:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {/* DATA VISUAL */}
      {Boolean(data) && (
        <div className="bg-green-100 text-green-700 p-4 rounded w-full max-w-xl mt-4">
          <h2 className="font-bold">Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}