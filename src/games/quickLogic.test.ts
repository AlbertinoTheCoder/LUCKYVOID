import { describe, expect, it } from "vitest";
import { diceMultiplier, diceWins, kenoDraw, kenoProbability, KENO_PAY } from "./quickLogic";
describe("new game probabilities", () => {
  it("enumerates every dice target and checks boundaries and return", () => {
    for (let target = 5; target <= 95; target++) {
      for (const side of ["under", "over"] as const) {
        const wins = Array.from({ length: 100 }, (_, n) => diceWins(n, target, side)).filter(Boolean).length;
        expect(wins).toBe(side === "under" ? target : 100 - target);
        const rtp = wins / 100 * diceMultiplier(target, side);
        expect(rtp).toBeLessThanOrEqual(0.97 + 1e-12);
        expect(rtp).toBeGreaterThan(0.96);
      }
      expect(diceWins(target, target, "under")).toBe(false);
      expect(diceWins(target, target, "over")).toBe(true);
    }
  });
  it("accounts for every Keno outcome and payout", () => {
    const probabilities = KENO_PAY.map((_, n) => kenoProbability(n));
    expect(probabilities.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    const returnRate = probabilities.reduce((sum, p, n) => sum + p * KENO_PAY[n], 0);
    expect(returnRate).toBeGreaterThan(0.8);
    expect(returnRate).toBeLessThan(0.97);
    for (let i = 0; i < 100; i++) {
      const draw = kenoDraw();
      expect(new Set(draw).size).toBe(10);
      expect(draw.every(n => n >= 1 && n <= 40)).toBe(true);
    }
  });
});
