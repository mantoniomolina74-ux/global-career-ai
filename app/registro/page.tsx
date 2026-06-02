export default function RegistroPage() {
  return (
    <main className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">
        Registro de Candidatos
      </h1>

      <div className="bg-white p-6 rounded-lg shadow max-w-xl">
        <form className="flex flex-col gap-4">
          
          <input
            type="text"
            placeholder="Nombre completo"
            className="border p-2 rounded"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            className="border p-2 rounded"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="País"
            className="border p-2 rounded"
          />

          <textarea
            placeholder="Experiencia laboral"
            className="border p-2 rounded"
            rows={4}
          />

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Registrarme
          </button>
        </form>
      </div>
    </main>
  );
}