"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

type Application = {
status: string;
country: string;
company: string;
position: string;
};

type Stats = {
total: number;
applied: number;
interview: number;
hired: number;
rejected: number;
topCountry: string;
topCompany: string;
topPosition: string;
};

export default function InsightsPage() {
const supabase = createSupabaseBrowserClient();
const [loading, setLoading] = useState(true);

const [stats, setStats] = useState<Stats>({
total: 0,
applied: 0,
interview: 0,
hired: 0,
rejected: 0,
topCountry: "N/A",
topCompany: "N/A",
topPosition: "N/A",
});

const calculateStats = useCallback(
(data: Application[]) => {
const countBy = (
key: keyof Application
): string => {
const map: Record<string, number> = {};

    data.forEach((item) => {
      const value = item[key];

      if (!value) return;

      map[value] =
        (map[value] || 0) + 1;
    });

    return (
      Object.entries(map).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "N/A"
    );
  };

  setStats({
    total: data.length,

    applied: data.filter(
      (a) => a.status === "Applied"
    ).length,

    interview: data.filter(
      (a) => a.status === "Interview"
    ).length,

    hired: data.filter(
      (a) => a.status === "Hired"
    ).length,

    rejected: data.filter(
      (a) => a.status === "Rejected"
    ).length,

    topCountry: countBy("country"),
    topCompany: countBy("company"),
    topPosition: countBy("position"),
  });
},
[]

);

const init = useCallback(async () => {
const { data } =
await supabase.auth.getUser();


if (!data.user) {
  window.location.href = "/login";
  return;
}

const { data: apps } =
  await supabase
    .from("applications")
    .select("*")
    .eq("user_id", data.user.id);

calculateStats(
  (apps || []) as Application[]
);

setLoading(false);

}, [calculateStats]);

useEffect(() => {
  let mounted = true;

  async function loadInsights() {
    if (mounted) {
      await init();
    }
  }

  void loadInsights();

  return () => {
    mounted = false;
  };
}, [init]);

if (loading) {
return ( <main className="min-h-screen flex items-center justify-center"> <p className="text-lg font-semibold">
Cargando insights... </p> </main>
);
}

return ( <div className="flex min-h-screen"> <Sidebar />

  <main className="flex-1 p-6 bg-slate-50">
    <h1 className="text-3xl font-bold mb-6">
      Insights de Carrera
    </h1>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded shadow">
        <p>Total</p>
        <p className="text-2xl font-bold">
          {stats.total}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Applied</p>
        <p className="text-2xl font-bold">
          {stats.applied}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Interview</p>
        <p className="text-2xl font-bold">
          {stats.interview}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Hired</p>
        <p className="text-2xl font-bold">
          {stats.hired}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p>Rejected</p>
        <p className="text-2xl font-bold">
          {stats.rejected}
        </p>
      </div>
    </div>

    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        Análisis Inteligente
      </h2>

      <p>
        🌎 País más frecuente:{" "}
        <b>{stats.topCountry}</b>
      </p>

      <p>
        🏢 Empresa más frecuente:{" "}
        <b>{stats.topCompany}</b>
      </p>

      <p>
        💼 Puesto más frecuente:{" "}
        <b>{stats.topPosition}</b>
      </p>
    </div>
  </main>
</div>

);
}