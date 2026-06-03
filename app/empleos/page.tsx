export default function EmpleosPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Vacantes Internacionales
        </h1>

        <p className="text-gray-600 mb-8">
          Explora oportunidades laborales en minería, agricultura y construcción.
        </p>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2">
              Operador de Equipo Pesado
            </h2>

            <p className="mb-2">
              📍 Canadá
            </p>

            <p className="mb-2">
              💰 CAD $28 - $38 por hora
            </p>

            <p className="mb-4">
              Visa patrocinada para candidatos internacionales.
            </p>

            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Aplicar
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2">
              Trabajador Agrícola
            </h2>

            <p className="mb-2">
              📍 Australia
            </p>

            <p className="mb-2">
              💰 AUD $30 - $35 por hora
            </p>

            <p className="mb-4">
              Incluye alojamiento y apoyo migratorio.
            </p>

            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Aplicar
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2">
              Ayudante de Construcción
            </h2>

            <p className="mb-2">
              📍 España
            </p>

            <p className="mb-2">
              💰 €1,800 - €2,500 por mes
            </p>

            <p className="mb-4">
              Contrato legal con posibilidad de renovación.
            </p>

            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Aplicar
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}