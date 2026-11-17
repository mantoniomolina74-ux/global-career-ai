import {
  getCandidateCertifications,
} from "@/lib/db/repositories/certificationRepository";

/**
 * Returns only the candidate's active, non-expired certifications.
 *
 * Rules:
 * - Only records with status "active".
 * - Null expiry dates are considered valid.
 * - Expiry dates equal to today remain valid.
 * - Empty names are excluded.
 * - Duplicate names are removed case-insensitively.
 */
export async function getActiveCandidateCertificationNames(
  userId: string
): Promise<string[]> {
  const certificationRecords =
    await getCandidateCertifications(userId);

  const today =
    new Date().toISOString().slice(0, 10);

  const uniqueCertifications =
    new Map<string, string>();

  for (const certification of certificationRecords) {
    const {
      name,
      status,
      expiryDate,
    } = certification;

    const isNotExpired =
      expiryDate === null ||
      expiryDate >= today;

    if (
      name.length === 0 ||
      status !== "active" ||
      !isNotExpired
    ) {
      continue;
    }

    const normalizedName =
      name.toLowerCase();

    if (!uniqueCertifications.has(normalizedName)) {
      uniqueCertifications.set(
        normalizedName,
        name
      );
    }
  }

  return Array.from(uniqueCertifications.values());
}
