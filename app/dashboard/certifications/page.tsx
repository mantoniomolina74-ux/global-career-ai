"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CertificationsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [country, setCountry] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadCertifications();
    }
  }, [userId]);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id || null);
  }

  async function loadCertifications() {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setCertifications(data || []);
    setLoading(false);
  }

  async function saveCertification() {
    if (!userId) {
      alert("Usuario no autenticado");
      return;
    }

    if (
      !name ||
      !status ||
      !issuingBody ||
      !country ||
      !issueDate
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const { error } = await supabase
      .from("certifications")
      .insert([
        {
          user_id: userId,
          name,
          status,
          issuing_body: issuingBody,
          country,
          issue_date: issueDate,
          expiry_date: expiryDate || null,
        },
      ]);

    if (error) {
      console.error(error);
      alert("❌ Error al guardar certificación");
      return;
    }

    alert("✅ Certificación guardada");

    setName("");
    setStatus("");
    setIssuingBody("");
    setCountry("");
    setIssueDate("");
    setExpiryDate("");

    loadCertifications();
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

      {/* FORMULARIO */}

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
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          placeholder="Status (Active, Expired, Pending)"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          placeholder="Organismo emisor"
          value={issuingBody}
          onChange={(e) => setIssuingBody(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          placeholder="País"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <label>Fecha de emisión</label>

        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <label>Fecha de vencimiento (opcional)</label>

        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
          }}
        />

        <button
          onClick={saveCertification}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Guardar Certificación
        </button>
      </div>

      {/* LISTA */}

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
                <strong>Status:</strong> {cert.status}
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