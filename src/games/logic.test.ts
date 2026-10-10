import { crashFromUniform } from "./logic";
import { describe, it, expect } from "vitest";
import {
  slotPayout,
  SLOT_PAY,
  roulettePayout,
  RED,
  rouletteNumbers,
  minesMultiplier,
  sampleMines,
  plinkoMultipliers,
  binomial,
  makeDeck,
  handValue,
  blackjackReturn,
  crashPoint,
  randomInt,
} from "./logic";
import {
  newBlackjack,
  splitHand,
  canSplit,
  finishDealer,
  type BJRound,
} from "./blackjackEngine";
const card = (rank: number) => ({ rank, suit: "♠" });
describe("slot probabilities and payouts", () => {
  it("enumerates all 216 three-reel outcomes with an 85.648% return", () => {
    let total = 0,
      triples = 0,
      pairs = 0;
    for (let a = 0; a < 6; a++)
      for (let b = 0; b < 6; b++)
        for (let c = 0; c < 6; c++) {
          const p = slotPayout([a, b, c]);
          total += p;
          if (a === b && b === c) triples++;
          else if (p === 1) pairs++;
        }
    expect(triples).toBe(6);
    expect(pairs).toBe(60);
    expect(total / 216).toBeCloseTo(185 / 216);
    SLOT_PAY.forEach((p, i) => expect(slotPayout([i, i, i])).toBe(p));
    expect(slotPayout([1, 2, 1])).toBe(0);
  });
  it("enumerates all 7,776 five-reel outcomes with correct left-to-right wins", () => {
    let sum = 0;
    for (let n = 0; n < 7776; n++) {
      let v = n;
      const a = [];
      for (let i = 0; i < 5; i++) {
        a.push(v % 6);
        v = Math.floor(v / 6);
      }
      sum += slotPayout(a, true);
    }
    expect(sum / 7776).toBeCloseTo(1150 / 1296);
    expect(slotPayout([1, 2, 2, 2, 2], true)).toBe(0);
  });
});
describe("European roulette", () => {
  it("has 37 unique pockets and 18 red numbers", () => {
    expect(new Set(rouletteNumbers).size).toBe(37);
    expect(RED.size).toBe(18);
  });
  it("every bet has the same 36/37 expected return", () => {
    for (const bet of [
      "red",
      "black",
      "odd",
      "even",
      "low",
      "high",
      "dozen1",
      "dozen2",
      "dozen3",
      0,
      17,
      36,
    ] as const) {
      const sum = Array.from({ length: 37 }, (_, n) =>
        roulettePayout(bet, n),
      ).reduce((s, n) => s + n, 0);
      expect(sum / 37).toBeCloseTo(36 / 37);
    }
    expect(roulettePayout("even", 0)).toBe(0);
  });
});
describe("mines", () => {
  it("samples unique hidden locations", () => {
    for (const count of [1, 3, 5, 10, 15, 24]) {
      const mines = sampleMines(count);
      expect(new Set(mines).size).toBe(count);
      expect(mines.every((v) => v >= 0 && v < 25)).toBe(true);
    }
  });
  it("uses exact survival probabilities and increases each reveal", () => {
    for (const count of [1, 3, 5, 10, 15, 24]) {
      let prob = 1,
        prev = 1;
      for (let k = 1; k <= 25 - count; k++) {
        prob *= (25 - count - k + 1) / (26 - k);
        const m = minesMultiplier(count, k);
        expect(m).toBeGreaterThan(prev);
        expect(m * prob).toBeLessThanOrEqual(0.97000001);
        expect(m * prob).toBeGreaterThan(0.959);
        prev = m;
      }
    }
    expect(minesMultiplier(24, 1)).toBe(24.25);
  });
});
describe("plinko", () => {
  it("binomial paths sum to one and risk changes only payouts", () => {
    expect(
      Array.from({ length: 9 }, (_, i) => binomial(8, i)).reduce(
        (a, b) => a + b,
        0,
      ),
    ).toBe(256);
    for (const risk of ["low", "medium", "high"] as const) {
      const m = plinkoMultipliers(risk);
      expect(m).toEqual([...m].reverse());
      const ev = m.reduce((s, v, i) => s + (v * binomial(8, i)) / 256, 0);
      expect(ev).toBeLessThanOrEqual(0.96);
      expect(ev).toBeGreaterThan(0.95);
    }
  });
});
describe("blackjack", () => {
  it("builds a fresh six-deck shoe", () => {
    const d = makeDeck();
    expect(d.length).toBe(312);
    expect(d.filter((c) => c.rank === 1).length).toBe(24);
    expect(d.filter((c) => c.suit === "♥").length).toBe(78);
    expect(newBlackjack("round", 100).deck.length).toBe(308);
  });
  it("handles soft hands and multiple aces", () => {
    expect(handValue([card(1), card(1), card(9)])).toBe(21);
    expect(handValue([card(1), card(6)])).toBe(17);
    expect(handValue([card(1), card(6), card(10)])).toBe(17);
  });
  it("settles naturals, dealer naturals, busts, wins, and pushes", () => {
    expect(
      blackjackReturn([card(1), card(10)], [card(10), card(9)], 100, true),
    ).toBe(250);
    expect(
      blackjackReturn([card(1), card(10)], [card(1), card(10)], 100, true),
    ).toBe(100);
    expect(
      blackjackReturn([card(1), card(10)], [card(10), card(9)], 100, false),
    ).toBe(200);
    expect(
      blackjackReturn([card(10), card(9)], [card(1), card(10)], 100, false),
    ).toBe(0);
    expect(
      blackjackReturn(
        [card(10), card(10), card(2)],
        [card(10), card(9)],
        100,
        false,
      ),
    ).toBe(0);
    expect(
      blackjackReturn([card(10), card(8)], [card(9), card(9)], 100, false),
    ).toBe(100);
  });
  it("splits aces with one card and no resplit", () => {
    const r: BJRound = {
      id: "test",
      deck: [card(10), card(9)],
      dealer: [card(10), card(7)],
      hands: [
        {
          cards: [card(1), card(1)],
          bet: 100,
          done: false,
          split: false,
          splitAces: false,
        },
      ],
      active: 0,
      finished: false,
      resolving: false,
    };
    expect(canSplit(r)).toBe(true);
    splitHand(r);
    expect(r.hands).toHaveLength(2);
    expect(
      r.hands.every((h) => h.done && h.splitAces && h.cards.length === 2),
    ).toBe(true);
    expect(canSplit(r)).toBe(false);
    expect(finishDealer(r)).toBe(400);
  });
  it("dealer stands on soft 17 and draws below 17", () => {
    const r = newBlackjack("test", 100);
    r.dealer = [card(1), card(6)];
    r.hands[0].cards = [card(10), card(8)];
    const before = r.deck.length;
    finishDealer(r);
    expect(r.deck.length).toBe(before);
    r.finished = false;
    r.dealer = [card(10), card(6)];
    r.deck = [card(5)];
    finishDealer(r);
    expect(handValue(r.dealer)).toBe(21);
  });
});
describe("random outcomes", () => {
  it("keeps sampled outcomes inside their declared bounds", () => {
    for (let i = 0; i < 300; i++) {
      expect(randomInt(37)).toBeLessThan(37);
      const c = crashPoint();
      expect(c).toBeGreaterThanOrEqual(1);
      expect(c).toBeLessThanOrEqual(1000);
    }
    expect(() => randomInt(0)).toThrow();
  });
});

it("Crash has exactly 3% instant stops and the stated survival probabilities", () => {
  const samples = Array.from({ length: 10000 }, (_, i) =>
    crashFromUniform((i + 0.5) / 10000),
  );
  expect(samples.filter((m) => m === 1).length / 10000).toBe(0.03);
  expect(samples.filter((m) => m >= 2).length / 10000).toBe(0.485);
  expect(samples.filter((m) => m >= 5).length / 10000).toBe(0.194);
  expect(samples.filter((m) => m >= 10).length / 10000).toBe(0.097);
  expect(() => crashFromUniform(1)).toThrow();
});
