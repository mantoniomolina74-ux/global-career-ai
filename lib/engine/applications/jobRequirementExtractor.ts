export function extractJobRequirements(
  jobDescription: string = ""
): string[] {
  if (!jobDescription.trim()) {
    return [];
  }

  const text = jobDescription
    .toLowerCase()
    .replace(/[^\p{L}\p{N}/+#.&-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const requirementPatterns: Array<{
    requirement: string;
    patterns: string[];
  }> = [
    {
      requirement: "javascript",
      patterns: ["javascript"],
    },
    {
      requirement: "typescript",
      patterns: ["typescript"],
    },
    {
      requirement: "react",
      patterns: ["react", "reactjs"],
    },
    {
      requirement: "nextjs",
      patterns: ["next.js", "nextjs"],
    },
    {
      requirement: "nodejs",
      patterns: ["node.js", "nodejs"],
    },
    {
      requirement: "python",
      patterns: ["python"],
    },
    {
      requirement: "sql",
      patterns: ["sql"],
    },
    {
      requirement: "aws",
      patterns: ["aws", "amazon web services"],
    },
    {
      requirement: "docker",
      patterns: ["docker"],
    },
    {
      requirement: "kubernetes",
      patterns: ["kubernetes"],
    },
    {
      requirement: "machine learning",
      patterns: ["machine learning"],
    },
    {
      requirement: "data analysis",
      patterns: ["data analysis", "data analytics", "analytical skills"],
    },
    {
      requirement: "artificial intelligence",
      patterns: [
        "artificial intelligence",
        "artificial-intelligence",
        " ai ",
        "ai/",
        "/ai",
      ],
    },
    {
      requirement: "business",
      patterns: ["business"],
    },
    {
      requirement: "technology",
      patterns: ["technology", "technologies", "technological"],
    },
    {
      requirement: "life sciences",
      patterns: ["life sciences", "life science"],
    },
    {
      requirement: "consulting",
      patterns: ["consulting", "consultant"],
    },
    {
      requirement: "ai transformation",
      patterns: ["ai transformation", "artificial intelligence transformation"],
    },
    {
      requirement: "strategy",
      patterns: ["strategy", "strategic"],
    },
    {
      requirement: "project management",
      patterns: ["project management", "project manager"],
    },
    {
      requirement: "stakeholder management",
      patterns: [
        "stakeholder management",
        "stakeholders",
        "senior stakeholders",
      ],
    },
    {
      requirement: "communication",
      patterns: ["communication skills", "strong communication", "communication"],
    },
    {
      requirement: "english",
      patterns: ["english"],
    },
    {
      requirement: "sap",
      patterns: ["sap"],
    },
    {
      requirement: "erp",
      patterns: ["erp"],
    },
    {
      requirement: "engineering",
      patterns: ["engineering", "engineer"],
    },
    {
      requirement: "information technology",
      patterns: ["information technology"],
    },
    {
      requirement: "testing",
      patterns: ["testing", "test automation"],
    },
    {
      requirement: "implementation",
      patterns: ["implementation", "implementing", "implement"],
    },
    {
      requirement: "training",
      patterns: ["training", "train"],
    },
  ];

  const requirements: string[] = [];

  for (const { requirement, patterns } of requirementPatterns) {
    const matched = patterns.some((pattern) => {
      const normalizedPattern = pattern.trim().toLowerCase();

      if (
        normalizedPattern === "ai" ||
        normalizedPattern === "ai/" ||
        normalizedPattern === "/ai"
      ) {
        return (
          text.includes(" artificial intelligence ") ||
          text.includes(" ai ") ||
          text.includes("ai/")
        );
      }

      return text.includes(normalizedPattern);
    });

    if (matched) {
      requirements.push(requirement);
    }
  }

  return [...new Set(requirements)];
}
