import { NextResponse } from "next/server";

import { extractCVText } from "@/lib/extract-cv";
import { supabaseServer } from "@/lib/supabase-server";
import { resolveRuntimeTenant } from "@/lib/saas/runtimeTenant";

export const runtime = "nodejs";

type JobRecord = {
  title?: string | null;
  description?: string | null;
  industry?: string | null;
  category?: string | null;
  tags?: string | null;
  [key: string]: unknown;
};

function calculateMatch(cvText: string, job: JobRecord) {
  const text = cvText.toLowerCase();

  const jobText =
    `${job.title || ""}
     ${job.description || ""}
     ${job.industry || ""}
     ${job.category || ""}
     ${job.tags || ""}`
      .toLowerCase();

  let score = 0;
  const reasons: string[] = [];

  const skillGroups = [
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
      name: "Heavy Equipment",
      keywords: [
        "machinery",
        "maquinaria",
        "equipment",
        "equipo",
        "equipo pesado",
        "heavy equipment",
        "operator",
        "operador",
        "tractor",
        "forklift",
        "montacargas",
      ],
    },
    {
      name: "Maintenance",
      keywords: [
        "maintenance",
        "mantenimiento",
        "repair",
        "reparacion",
        "reparación",
        "mechanic",
        "mecanico",
        "mecánico",
      ],
    },
    {
      name: "Construction",
      keywords: [
        "construction",
        "construccion",
        "construcción",
        "building",
        "obra",
        "edificacion",
        "edificación",
      ],
    },
    {
      name: "Mining",
      keywords: [
        "mining",
        "mineria",
        "minería",
        "miner",
        "minero",
        "mine",
        "mina",
        "subterranea",
        "subterránea",
        "underground",
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
  ];

  for (const skill of skillGroups) {
    const cvMatch = skill.keywords.some((word) =>
      text.includes(word)
    );

    const jobMatch = skill.keywords.some((word) =>
      jobText.includes(word)
    );

    if (cvMatch && jobMatch) {
      score += 20;
      reasons.push(skill.name);
    }
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

export async function POST(req: Request) {
  try {
    const { fileUrl, user_id } = await req.json();

    if (!fileUrl || !user_id) {
      return NextResponse.json(
        { error: "fileUrl y user_id son requeridos" },
        { status: 400 }
      );
    }

    const runtimeTenant = resolveRuntimeTenant(user_id);

    console.log(
      "[Runtime Tenant Context]",
      runtimeTenant
    );

    console.log("Procesando CV:", user_id);

    const text = await extractCVText(fileUrl);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del CV" },
        { status: 400 }
      );
    }

    console.log("Texto extraído:", text.length);

    const lower = text.toLowerCase();

    const skills = [
      (
        lower.includes("agriculture") ||
        lower.includes("agricultura") ||
        lower.includes("campo") ||
        lower.includes("cosecha")
      ) && "Agriculture",

      (
        lower.includes("tractor") ||
        lower.includes("machinery") ||
        lower.includes("maquinaria") ||
        lower.includes("equipo pesado") ||
        lower.includes("heavy equipment") ||
        lower.includes("montacargas") ||
        lower.includes("forklift")
      ) && "Machinery Operation",

      (
        lower.includes("mining") ||
        lower.includes("mina") ||
        lower.includes("minería") ||
        lower.includes("mineria") ||
        lower.includes("minero") ||
        lower.includes("subterránea") ||
        lower.includes("subterranea")
      ) && "Mining",

      (
        lower.includes("welding") ||
        lower.includes("soldadura") ||
        lower.includes("soldador")
      ) && "Welding",

      (
        lower.includes("construction") ||
        lower.includes("construccion") ||
        lower.includes("construcción") ||
        lower.includes("obra")
      ) && "Construction",

      (
        lower.includes("maintenance") ||
        lower.includes("mantenimiento") ||
        lower.includes("mecanico") ||
        lower.includes("mecánico")
      ) && "Maintenance",

    ].filter(Boolean) as string[];


    const industries = [
      (
        lower.includes("agriculture") ||
        lower.includes("agricultura") ||
        lower.includes("harvest") ||
        lower.includes("cosecha")
      ) && "Agriculture",

      (
        lower.includes("mining") ||
        lower.includes("mina") ||
        lower.includes("mineria") ||
        lower.includes("minería") ||
        lower.includes("equipment") ||
        lower.includes("subterranea") ||
        lower.includes("subterránea")
      ) && "Mining",

      (
        lower.includes("construction") ||
        lower.includes("construccion") ||
        lower.includes("construcción") ||
        lower.includes("obra")
      ) && "Construction",

    ].filter(Boolean) as string[];


    let atsScore = 50;

    atsScore += Math.min(skills.length * 5, 30);

    if (text.length > 1500) atsScore += 10;
    if (text.length > 2500) atsScore += 10;

    atsScore = Math.min(atsScore, 100);


    const { data: jobs } = await supabaseServer
      .from("jobs")
      .select("*");


    const matchResults =
      jobs?.map((job) => {
        const match = calculateMatch(text, job);

        return {
          job,
          match: match.score,
          reasons: match.reasons,
        };
      }) || [];


    matchResults.sort((a, b) => b.match - a.match);


    await supabaseServer.from("cv_analyses").insert({
      user_id,
      ats_score: atsScore,
      skills,
      industries,
      recommendations: [],
      cv_preview: text.slice(0, 1000),
    });


    return NextResponse.json({
      success: true,
      user_id,
      atsScore,
      skills,
      industries,
      matchResults,
      preview: text.slice(0, 300),
    });

  } catch (error: unknown) {

    console.error("ERROR analyze-cv:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error interno";


    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}