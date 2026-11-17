import { readFileSync, existsSync } from "node:fs";
import { dirname,resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

const projectRoot = process.cwd();

const registerHooks = (
  (await import("node:module")) as unknown as {
    registerHooks: (hooks: Record<string, unknown>) => void;
  }
).registerHooks;

function resolveFile(candidate: string): string | null {
  const supportedExtension = /\.(ts|tsx|js)$/;

  if (supportedExtension.test(candidate)) {
    return existsSync(candidate) ? candidate : null;
  }

  const candidates = [
    `${candidate}.ts`,
    `${candidate}.tsx`,
    `${candidate}.js`,
    resolve(candidate, "index.ts"),
  ];

  return candidates.find((path) => existsSync(path)) ?? null;
}

registerHooks({
  resolve(
    specifier: string,
    context: { parentURL?: string },
    nextResolve: (specifier: string, context: unknown) => unknown
  ) {
    let candidate: string | null = null;

    if (specifier.startsWith("@/")) {
      candidate = resolve(projectRoot, specifier.slice(2));
    } else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith("file:")
    ) {
      candidate = resolve(
        dirname(fileURLToPath(context.parentURL)),
        specifier
      );
    }

    if (candidate) {
      const resolved = resolveFile(candidate);

      if (resolved) {
        return {
          url: pathToFileURL(resolved).href,
          shortCircuit: true,
        };
      }
    }

    return nextResolve(specifier, context);
  },

  load(
    url: string,
    context: unknown,
    nextLoad: (url: string, context: unknown) => unknown
  ) {
    if (url.startsWith("file:") && /\.(ts|tsx)$/.test(url)) {
      const source = readFileSync(fileURLToPath(url), "utf8");

      const output = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
          verbatimModuleSyntax: false,
        },
      });

      return {
        format: "module",
        source: output.outputText,
        shortCircuit: true,
      };
    }

    return nextLoad(url, context);
  },
});

const scoringModule = await import(
  pathToFileURL(
    resolve(projectRoot, "lib/engine/applications/scoringPipeline.ts")
  ).href
);

const rankingModule = await import(
  pathToFileURL(
    resolve(projectRoot, "lib/engine/applications/rankingEngine.ts")
  ).href
);

const decisionModule = await import(
  pathToFileURL(
    resolve(
      projectRoot,
      "lib/engine/contracts/resolvers/decisionResolver.ts"
    )
  ).href
);

const runScoringPipeline = scoringModule.runScoringPipeline;
const runRankingEngine = rankingModule.runRankingEngine;
const resolveDecision = decisionModule.resolveDecision;

let passed = 0;
let failed = 0;

