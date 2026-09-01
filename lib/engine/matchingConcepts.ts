/**
 * ============================================================
 * Global Career AI
 * Matching Concepts — Single Source of Truth
 * ============================================================
 *
 * Shared concept normalization and matching logic used by:
 * - jobScoring.ts
 * - matchReasons.ts
 *
 * This module contains no scoring logic and no explanation logic.
 * ============================================================
 */

export const MATCH_GROUPS = [
  {
    name: "Mining",
    keywords: [
      "mining",
      "mina",
      "mineria",
      "minero",
      "miner",
      "underground",
      "subterranea",
    ],
  },
  {
    name: "Heavy Equipment",
    keywords: [
      "heavy equipment",
      "equipo pesado",
      "machinery",
      "maquinaria",
      "operator",
      "operador",
      "forklift",
      "montacargas",
      "tractor",
    ],
  },
  {
    name: "Agriculture",
    keywords: [
      "agriculture",
      "agricultura",
      "farming",
      "agricultural",
      "farmer",
      "cultivo",
      "cosecha",
    ],
  },
  {
    name: "Construction",
    keywords: [
      "construction",
      "construccion",
      "building construction",
      "obra",
      "edificacion",
    ],
  },
  {
    name: "Maintenance",
    keywords: [
      "maintenance",
      "mantenimiento",
      "repair",
      "reparacion",
      "mechanic",
      "mecanico",
    ],
  },
  {
    name: "Welding",
    keywords: [
      "welding",
      "soldadura",
      "welder",
      "soldador",
    ],
  },
] as const;


export function normalizeText(
  value: string = ""
): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


export function matchesConcept(
  text: string,
  value: string
): boolean {
  const normalizedText = normalizeText(text);
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return false;
  }

  const group = MATCH_GROUPS.find((item) =>
    item.keywords.some(
      (keyword) =>
        normalizeText(keyword) === normalizedValue
    )
  );

  if (!group) {
    return normalizedText
      .split(/\s+/)
      .includes(normalizedValue);
  }

  return group.keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    if (
      normalizedText
        .split(/\s+/)
        .includes(normalizedKeyword)
    ) {
      return true;
    }

    return normalizedText.includes(
      ` ${normalizedKeyword} `
    );
  });
}
