import { NextResponse } from "next/server";
import { extractCVText } from "@/lib/extract-cv";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

type JobRecord = {
  description?: string | null;
  [key: string]: unknown;
};

function calculateMatch(cvText: string, job: JobRecord) {
  const text = cvText.toLowerCase();
  const jobText = job.description?.toLowerCase() || "";

  let score = 0;
  const reasons: string[] = [];

  const keywords = [
    "agriculture",
    "tractor",
    "welding",
    "forklift",
    "machinery",
    "equipment",
    "construction",
    "maintenance",
    "mining",
    "irrigation",
    "harvest",
  ];

  for (const word of keywords) {
    if (text.includes(word) && jobText.includes(word)) {
      score += 15;
      reasons.push(word);
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
      lower.includes("agriculture") && "Agriculture",
      lower.includes("tractor") && "Tractor Operation",
      lower.includes("welding") && "Welding",
      lower.includes("forklift") && "Forklift",
      lower.includes("construction") && "Construction",
      lower.includes("machinery") && "Machinery Operation",
    ].filter(Boolean) as string[];

    const industries = [
      (lower.includes("agriculture") || lower.includes("harvest")) && "Agriculture",
      (lower.includes("mining") || lower.includes("equipment")) && "Mining",
      lower.includes("construction") && "Construction",
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