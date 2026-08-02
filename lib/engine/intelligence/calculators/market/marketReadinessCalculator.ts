import { CareerState } from "../../../contracts/careerState";

export function calculateMarketReadiness(
  state: CareerState
): number {
  return state.profileIntelligence.marketFit;
}