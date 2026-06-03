"use client";

import { useState } from "react";

export default function SubirCVPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");

  const manejarArchivo = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setArchivo(event.target.files[0]);
      setMensaje("");
    }
  };

  const subirCV = () => {
    if (!archivo) {
      setMensaje("Por favor selecciona un archivo.");
      return;
    }

    setMensaje(`CV seleccionado: ${archivo.name}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-4xl font-bold mb-4">
          Subir CV
        </h1>

        <p className="text-gray-600 mb-6">
          Carga tu currículum para futuras aplicaciones laborales.
        </p>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={manejarArchivo}
          className="mb-4 block w-full"
        />

        <button
          onClick={subirCV}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Subir CV
        </button>

        {mensaje && (
          <p className="mt-4 font-medium">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}