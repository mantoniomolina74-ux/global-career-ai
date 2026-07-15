export interface JobCardData {
  title: string;
  country: string;
  score: number;
  missing?: string[];
}

interface JobCardProps {
  job: JobCardData;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="border p-3 rounded mb-2">
      <p className="font-bold">{job.title}</p>

      <p>{job.country}</p>

      <p>Match: {job.score}%</p>

      {job.missing && job.missing.length > 0 && (
        <p className="text-red-500 text-sm">
          Falta: {job.missing.join(", ")}
        </p>
      )}
    </div>
  );
}