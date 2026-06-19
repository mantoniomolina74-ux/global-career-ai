"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildProfileIntelligence } from "@/lib/engine/profile/profileIntelligence";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [intelligence, setIntelligence] = useState<any>(null);

  const [profile, setProfile] = useState({
    full_name: "",
    country: "",
    city: "",
    profession: "",
    experience_years: "",
    english_level: "",
    target_industry: "",
    cv_url: "",
  });

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);

    await loadProfile(data.user.id, data.user.email);

    setLoading(false);
  }

  async function loadProfile(userId: string, email: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
  setProfile({
    full_name: data.full_name || "",
    country: data.country || "",
    city: data.city || "",
    profession: data.profession || "",
    experience_years: data.experience_years?.toString() || "",
    english_level: data.english_level || "",
    target_industry: data.target_industry || "",
    cv_url: data.cv_url || "",
  });

  const intelligenceResult = buildProfileIntelligence(data);
  setIntelligence(intelligenceResult);
} else {

      // Si no existe perfil, lo inicializamos con email
      setProfile((prev) => ({
        ...prev,
        full_name: "",
      }));
    }
  }

  async function saveProfile() {
    if (!user) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      country: profile.country,
      city: profile.city,
      profession: profile.profession,
      experience_years: Number(profile.experience_years),
      english_level: profile.english_level,
      target_industry: profile.target_industry,
      cv_url: profile.cv_url,
      created_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }
const intelligenceResult = buildProfileIntelligence(profile);
setIntelligence(intelligenceResult);
    setMessage("Perfil guardado correctamente");
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Cargando perfil...</p>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1>Professional Profile</h1>

      <input
        placeholder="Nombre completo"
        value={profile.full_name}
        onChange={(e) =>
          setProfile({ ...profile, full_name: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="País"
        value={profile.country}
        onChange={(e) =>
          setProfile({ ...profile, country: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Ciudad"
        value={profile.city}
        onChange={(e) =>
          setProfile({ ...profile, city: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Profesión"
        value={profile.profession}
        onChange={(e) =>
          setProfile({ ...profile, profession: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Años de experiencia"
        type="number"
        value={profile.experience_years}
        onChange={(e) =>
          setProfile({ ...profile, experience_years: e.target.value })
        }
      />

      <br /><br />

      <select
        value={profile.english_level}
        onChange={(e) =>
          setProfile({ ...profile, english_level: e.target.value })
        }
      >
        <option value="">Nivel de inglés</option>
        <option value="Basic">Basic</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="Fluent">Fluent</option>
      </select>

      <br /><br />

      <input
        placeholder="Industria objetivo"
        value={profile.target_industry}
        onChange={(e) =>
          setProfile({ ...profile, target_industry: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="CV URL"
        value={profile.cv_url}
        onChange={(e) =>
          setProfile({ ...profile, cv_url: e.target.value })
        }
      />

      <br /><br />
<hr />

<h2>Career Intelligence</h2>

<p>
  <strong>Career Level:</strong>{" "}
  {intelligence?.careerLevel || "-"}
</p>

<p>
  <strong>Market Fit:</strong>{" "}
  {intelligence?.marketFit || 0}%
</p>

<h3>Improvement Areas</h3>

<ul>
  {intelligence?.improvementAreas?.map(
    (item: string, index: number) => (
      <li key={index}>{item}</li>
    )
  )}
</ul>

<br />
      <button onClick={saveProfile} disabled={saving}>
        {saving ? "Guardando..." : "Guardar Perfil"}
      </button>

      <p>{message}</p>
    </div>
  );
}