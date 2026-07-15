export interface SemanticSignal {
  /**
   * Número de perfiles históricos similares encontrados
   */
  matchedProfiles: number;

  /**
   * Promedio de éxito histórico de los perfiles similares
   */
  averageHistoricalScore: number;

  /**
   * Nivel de confianza del motor semántico (0 - 1)
   */
  confidence: number;

  /**
   * Influencia sugerida de la memoria en el sistema
   * (NO es aplicada automáticamente, solo recomendación)
   */
  influence: number;

  /**
   * Skills o patrones detectados como relevantes
   */
  inferredPatterns?: string[];
}