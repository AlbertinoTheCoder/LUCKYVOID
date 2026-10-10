import { binomial, shuffle } from "./logic";
export type DiceSide = "under" | "over";
export function diceWins(roll: number, target: number, side: DiceSide) {
  return side === "under" ? roll < target : roll >= target;
}
export function diceMultiplier(target: number, side: DiceSide) {
  const chance = side === "under" ? target : 100 - target;
  return Math.floor((97 / chance) * 100) / 100;
}
export const KENO_PAY = [0, 0, 0, 4, 12, 70, 500];
export function kenoDraw() {
  return shuffle(Array.from({ length: 40 }, (_, i) => i + 1)).slice(0, 10);
}
export function kenoProbability(hits: number) {
  return binomial(6, hits) * binomial(34, 10 - hits) / binomial(40, 10);
}