function check(
  name: string,
  condition: boolean,
  detail = ""
): void {
  if (condition) {
    passed++;
    console.log(`PASS: ${name}`);
  } else {
    failed++;
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function scoring(applications: Array<Record<string, unknown>>) {
  return runScoringPipeline({ applications });
}

function ranking(scores: number[]) {
  return runRankingEngine({
    items: scores.map((score, index) => ({
      applicationId: `APP-${index + 1}`,
      score,
      breakdown: {},
      signals: [],
    })),
    metadata: {
      processedAt: new Date().toISOString(),
    },
  });
}

console.log("\n=== SCORING TESTS ===\n");

// SC-01: La asignación explícita del ATS nuevo sustituye el score anterior.
const originalApplication = {
  applicationId: "SC-01",
  score: 40,
};

const newAtsScore = 85;

const enrichedApplication = {
  ...originalApplication,
  score: Math.round(newAtsScore),
  atsScore: Math.round(newAtsScore),
};

check(
  "SC-01: La propagación del ATS nuevo prevalece sobre el score anterior",
  scoring([enrichedApplication]).items[0].score === 85
);

// SC-01B: Confirma por qué era necesaria la corrección del orquestador.
check(
  "SC-01B: Sin sobrescritura, el pipeline conserva el score anterior",
  scoring([
    {
      ...originalApplication,
      atsScore: newAtsScore,
    },
  ]).items[0].score === 40
);

// SC-02: ATS sin score previo.
check(
  "SC-02: ATS 72",
  scoring([{ applicationId: "SC-02", atsScore: 72 }]).items[0].score === 72
);

// SC-03: Score cero explícito.
check(
  "SC-03: Score cero se conserva",
  scoring([
    { applicationId: "SC-03", score: 0, atsScore: 85 },
  ]).items[0].score === 0
);

// SC-04: Score cien.
check(
  "SC-04: Score cien se conserva",
  scoring([{ applicationId: "SC-04", score: 100 }]).items[0].score === 100
);

// SC-05: Normalización del límite superior.
check(
  "SC-05: Score superior a 100 se limita",
  scoring([{ applicationId: "SC-05", score: 120 }]).items[0].score === 100
);

console.log("\n=== RANKING TESTS ===\n");

// RK-01: Orden descendente.
const descending = ranking([90, 75, 60]);

check(
  "RK-01: Orden descendente",
  descending.items
    .map((item: { applicationId: string }) => item.applicationId)
    .join(",") === "APP-1,APP-2,APP-3"
);

// RK-02: Empates estables.
const tied = ranking([80, 80, 90]);

check(
  "RK-02: Empates conservan orden original",
  tied.items
    .map((item: { applicationId: string }) => item.applicationId)
    .join(",") === "APP-3,APP-1,APP-2"
);

// RK-03: Diferencias pequeñas.
const closeScores = ranking([90, 89, 88]);

check(
  "RK-03: Diferencias pequeñas conservan orden correcto",
  closeScores.items
    .map((item: { applicationId: string }) => item.applicationId)
    .join(",") === "APP-1,APP-2,APP-3"
);

// RK-04: Un candidato.
const single = ranking([90]);

check(
  "RK-04: Un candidato obtiene rango 1",
  single.items.length === 1 && single.items[0].rank === 1
);

// RK-05: Lista vacía.
const emptyRanking = ranking([]);

check(
  "RK-05: Lista vacía produce resultado vacío",
  emptyRanking.items.length === 0
);

// RK-06: Reproducibilidad del orden.
const repeatedA = ranking([90, 80, 70]);
const repeatedB = ranking([90, 80, 70]);

check(
  "RK-06: Ejecuciones repetidas conservan el orden",
  repeatedA.items
    .map((item: { applicationId: string }) => item.applicationId)
    .join(",") ===
    repeatedB.items
      .map((item: { applicationId: string }) => item.applicationId)
      .join(",")
);

// RK-07: Rangos consecutivos.
check(
  "RK-07: Rangos consecutivos",
  descending.items.every(
    (item: { rank: number }, index: number) => item.rank === index + 1
  )
);

console.log("\n=== DECISION TESTS ===\n");

// DC-01: Umbral INTERVIEW.
const interview = resolveDecision({
  applicationId: "DC-01",
  finalScore: 93,
  rank: 1,
  total: 1,
});

check(
  "DC-01: Umbral 85 produce INTERVIEW",
  interview.score === 85 && interview.decision === "INTERVIEW"
);

// DC-02: Umbral SHORTLIST.
const shortlist = resolveDecision({
  applicationId: "DC-02",
  finalScore: 86,
  rank: 2,
  total: 2,
});

check(
  "DC-02: Umbral 70 produce SHORTLIST",
  shortlist.score === 70 && shortlist.decision === "SHORTLIST"
);

// DC-03: Score inferior al umbral.
const rejected = resolveDecision({
  applicationId: "DC-03",
  finalScore: 40,
  rank: 3,
  total: 3,
});

check(
  "DC-03: Score inferior a 70 produce REJECT",
  rejected.score < 70 && rejected.decision === "REJECT"
);

// DC-04: Un candidato.
const oneCandidateDecision = resolveDecision({
  applicationId: "DC-04",
  finalScore: 90,
  rank: 1,
  total: 1,
});

check(
  "DC-04: Decisión de un candidato es finita",
  Number.isFinite(oneCandidateDecision.score)
);

// DC-05: Total cero.
const zeroTotalDecision = resolveDecision({
  applicationId: "DC-05",
  finalScore: 80,
  rank: 1,
  total: 0,
});

check(
  "DC-05: Total cero no produce NaN ni Infinity",
  Number.isFinite(zeroTotalDecision.score)
);

// DC-06/07: contextScore ausente y aporte de 2 puntos con valor 20.
const withoutContext = resolveDecision({
  applicationId: "DC-06",
  finalScore: 80,
  rank: 1,
  total: 1,
});

const withContext = resolveDecision({
  applicationId: "DC-07",
  finalScore: 80,
  rank: 1,
  total: 1,
  contextScore: 20,
});

check(
  "DC-06/07: contextScore 20 aporta 2 puntos",
  withContext.score - withoutContext.score === 2
);

console.log("\n=== INTEGRATION TESTS ===\n");

// INT-01: Scoring → Ranking → Decision.
const integrationScoring = scoring([
  { applicationId: "INT-01-A", score: 90 },
  { applicationId: "INT-01-B", score: 75 },
  { applicationId: "INT-01-C", score: 50 },
]);

const integrationRanking = runRankingEngine(integrationScoring);

const integrationDecisions = integrationRanking.items.map(
  (item: { applicationId: string; finalScore: number; rank: number }) =>
    resolveDecision({
      ...item,
      total: integrationRanking.items.length,
    })
);

check(
  "INT-01: Scoring → Ranking → Decision completa la cadena",
  integrationDecisions.length === 3 &&
    integrationDecisions.every(
      (item: { applicationId: string }) => Boolean(item.applicationId)
    )
);

// INT-02: La secuencia sintética aplica la misma sobrescritura aprobada.
const integrationOriginal = {
  applicationId: "INT-02",
  score: 40,
};

const integrationEnriched = {
  ...integrationOriginal,
  score: Math.round(85),
  atsScore: Math.round(85),
};

const correctedFlow = scoring([integrationEnriched]);
const correctedRanking = runRankingEngine(correctedFlow);

check(
  "INT-02: ATS nuevo llega a Ranking",
  correctedRanking.items[0].finalScore === 77
);

// INT-03: Consistencia del orden integrado.
check(
  "INT-03: Ranking integrado conserva orden",
  integrationRanking.items.every(
    (
      item: { finalScore: number },
      index: number,
      items: Array<{ finalScore: number }>
    ) => index === 0 || items[index - 1].finalScore >= item.finalScore
  )
);

// INT-04: Sin aplicaciones.
const noApplications = scoring([]);
const noRanking = runRankingEngine(noApplications);

const noDecisions = noRanking.items.map(
  (item: { applicationId: string; finalScore: number; rank: number }) =>
    resolveDecision({
      ...item,
      total: noRanking.items.length,
    })
);

check(
  "INT-04: Sin aplicaciones no genera decisiones",
  noDecisions.length === 0
);

// INT-05: La corrección del orquestador está presente.
const orchestratorSource = readFileSync(
  resolve(
    projectRoot,
    "lib/engine/orchestration/careerOrchestrator.v7.ts"
  ),
  "utf8"
);

check(
  "INT-05: Orquestador propaga el ATS nuevo a score",
  /score:\s*Math\.round\(\s*ats\.data\.atsScore\s*\)/.test(
    orchestratorSource
  )
);

console.log("\n==============================");
console.log(`RESULTADO: ${passed} PASS / ${failed} FAIL`);
console.log("==============================\n");

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log("VALIDACIÓN COMPLETADA CORRECTAMENTE.");
}
