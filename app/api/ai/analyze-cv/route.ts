import { NextResponse } from "next/server";

import { extractCVText } from "@/lib/extract-cv";
import { supabaseServer } from "@/lib/supabase-server";
import { resolveRuntimeTenant } from "@/lib/saas/runtimeTenant";

export const runtime = "nodejs";

function normalizeText(value: string = ""): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectSkills(text: string): string[] {
  const normalized = normalizeText(text);

  const detected: string[] = [];

  const skillRules: Array<{
    name: string;
    keywords: string[];
  }> = [
    {
      name: "Purchasing",
      keywords: [
        "jefe de compras",
        "compras",
        "adquisicion de materia prima",
        "adquisiciones",
        "procurement",
        "purchasing",
      ],
    },
    {
      name: "Procurement",
      keywords: [
        "procurement",
        "purchasing",
        "adquisicion de materia prima",
        "adquisiciones",
      ],
    },
    {
      name: "Inventory Management",
      keywords: [
        "inventario",
        "inventarios",
        "inventory",
        "control de inventario",
      ],
    },
    {
      name: "Accounts Receivable",
      keywords: [
        "cartera y pagos",
        "administracion de cartera",
        "cuentas por cobrar",
        "accounts receivable",
      ],
    },
    {
      name: "Industrial Security",
      keywords: [
        "seguridad industrial",
        "industrial security",
        "seguridad patrimonial",
        "proteccion patrimonial",
      ],
    },
    {
      name: "Security Management",
      keywords: [
        "jefe de seguridad",
        "seguridad patrimonial",
        "coordinacion de seguridad",
        "coordinacion de la seguridad",
        "security management",
      ],
    },
    {
      name: "Executive Driving",
      keywords: [
        "chofer ejecutivo",
        "conduccion de vehiculos",
        "conduccion de vehiculos oficiales",
        "executive driver",
        "private driver",
      ],
    },
    {
      name: "Personal Protection",
      keywords: [
        "proteccion personal",
        "servicio de proteccion",
        "personal protection",
      ],
    },
    {
      name: "Agriculture",
      keywords: [
        "agriculture",
        "agricultura",
        "farm",
        "granja",
        "harvest",
        "cosecha",
        "campo",
        "cultivo",
      ],
    },
    {
      name: "Machinery Operation",
      keywords: [
        "tractor",
        "machinery",
        "maquinaria",
        "heavy equipment",
        "equipo pesado",
        "forklift",
        "montacargas",
        "operator",
        "operador",
      ],
    },
    {
      name: "Mining",
      keywords: [
        "mining",
        "mineria",
        "minero",
        "mina",
        "mine",
        "underground",
        "subterranea",
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
    {
      name: "Construction",
      keywords: [
        "construction",
        "construccion",
        "building",
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
  ];

  for (const rule of skillRules) {
    const matched = rule.keywords.some((keyword) =>
      normalized.includes(normalizeText(keyword))
    );

    if (matched) {
      detected.push(rule.name);
    }
  }

  return [...new Set(detected)];
}

function detectIndustries(text: string): string[] {
  const normalized = normalizeText(text);

  const detected: string[] = [];

  const industryRules: Array<{
    name: string;
    keywords: string[];
  }> = [
    {
      name: "Food & Consumer Products",
      keywords: [
        "productos comestibles",
        "food products",
        "consumer products",
      ],
    },
    {
      name: "Industrial Security",
      keywords: [
        "seguridad industrial",
        "seguridad patrimonial",
        "industrial security",
      ],
    },
    {
      name: "Security Services",
      keywords: [
        "seguridad patrimonial",
        "jefe de seguridad",
        "servicio de proteccion",
        "proteccion personal",
      ],
    },
    {
      name: "Agriculture",
      keywords: [
        "agriculture",
        "agricultura",
        "harvest",
        "cosecha",
        "farm",
        "campo",
        "cultivo",
      ],
    },
    {
      name: "Mining",
      keywords: [
        "mining",
        "mineria",
        "minero",
        "mina",
        "mine",
        "underground",
        "subterranea",
      ],
    },
    {
      name: "Construction",
      keywords: [
        "construction",
        "construccion",
        "building",
        "obra",
        "edificacion",
      ],
    },
  ];

  for (const rule of industryRules) {
    const matched = rule.keywords.some((keyword) =>
      normalized.includes(normalizeText(keyword))
    );

    if (matched) {
      detected.push(rule.name);
    }
  }

  return [...new Set(detected)];
}

function calculateAtsScore(
  text: string,
  skills: string[],
  industries: string[]
): number {
  let score = 50;

  score += Math.min(skills.length * 5, 30);

  if (industries.length > 0) {
    score += Math.min(industries.length * 5, 10);
  }

  if (text.length > 1500) {
    score += 10;
  }

  if (text.length > 2500) {
    score += 10;
  }

  return Math.min(score, 100);
}

export async function POST(req: Request) {
  try {
    const { fileUrl, user_id } = await req.json();

    if (!fileUrl || !user_id) {
      return NextResponse.json(
        {
          error: "fileUrl y user_id son requeridos",
        },
        {
          status: 400,
        }
      );
    }

    const runtimeTenant = resolveRuntimeTenant(user_id);

    console.log(
      "[Runtime Tenant Context]",
      runtimeTenant
    );

    console.log(
      "Procesando CV:",
      user_id
    );

    const text = await extractCVText(fileUrl);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          error: "No se pudo extraer texto del CV",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Texto extraído:",
      text.length
    );

    const skills = detectSkills(text);

    const industries = detectIndustries(text);

    const atsScore = calculateAtsScore(
      text,
      skills,
      industries
    );

    console.log(
      "[CV ANALYSIS DEBUG]",
      {
        userId: user_id,
        textLength: text.length,
        skills,
        industries,
        atsScore,
      }
    );

    const { data: cvAnalysis, error: cvError } =
      await supabaseServer
        .from("cv_analyses")
        .insert({
          user_id,
          ats_score: atsScore,
          skills,
          industries,
          recommendations: [],
          cv_preview: text.slice(0, 1000),
        })
        .select(
          "id, user_id, ats_score, skills, industries, recommendations, cv_preview, created_at"
        )
        .single();

    if (cvError) {
      throw new Error(
        `Error guardando análisis del CV: ${cvError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      user_id,
      cvAnalysis,
      atsScore,
      skills,
      industries,
      matchResults: [],
      preview: text.slice(0, 300),
    });
  } catch (error: unknown) {
    console.error(
      "ERROR analyze-cv:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Error interno";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}