/**

* ============================================================
* Global Career AI
* Matching Contracts V1.1
* ============================================================
*
* Contracts representing Matching Engine output.
*
* These contracts belong to the engine layer.
* They are transformed into domain intelligence state
* through MatchingStateAdapter.
*
* No dashboard logic.
* No persistence.
* ============================================================
  */

export interface MatchingExplanation {
matched_skills: string[];

matched_industries: string[];

certifications: {
whmis?: boolean;

csts?: boolean;

first_aid?: boolean;


};
}

export interface MatchingResultItem {
id: string;

title?: string;

description?: string;

industry?: string;

country?: string;

category?: string;

tags?: string;

match_score: number;

evidence_analysis: unknown;

match_reasons: string[];

match_explanation: MatchingExplanation;
}

export interface MatchingResult {
items: MatchingResultItem[];
}
