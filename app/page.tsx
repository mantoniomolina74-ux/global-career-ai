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
          </div>
        </div>
      </nav>

      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Global Career AI
        </h1>

        <p className="text-xl">
          Plataforma internacional de empleo para minería,
          agricultura, construcción y petróleo.
        </p>
      </section>
    </main>
  );
}