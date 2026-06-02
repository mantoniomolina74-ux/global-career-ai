export default function SubirCVPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subir Currículum
        </h1>

        <p className="text-gray-600 mb-6">
          Carga tu CV para aplicar a vacantes internacionales en minería, agricultura y construcción.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition">
          
          <input
            type="file"
            className="w-full text-gray-700"
          />

          <p className="text-sm text-gray-500 mt-3">
            Formatos aceptados: PDF, DOCX
          </p>

        </div>

        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
          Enviar CV
        </button>

      </div>

    </main>
  );
}