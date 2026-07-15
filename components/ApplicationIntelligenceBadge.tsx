type Props = {
  intelligence?: {
    score: number;
    probabilityOfHire: number;
    momentum: number;
    riskLevel: "low" | "medium" | "high";
    nextAction: "FOLLOW_UP" | "PREPARE_INTERVIEW" | "IMPROVE_CV" | "WAIT" | "MOVE_ON";
  };
};

export default function ApplicationIntelligenceBadge({ intelligence }: Props) {
  if (!intelligence) return null;

  return (
    <div style={{
      fontSize: "12px",
      opacity: 0.85,
      display: "flex",
      gap: "8px",
      flexWrap: "wrap"
    }}>
      <span>Score: {intelligence.score}</span>
      <span>Risk: {intelligence.riskLevel}</span>
      <span>Next: {intelligence.nextAction}</span>
    </div>
  );
}