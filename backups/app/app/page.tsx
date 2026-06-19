"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    setSession(localStorage.getItem("session"));
  }, []);

  const logout = () => {
    localStorage.removeItem("session");
    setSession(null);
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <nav className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-2xl font-extrabold text-blue-400">
            Global Career AI
          </h1>

          <div className="flex gap-6 items-center">

            <a href="/" className="hover:text-blue-400">
              Inicio
            </a>

            <a href="/empleos" className="hover:text-blue-400">
              Empleos
            </a>

            <a href="/subir-cv" className="hover:text-blue-400">
              Subir CV
            </a>

            {!session ? (
              <>
                <a href="/registro" className="hover:text-blue-400">
                  Registro
                </a>

                <a
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Login
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Mi Panel
                </a>

                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Cerrar sesión
                </button>
              </>
            )}

          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="py-24 px-6 text-center">

        <h1 className="text-6xl font-extrabold text-slate-900 mb-6">
          Global Career AI
        </h1>

        <p className="text-2xl text-slate-700 mb-10 max-w-3xl mx-auto">
          Encuentra empleos internacionales en Canadá, Estados Unidos,
          Australia y Europa con ayuda de Inteligencia Artificial.
        </p>

        <div className="flex justify-center gap-6">

          <a
            href="/empleos"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg"
          >
            Ver Empleos
          </a>

          <a
            href="/subir-cv"
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg"
          >
            Subir CV
          </a>

        </div>

      </section>

    </main>
  );
}