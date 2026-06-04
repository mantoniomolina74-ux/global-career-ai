"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Usuario de prueba automático
    const existingUser = localStorage.getItem("user");

    if (!existingUser) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: "test@test.com",
          password: "1234",
        })
      );
    }
  }, []);

  const login = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      setMensaje("No hay usuario registrado");
      return;
    }

    if (user.email === email && user.password === password) {
      localStorage.setItem("session", "active");
      setMensaje("Login exitoso");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      setMensaje("Credenciales incorrectas");
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Iniciar sesión
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