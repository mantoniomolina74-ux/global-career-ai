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

    setMensaje("Currículum cargado correctamente");
  };

  if (!autorizado) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg border border-slate-200">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Subir Currículum
          </h1>

          <p className="text-slate-600 mt-2">
            Carga tu CV para acceder a oportunidades laborales internacionales.
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-slate-700">
            Nombre completo
          </label>

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full p-3 border border-slate-300 rounded-lg bg-white text-black placeholder-gray-500"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-slate-700">
            Selecciona tu CV (PDF o DOCX)
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full p-3 border border-slate-300 rounded-lg bg-white text-black"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />
        </div>

        {archivo && (
          <div className="mb-6 p-3 bg-slate-100 rounded-lg text-slate-800">
            Archivo seleccionado: <strong>{archivo.name}</strong>
          </div>
        )}

        <button
          onClick={subirCV}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
        >
          Subir CV
        </button>

        {mensaje && (
          <div className="mt-5 text-center font-bold text-green-600">
            {mensaje}
          </div>
        )}

      </div>
    </main>
  );
}