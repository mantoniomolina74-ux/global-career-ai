"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  console.log(error);
  setMensaje(error.message);
  return;
}

    setMensaje("Inicio de sesión exitoso");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-slate-200">

        <h1 className="text-3xl font-bold text-center mb-6">
          Iniciar sesión
        </h1>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-slate-700">
            Correo electrónico
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-slate-700">
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* BOTÓN */}
        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
        >
          Iniciar sesión
        </button>

        {/* MENSAJE */}
        {mensaje && (
          <p className="mt-4 text-center font-semibold text-slate-700">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}