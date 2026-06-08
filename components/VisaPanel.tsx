export default function VisaPanel({ visaPlan }: any) {
  if (!visaPlan) return null;

  return (
    <div className="border p-4 bg-blue-50 rounded mb-4">
      <h2 className="font-bold">Visa Engine</h2>

      <p>País: {visaPlan.country}</p>
      <p>Ruta: {visaPlan.visaType}</p>
      <p>Score: {visaPlan.readinessScore}</p>

      <ul>
        {visaPlan.topGaps.map((g: any) => (
          <li key={g[0]}>
            {g[0]} ({g[1]})
          </li>
        ))}
      </ul>
    </div>
  );
}