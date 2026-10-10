import { describe, it, expect } from "vitest";
import { baccaratRound, baccaratMultiplier, WHEEL_PAY, scratchMultiplier } from "./moreLogic";
describe("additional game rules", () => {
  it("stops on naturals and draws banker when player stands", () => {
    let cards = [4, 4, 1, 2];
    expect(baccaratRound(() => cards.shift()!).winner).toBe("player");
    expect(cards).toHaveLength(0);
    cards = [3, 3, 2, 2, 9];
    const r = baccaratRound(() => cards.shift()!);
    expect(r.player).toHaveLength(2);
    expect(r.bankerTotal).toBe(3);
    expect(r.banker).toHaveLength(3);
  });
  it("applies the full banker third-card table", () => {
    for (let banker = 0; banker <= 7; banker++) {
      for (let third = 0; third <= 9; third++) {
        const cards = [2, 0, banker, 0, third, 1];
        const r = baccaratRound(() => cards.shift()!);
        const allowed = banker <= 2 ? true : banker === 3 ? third !== 8 : banker === 4 ? [2,3,4,5,6,7].includes(third) : banker === 5 ? [4,5,6,7].includes(third) : banker === 6 ? [6,7].includes(third) : false;
        expect(r.banker.length).toBe(allowed ? 3 : 2);
      }
    }
    expect(baccaratMultiplier("player", "tie")).toBe(1);
    expect(baccaratMultiplier("banker", "tie")).toBe(1);
    expect(baccaratMultiplier("tie", "player")).toBe(0);
    expect(baccaratMultiplier("banker", "banker")).toBe(1.95);
  });
  it("enumerates all scratch cards and wheel pockets", () => {
    let wins = 0, total = 0;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 4; c++) {
      const mult = scratchMultiplier([a, b, c]);
      total += mult;
      if (mult) wins++;
    }
    expect(wins).toBe(4);
    expect(total / 64).toBe(0.9375);
    expect(WHEEL_PAY.reduce((a, b) => a + b, 0) / 12).toBeCloseTo(0.958333333333);
  });
});
