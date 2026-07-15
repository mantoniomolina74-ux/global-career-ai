"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegistroPage() {
const [nombre, setNombre] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmarPassword, setConfirmarPassword] = useState("");
const [mensaje, setMensaje] = useState("");
const [loading, setLoading] = useState(false);

const registrar = async () => {
if (!nombre || !email || !password || !confirmarPassword) {
setMensaje("Completa todos los campos");
return;
}

if (password !== confirmarPassword) {
  setMensaje("Las contraseñas no coinciden");
  return;
}

try {
  setLoading(true);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
      },
    },
  });

  if (error) {
    setMensaje(error.message);
    return;
  }

  setMensaje("Cuenta creada correctamente");

  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
} catch (err) {
  console.error(err);
  setMensaje("Error al crear la cuenta");
} finally {
  setLoading(false);
}


};

return ( <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6"> <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-slate-200"> <div className="text-center mb-8"> <h1 className="text-4xl font-extrabold text-slate-900">
Global Career AI </h1>

      <p className="text-slate-600 mt-2">
        Crea tu cuenta y accede a oportunidades internacionales
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
        className="w-full p-3 border border-slate-300 rounded-lg text-slate-900"
      />
    </div>

    <div className="mb-4">
      <label className="block mb-2 font-medium text-slate-700">
        Correo electrónico
      </label>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="correo@ejemplo.com"
        className="w-full p-3 border border-slate-300 rounded-lg text-slate-900"
      />
    </div>

    <div className="mb-4">
      <label className="block mb-2 font-medium text-slate-700">
        Contraseña
      </label>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
        className="w-full p-3 border border-slate-300 rounded-lg text-slate-900"
      />
    </div>

    <div className="mb-6">
      <label className="block mb-2 font-medium text-slate-700">
        Confirmar contraseña
      </label>

      <input
        type="password"
        value={confirmarPassword}
        onChange={(e) => setConfirmarPassword(e.target.value)}
        placeholder="********"
        className="w-full p-3 border border-slate-300 rounded-lg text-slate-900"
      />
    </div>

    <button
      onClick={registrar}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
    >
      {loading ? "Creando cuenta..." : "Crear Cuenta"}
    </button>

    {mensaje && (
      <div className="mt-5 text-center font-semibold text-slate-800">
        {mensaje}
      </div>
    )}
  </div>
</main>


);
}