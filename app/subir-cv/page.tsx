"use client";

import { useEffect, useState } from "react";

export default function SubirCV() {
  const [autorizado, setAutorizado] = useState(false);
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("session");

    if (session === "active") {
      setAutorizado(true);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const subirCV = () => {
    if (!nombre || !archivo) {
      setMensaje("Completa todos los campos");
      return;
    }

    setMensaje("CV subido correctamente (simulado)");
  };

  if (!autorizado) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          Subir CV
        </h1>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Nombre completo"
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="file"
          className="w-full mb-3"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
        />

        <button
          onClick={subirCV}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Subir CV
        </button>

        {mensaje && (
          <p className="mt-4 text-center font-medium">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}