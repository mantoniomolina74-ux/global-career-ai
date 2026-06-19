"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function ApplicationsPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    company: "",
    position: "",
    country: "",
    status: "Applied",
    notes: "",
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
    await loadApplications(data.user.id);
  };

  const loadApplications = async (userId: string) => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setApplications(data || []);
    }
  };

  const saveApplication = async () => {
    if (!user) return;

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      company: form.company,
      position: form.position,
      country: form.country,
      status: form.status,
      notes: form.notes,
    });

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje("Postulación guardada correctamente");

    setForm({
      company: "",
      position: "",
      country: "",
      status: "Applied",
      notes: "",
    });

    await loadApplications(user.id);
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (error) {
      console.log(error);
      return;
    }

    if (user) {
      await loadApplications(user.id);
    }
  };

  const deleteApplication = async (applicationId: string) => {
    const confirmDelete = window.confirm(
      "¿Eliminar esta postulación?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

    if (error) {
      console.log(error);
      return;
    }

    if (user) {
      await loadApplications(user.id);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 bg-slate-50">
        <h1 className="text-3xl font-bold mb-6">
          Seguimiento de Postulaciones
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Nueva Postulación
          </h2>

          <div className="grid gap-4">
            <input
              placeholder="Empresa"
              value={form.company}
              onChange={(e) =>
                setForm({ ...form, company: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Puesto"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="País"
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value })
              }
              className="border p-3 rounded"
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="border p-3 rounded"
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>

            <textarea
              placeholder="Notas"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
              className="border p-3 rounded"
              rows={4}
            />

            <button
              onClick={saveApplication}
              className="bg-blue-600 text-white py-3 rounded-lg"
            >
              Guardar Postulación
            </button>

            {mensaje && (
              <p className="text-green-600 font-semibold">
                {mensaje}
              </p>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Mis Postulaciones
          </h2>

          {applications.length === 0 ? (
            <p>No hay postulaciones registradas.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border p-4 rounded">
                  <h3 className="font-bold text-lg">
                    {app.position}
                  </h3>

                  <p>
                    <strong>Empresa:</strong> {app.company}
                  </p>

                  <p>
                    <strong>País:</strong> {app.country}
                  </p>

                  {/* STATUS EDITABLE */}
                  <div className="mt-2">
                    <label className="font-semibold mr-2">
                      Estado:
                    </label>

                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateStatus(app.id, e.target.value)
                      }
                      className="border px-2 py-1 rounded"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {app.notes && (
                    <p className="mt-2">
                      <strong>Notas:</strong> {app.notes}
                    </p>
                  )}

                  <button
                    onClick={() => deleteApplication(app.id)}
                    className="mt-3 bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}