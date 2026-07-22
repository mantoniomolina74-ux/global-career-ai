import {
  procurementCompetencies
} from "../competencies/procurementCompetencies";


export type CompetencyMappingInput = {
  text: string;
};


export type CompetencyMappingResult = {
  competencies: string[];

  confidence: number;
};


export function mapCompetencies(
  input: CompetencyMappingInput
): CompetencyMappingResult {

  const normalizedText =
    input.text.toLowerCase();


  const matches =
    procurementCompetencies.filter(
      competency => {

        const patterns =
          competency.recognitionPatterns ?? [];


        return patterns.some(
          pattern =>
            normalizedText.includes(
              pattern.toLowerCase()
            )
        );
      }
    );


  return {
    competencies:
      matches.map(
        competency => competency.id
      ),

    confidence:
      matches.length > 0
        ? Math.min(
            matches.length / procurementCompetencies.length,
            1
          )
        : 0
  };
}