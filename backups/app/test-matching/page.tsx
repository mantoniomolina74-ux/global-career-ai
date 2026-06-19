"use client";

import { useState } from "react";

export default function TestMatchingPage() {
  const [result, setResult] = useState("");

  async function testMatch() {
    try {
      const response = await fetch("/api/ai/match-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "bf90c608-c640-492d-a60c-731e7cae335d",
          cv_id: "bf90c608-c640-492d-a60c-731e7cae335d",
        }),
      });

      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error al ejecutar la prueba");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Prueba de Job Matching</h1>

      <button onClick={testMatch}>
        Ejecutar Prueba
      </button>

      <pre>{result}</pre>
    </div>
  );
}