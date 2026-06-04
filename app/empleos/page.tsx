"use client";

export default function EmpleosPage() {
  const empleos = [
    {
      titulo: "Operador de Equipo Pesado",
      pais: "Canadá",
      pago: "CAD $28 - $38/hora",
      descripcion: "Visa patrocinada y oportunidad en minería."
    },
    {
      titulo: "Trabajador Agrícola",
      pais: "Australia",
      pago: "AUD $30 - $35/hora",
      descripcion: "Incluye alojamiento y soporte migratorio."
    },
    {
      titulo: "Ayudante de Construcción",
      pais: "España",
      pago: "€1,800 - €2,500/mes",
      descripcion: "Contrato temporal con opción a renovación."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Vacantes Internacionales
        </h1>

        <p className="text-gray-600 mb-8">
          Encuentra oportunidades laborales globales verificadas.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {empleos.map((empleo, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold mb-2">
                {empleo.titulo}
              </h2>

              <p className="mb-1">📍 {empleo.pais}</p>
              <p className="mb-1">💰 {empleo.pago}</p>

              <p className="mb-4 text-gray-600">
                {empleo.descripcion}
              </p>

              <button
                onClick={() => {
                  const session = localStorage.getItem("session");

                  if (session === "active") {
                    alert("Aplicación enviada correctamente");
                  } else {
                    alert("Debes iniciar sesión primero");
                    window.location.href = "/login";
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Aplicar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}