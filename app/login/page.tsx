"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const login = async () => {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
      setMensaje(error.message);
      return;
    }

    if (data?.user?.id) {
      localStorage.setItem("user_id", data.user.id);
    }

    setMensaje("Inicio de sesión exitoso");

    setTimeout(() => {
      window.location.href = jobId
        ? `/applications?jobId=${encodeURIComponent(jobId)}`
        : "/dashboard";
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-bold text-center mb-6">
          Iniciar sesión
        </h1>

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

        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
        >
          Iniciar sesión
        </button>

        {mensaje && (
          <p className="mt-4 text-center font-semibold text-slate-700">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
