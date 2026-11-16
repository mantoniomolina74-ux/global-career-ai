
import { supabaseServer } from "@/lib/supabase-server";

export type CandidateCertification = {
  name: string;
  status: string;
  expiryDate: string | null;
};

export async function getCandidateCertifications(
  userId: string
): Promise<CandidateCertification[]> {
  if (!userId || userId.trim().length === 0) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from("certifications")
    .select("name, status, expiry_date")
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Error obteniendo certificaciones del candidato: ${error.message}`
    );
  }

  return (data ?? []).flatMap((certification) => {
    const name =
      typeof certification.name === "string"
        ? certification.name.trim()
        : "";

    if (name.length === 0) {
      return [];
    }

    const status =
      typeof certification.status === "string"
        ? certification.status.trim().toLowerCase()
        : "";

    const expiryDate =
      typeof certification.expiry_date === "string" &&
      certification.expiry_date.trim().length > 0
        ? certification.expiry_date.trim()
        : null;

    return [
      {
        name,
        status,
        expiryDate,
      },
    ];
  });
}
