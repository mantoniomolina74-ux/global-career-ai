
"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Certification = {
  id: string;
  user_id: string;
  name: string;
  status: string;
  issuing_body: string;
  country: string;
  issue_date: string;
  expiry_date: string | null;
  created_at: string;
};

export default function CertificationsPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient());

  const [userId, setUserId] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [country, setCountry] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const loadCertifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar certificaciones:", error);
        return;
      }

      setCertifications(data || []);
    } catch (error) {
      console.error("Error inesperado al cargar certificaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    let active = true;

    async function fetchUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error al obtener el usuario:", error);
          return;
        }

        if (active) {
          setUserId(data.user?.id || null);
        }
      } catch (error) {
        console.error("Error inesperado al obtener el usuario:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchUser();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    void loadCertifications();
  }, [userId, loadCertifications]);

  async function saveCertification() {
    if (!userId) {
      alert("Usuario no autenticado");
      return;
    }

    if (
      !name.trim() ||
      !status ||
      !issuingBody.trim() ||
      !country.trim() ||
      !issueDate
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    if (!["active", "expired", "pending"].includes(status)) {
      alert("Selecciona un estado válido para la certificación");
      return;
    }

    if (expiryDate && expiryDate < issueDate) {
      alert("La fecha de vencimiento no puede ser anterior a la fecha de emisión");
      return;
    }

    try {
      const { error } = await supabase.from("certifications").insert([
        {
          user_id: userId,
          name: name.trim(),
          status,
          issuing_body: issuingBody.trim(),
          country: country.trim(),
          issue_date: issueDate,
          expiry_date: expiryDate || null,
        },
      ]);

      if (error) {
        console.error("Error al guardar certificación:", error);
        alert("❌ Error al guardar certificación");
        return;
      }

      setName("");
      setStatus("");
      setIssuingBody("");
      setCountry("");
      setIssueDate("");
      setExpiryDate("");

      await loadCertifications();

      alert("✅ Certificación guardada");
    } catch (error) {
      console.error("Error inesperado al guardar certificación:", error);
      alert("❌ Error inesperado al guardar certificación");
    }
  }

  return (
    <div
      style={{
        padding: 30,
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily: "Arial",
      }}
    >
      <h1>🏅 Mis Certificaciones</h1>

      <p style={{ color: "#666", marginBottom: 25 }}>
        Certificaciones internacionales registradas en tu perfil.
      </p>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2>➕ Agregar Certificación</h2>

        <input
          placeholder="Nombre de certificación"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          <option value="">Selecciona el estado</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>

        <input
          placeholder="Organismo emisor"
          value={issuingBody}
          onChange={(e) => setIssuingBody(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="País"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <label>Fecha de emisión</label>

        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <label>Fecha de vencimiento (opcional)</label>

        <input
          type="date"
          value={expiryDate}
          min={issueDate || undefined}
          onChange={(e) => setExpiryDate(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 15 }}
        />

        <button
          onClick={saveCertification}
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Guardar Certificación
        </button>
      </div>

      <h2>📋 Certificaciones Registradas</h2>

      {loading ? (
        <p>⏳ Cargando certificaciones...</p>
      ) : certifications.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h3>No hay certificaciones registradas</h3>

          <p style={{ color: "#666" }}>
            Aún no has agregado certificaciones a tu perfil.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 15 }}>
          {certifications.map((cert) => (
            <div
              key={cert.id}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h3>{cert.name}</h3>

              <p>
                <strong>Estado:</strong> {cert.status}
              </p>

              <p>
                <strong>Organismo:</strong> {cert.issuing_body}
              </p>

              <p>
                <strong>País:</strong> {cert.country}
              </p>

              <p>
                <strong>Emisión:</strong> {cert.issue_date}
              </p>

              <p>
                <strong>Vencimiento:</strong>{" "}
                {cert.expiry_date || "Sin vencimiento"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
