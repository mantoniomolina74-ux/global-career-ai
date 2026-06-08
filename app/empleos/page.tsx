"use client";

export default function EmpleosPage() {
  const empleos = [
    {
      region: "🌎 Norteamérica",
      titulo: "Operador de Equipo Pesado",
      pais: "Canadá",
      pago: "CAD $28 - $38/hora",
      descripcion: "Visa patrocinada y oportunidad en minería."
    },
    {
      region: "🌏 Oceanía",
      titulo: "Trabajador Agrícola",
      pais: "Australia",
      pago: "AUD $30 - $35/hora",
      descripcion: "Incluye alojamiento y soporte migratorio."
    },
    {
      region: "🌍 Europa",
      titulo: "Ayudante de Construcción",
      pais: "Alemania",
      pago: "€2,300 - €3,200/mes",
      descripcion: "Oportunidades en proyectos de infraestructura."
    }
  ];

  const aplicar = (empleo: any) => {
    const session = localStorage.getItem("session");

    if (session !== "active") {
      alert("Debes iniciar sesión primero");
      window.location.href = "/login";
      return;
    }

    const aplicaciones = JSON.parse(
      localStorage.getItem("aplicaciones") || "[]"
    );

    aplicaciones.push({
      titulo: empleo.titulo,
      pais: empleo.pais,
      fecha: new Date().toLocaleDateString(),
    });

    localStorage.setItem(
      "aplicaciones",
      JSON.stringify(aplicaciones)
    );

    alert("Aplicación enviada correctamente");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-extrabold text-slate-900 mb-3">
          Vacantes Internacionales
        </h1>

        <p className="text-xl text-slate-600 mb-10">
          Explora oportunidades laborales en Norteamérica, Oceanía y Europa.
        </p>

        <div className="grid md:grid-cols-3 gap-8">

          {empleos.map((empleo, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="mb-3 text-sm font-bold text-blue-600">
                {empleo.region}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {empleo.titulo}
              </h2>

              <p className="text-slate-700 mb-2">
                📍 {empleo.pais}
              </p>

              <p className="text-slate-700 mb-2">
                💰 {empleo.pago}
              </p>

              <p className="text-slate-600 mb-6">
                {empleo.descripcion}
              </p>

              <button
                onClick={() => aplicar(empleo)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Aplicar Ahora
              </button>
            </div>
          ))}

        </div>

      </div>
    </main>
  );
}