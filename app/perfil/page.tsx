"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PerfilPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    country: "",
    city: "",
    profession: "",
    experience_years: "",
    english_level: "",
    target_industry: "",
  });

  const cargarPerfil = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (data) {
      setForm({
        full_name: data.full_name || "",
        country: data.country || "",
        city: data.city || "",
        profession: data.profession || "",
        experience_years: data.experience_years?.toString() || "",
        english_level: data.english_level || "",
        target_industry: data.target_industry || "",
      });
    }

    setLoading(false);
  }, []);

    useEffect(() => {
    const load = async () => {
      await cargarPerfil();
    };

    load();
  }, [cargarPerfil]);

  const guardarPerfil = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userData.user.id,
        email: userData.user.email,
        full_name: form.full_name,
        country: form.country,
        city: form.city,
        profession: form.profession,
        experience_years: Number(form.experience_years),
        english_level: form.english_level,
        target_industry: form.target_industry,
      });

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje("Perfil actualizado correctamente");
  };

  if (loading) {
    return (
      <main className="p-8">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Perfil Profesional
      </h1>

      <div className="grid gap-4">
        <input
          placeholder="Nombre completo"
          value={form.full_name}
          onChange={(e) =>
            setForm({ ...form, full_name: e.target.value })
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

        <input
          placeholder="Ciudad"
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
          className="border p-3 rounded"
        />

        <input
          placeholder="Profesión"
          value={form.profession}
          onChange={(e) =>
            setForm({ ...form, profession: e.target.value })
          }
          className="border p-3 rounded"
        />

        <input
          type="number"
          placeholder="Años de experiencia"
          value={form.experience_years}
          onChange={(e) =>
            setForm({
              ...form,
              experience_years: e.target.value,
            })
          }
          className="border p-3 rounded"
        />

        <input
          placeholder="Nivel de inglés"
          value={form.english_level}
          onChange={(e) =>
            setForm({
              ...form,
              english_level: e.target.value,
            })
          }
          className="border p-3 rounded"
        />

        <input
          placeholder="Industria objetivo"
          value={form.target_industry}
          onChange={(e) =>
            setForm({
              ...form,
              target_industry: e.target.value,
            })
          }
          className="border p-3 rounded"
        />

        <button
          onClick={guardarPerfil}
          className="bg-blue-600 text-white py-3 rounded-lg"
        >
          Guardar Perfil
        </button>

        {mensaje && (
          <p className="font-semibold">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}