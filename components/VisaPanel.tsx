export interface VisaPlan {
  visaType: string;
  readinessScore: number;
  topGaps: string[];
}

interface VisaPanelProps {
  visaPlan: VisaPlan | null;
}

export default function VisaPanel({ visaPlan }: VisaPanelProps) {
  if (!visaPlan) return null;

  return (
    <div className="border p-4 bg-blue-50 rounded mb-4">
      <h2 className="font-bold">Visa Engine</h2>

      <p>Ruta: {visaPlan.visaType}</p>

      <p>Score: {visaPlan.readinessScore}</p>

      <ul>
        {visaPlan.topGaps.map((gap) => (
          <li key={gap}>{gap}</li>
        ))}
      </ul>
    </div>
  );
}