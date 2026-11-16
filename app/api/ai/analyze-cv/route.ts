import { NextResponse } from "next/server";
import {
  extractPrivateCVText,
  PrivateCVError,
} from "@/lib/cv/privateCVService";
import { supabaseServer } from "@/lib/supabase-server";
import { resolveRuntimeTenant } from "@/lib/saas/runtimeTenant";
import { createSupabaseServerAuth } from "@/lib/supabase/server";
import { getPremiumAccess } from "@/lib/billing/premiumAccess";

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
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Solicitud JSON inválida",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("storagePath" in body) ||
      typeof body.storagePath !== "string" ||
      body.storagePath.length === 0 ||
      body.storagePath.length > 512
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "storagePath es requerido",
        },
        { status: 400 }
      );
    }

    const storagePath = body.storagePath;

    const supabase = await createSupabaseServerAuth();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Autenticación requerida",
        },
        { status: 401 }
      );
    }

    const premiumAccess = await getPremiumAccess(user.id);

    if (!premiumAccess.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Premium access required",
        },
        { status: 403 }
      );
    }

    const pathSegments = storagePath.split("/");

    const validFilename =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i;

    if (
      pathSegments.length !== 2 ||
      pathSegments[0] !== user.id ||
      !validFilename.test(pathSegments[1])
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Ruta de CV inválida",
        },
        { status: 400 }
      );
    }

    resolveRuntimeTenant(user.id);

    let text: string;

    try {
      text = await extractPrivateCVText(
        user.id,
        storagePath
      );
    } catch (error: unknown) {
      if (error instanceof PrivateCVError) {
        return NextResponse.json(
          {
            success: false,
            error: "No se pudo procesar el CV almacenado",
          },
          { status: 422 }
        );
      }

      throw error;
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo extraer texto del CV",
        },
        { status: 400 }
      );
    }

    const skills = detectSkills(text);
    const industries = detectIndustries(text);

    const atsScore = calculateAtsScore(
      text,
      skills,
      industries
    );

    const { data: cvAnalysis, error: cvError } =
      await supabaseServer
        .from("cv_analyses")
        .insert({
          user_id: user.id,
          storage_path: storagePath,
          file_url: null,
          ats_score: atsScore,
          skills,
          industries,
          recommendations: [],
          cv_preview: text.slice(0, 1000),
        })
        .select(
          "id, user_id, storage_path, file_url, ats_score, skills, industries, recommendations, cv_preview, created_at"
        )
        .single();

    if (cvError) {
      console.error(
        "Error guardando análisis del CV:",
        cvError.code
      );

      throw new Error(
        "No se pudo guardar el análisis del CV."
      );
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
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
      error instanceof Error
        ? error.message
        : "Error desconocido"
    );

    return NextResponse.json(
      {
        success: false,
        error: "Error interno al analizar el CV",
      },
      { status: 500 }
    );
  }
}