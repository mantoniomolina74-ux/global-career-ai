export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Global Career AI
          </h1>

          <div className="flex gap-6">
            <a href="/">Inicio</a>
            <a href="/empleos">Empleos</a>
            <a href="/subir-cv">Subir CV</a>
            <a href="/registro">Registro</a>
          </div>
        </div>
      </nav>

      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Global Career AI
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Encuentra oportunidades laborales internacionales con ayuda de inteligencia artificial.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/empleos"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Ver Empleos
          </a>

          <a
            href="/subir-cv"
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg"
          >
            Subir CV
          </a>
        </div>
      </section>
    </main>
  );
}