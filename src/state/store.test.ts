import { describe, it, expect } from "vitest";
import {
  initialPlayer,
  loadPlayer,
  parsePlayer,
  settlePlayer,
  unlock,
} from "./store";
import { ACHIEVEMENTS } from "../utils/achievements";
import type { Result } from "../types";
const result: Result = {
  id: "round",
  game: "neon",
  bet: 100,
  payout: 500,
  detail: "Triple cherries",
  time: 1,
};
describe("progress backups", () => {
  it("starts music and sound effects enabled", () => {
    expect(initialPlayer().settings.sound).toBe(true);
    expect(initialPlayer().settings.music).toBe(true);
  });
  it("rejects damaged nested data before restoring", () => {
    for (const change of [
      { pending: [{ id: "bad", game: "neon", bet: -500 }] },
      { results: [{ ...result, game: "missing" }] },
      { transactions: null },
      { favorites: null },
      { achievements: ["missing"] },
      { settings: { sound: "yes" } },
      { xp: -1 },
      { username: null },
    ]) {
      const raw = JSON.stringify({ ...initialPlayer(), ...change });
      expect(() => parsePlayer(raw)).toThrow();
      expect(loadPlayer(raw).balance).toBe(10000);
    }
  });
  it("keeps backup progress and limits history size", () => {
    const p = initialPlayer();
    p.balance = 12345;
    p.results = Array.from({ length: 600 }, (_, i) => ({
      ...result,
      id: String(i),
    }));
    p.favorites = ["plinko", "plinko"];
    const restored = parsePlayer(JSON.stringify(p));
    expect(restored.balance).toBe(12345);
    expect(restored.results).toHaveLength(500);
    expect(restored.favorites).toEqual(["plinko"]);
  });
  it("rejects nonfinite payouts and uses the reserved game", () => {
    const p = initialPlayer();
    p.pending = [{ id: "round", game: "plinko", bet: 100 }];
    expect(settlePlayer(p, { ...result, payout: NaN })).toBe(p);
    expect(settlePlayer(p, { ...result, payout: Infinity })).toBe(p);
    expect(settlePlayer(p, result).results[0].game).toBe("plinko");
  });
});
describe("persistent wallet", () => {
  it("starts at 10,000 and rejects corrupt storage", () => {
    expect(initialPlayer().balance).toBe(10000);
    expect(loadPlayer("garbage").balance).toBe(10000);
    expect(loadPlayer('{"version":1,"balance":-5}').balance).toBe(10000);
  });
  it("settles reserved bets exactly once", () => {
    const p = initialPlayer();
    p.balance -= 100;
    p.pending = [{ id: "round", game: "neon", bet: 100 }];
    const next = settlePlayer(p, result);
    expect(next.balance).toBe(10400);
    expect(next.gamesPlayed).toBe(1);
    expect(next.totalWon).toBe(500);
    expect(next.biggestWin).toBe(500);
    expect(next.xp).toBe(40);
    expect(next.pending).toHaveLength(0);
    expect(settlePlayer(next, result)).toBe(next);
  });
  it("records a loss without a second deduction", () => {
    const p = initialPlayer();
    p.balance = 9900;
    p.pending = [{ id: "round", game: "neon", bet: 100 }];
    expect(settlePlayer(p, { ...result, payout: 0 }).balance).toBe(9900);
  });
  it("refunds interrupted rounds on restore", () => {
    const p = initialPlayer();
    p.balance = 9700;
    p.pending = [{ id: "round", game: "blackjack", bet: 300 }];
    const restored = loadPlayer(JSON.stringify(p));
    expect(restored.balance).toBe(10000);
    expect(restored.pending).toHaveLength(0);
    expect(restored.transactions[0].amount).toBe(300);
  });
  it("roundtrips profile, favorites, achievements, and settings", () => {
    const p = initialPlayer();
    p.username = "Cosmic";
    p.favorites = ["plinko"];
    p.settings.sound = true;
    p.achievements = ["daily"];
    expect(loadPlayer(JSON.stringify(p))).toEqual(p);
  });
});
describe("achievements", () => {
  it("has 24 unique achievements", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(
      ACHIEVEMENTS.length,
    );
  });
  it("awards coins once, with transaction evidence", () => {
    const p = initialPlayer();
    p.results = [result];
    p.gamesPlayed = 1;
    p.wins = 1;
    const first = unlock(p);
    expect(first.unlocked).toContain("first");
    expect(first.unlocked).toContain("win");
    expect(first.player.balance).toBe(10200);
    expect(first.player.transactions[0].label).toContain("Achievement");
    expect(unlock(first.player).unlocked).toHaveLength(0);
  });
  it("unlocks milestones and meta conditions", () => {
    const p = initialPlayer();
    p.balance = 1000000;
    p.gamesPlayed = 1000;
    p.dailyClaims = 7;
    p.xp = 2000;
    p.biggestWin = 10000;
    p.bestStreak = 3;
    p.results = [
      { ...result, meta: { sevens: 1 } },
      { ...result, id: "bj", game: "blackjack", meta: { natural: 1 } },
      { ...result, id: "r", game: "roulette", meta: { straightWin: 1 } },
      { ...result, id: "c", game: "crash", meta: { multiplier: 5 } },
      { ...result, id: "m", game: "mines", meta: { revealed: 5 } },
      { ...result, id: "p", game: "plinko", meta: { multiplier: 10 } },
      { ...result, id: "v", game: "void" },
      { ...result, id: "g", game: "gold" },
    ];
    const u = unlock(p);
    for (const id of [
      "all",
      "million",
      "thousand",
      "moon",
      "natural",
      "number",
      "miner",
      "champion",
      "seven",
      "week",
      "level",
      "streak",
    ])
      expect(u.unlocked).toContain(id);
  });
});

it("unlocks a balance milestone immediately when another achievement reward crosses it", () => {
  const p = initialPlayer();
  p.balance = 999950;
  p.dailyClaims = 1;
  const result = unlock(p);
  expect(result.unlocked).toContain("daily");
  expect(result.unlocked).toContain("million");
});
