"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
    topCountry: "N/A",
    topCompany: "N/A",
    topPosition: "N/A",
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);

    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", data.user.id);

    const list = apps || [];
    setApplications(list);

    calculateStats(list);
    setLoading(false);
  };

  const calculateStats = (data: any[]) => {
    const countBy = (key: string) => {
      const map: any = {};

      data.forEach((item) => {
        const value = item[key];
        if (!value) return;
        map[value] = (map[value] || 0) + 1;
      });

      return Object.entries(map).sort(
        (a: any, b: any) => b[1] - a[1]
      )[0]?.[0] || "N/A";
    };

    setStats({
      total: data.length,
      applied: data.filter((a) => a.status === "Applied").length,
      interview: data.filter((a) => a.status === "Interview").length,
      hired: data.filter((a) => a.status === "Hired").length,
      rejected: data.filter((a) => a.status === "Rejected").length,
      topCountry: countBy("country"),
      topCompany: countBy("company"),
      topPosition: countBy("position"),
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">
          Cargando insights...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 bg-slate-50">
        <h1 className="text-3xl font-bold mb-6">
          Insights de Carrera
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white p-4 rounded shadow">
            <p>Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Applied</p>
            <p className="text-2xl font-bold">{stats.applied}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Interview</p>
            <p className="text-2xl font-bold">{stats.interview}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Hired</p>
            <p className="text-2xl font-bold">{stats.hired}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Rejected</p>
            <p className="text-2xl font-bold">{stats.rejected}</p>
          </div>

        </div>

        {/* INSIGHTS */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Análisis Inteligente
          </h2>

          <p>🌎 País más frecuente: <b>{stats.topCountry}</b></p>
          <p>🏢 Empresa más frecuente: <b>{stats.topCompany}</b></p>
          <p>💼 Puesto más frecuente: <b>{stats.topPosition}</b></p>
        </div>
      </main>
    </div>
  );
}