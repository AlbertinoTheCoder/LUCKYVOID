import type { Player, Result } from "../types";
import { ACHIEVEMENTS } from "../utils/achievements";
import { GAMES } from "../utils/games";
export const STORAGE_KEY = "luckyvoid.player.v1";
export function initialPlayer(): Player {
  return {
    version: 1,
    username: "Void Explorer",
    avatar: "👾",
    balance: 10000,
    xp: 0,
    gamesPlayed: 0,
    totalWon: 0,
    biggestWin: 0,
    wins: 0,
    streak: 0,
    bestStreak: 0,
    dailyClaims: 0,
    lastDaily: "",
    favorites: [],
    achievements: [],
    results: [],
    transactions: [
      {
        id: "welcome",
        time: Date.now(),
        amount: 10000,
        label: "Welcome to the void",
      },
    ],
    pending: [],
    settings: {
      language: "en",
      // Default on as requested; the audio hook waits for a browser gesture.
      sound: true,
      music: true,
      reducedMotion:
        typeof matchMedia !== "undefined" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      quality: "high",
    },
  };
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isGame = (value: unknown) => GAMES.some((g) => g.id === value);
export function parsePlayer(raw: string): Player {
  const p: unknown = JSON.parse(raw);
  if (!isRecord(p) || p.version !== 1)
    throw new Error("This is not a LUCKYVOID progress backup.");
  for (const key of [
    "balance",
    "xp",
    "gamesPlayed",
    "totalWon",
    "biggestWin",
    "wins",
    "streak",
    "bestStreak",
    "dailyClaims",
  ])
    if (!isCount(p[key]))
      throw new Error("The saved player statistics are damaged.");
  if (
    typeof p.username !== "string" ||
    !p.username.trim() ||
    p.username.length > 24 ||
    typeof p.avatar !== "string" ||
    p.avatar.length > 16 ||
    typeof p.lastDaily !== "string" ||
    (p.lastDaily !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(p.lastDaily))
  )
    throw new Error("The saved profile is damaged.");
  if (
    !Array.isArray(p.favorites) ||
    !p.favorites.every(isGame) ||
    !Array.isArray(p.achievements) ||
    !p.achievements.every(
      (id) => typeof id === "string" && ACHIEVEMENTS.some((a) => a.id === id),
    )
  )
    throw new Error("The saved favorites or achievements are damaged.");
  if (
    !Array.isArray(p.pending) ||
    !p.pending.every(
      (r) =>
        isRecord(r) &&
        typeof r.id === "string" &&
        isGame(r.game) &&
        isCount(r.bet) &&
        r.bet >= 10,
    )
  )
    throw new Error("The saved rounds are damaged.");
  if (
    !Array.isArray(p.results) ||
    !p.results.every(
      (r) =>
        isRecord(r) &&
        typeof r.id === "string" &&
        isGame(r.game) &&
        isCount(r.bet) &&
        isCount(r.payout) &&
        typeof r.detail === "string" &&
        isCount(r.time) &&
        (r.meta === undefined ||
          (isRecord(r.meta) &&
            Object.values(r.meta).every(
              (v) => typeof v === "number" && Number.isFinite(v),
            ))),
    )
  )
    throw new Error("The saved game history is damaged.");
  if (
    !Array.isArray(p.transactions) ||
    !p.transactions.every(
      (t) =>
        isRecord(t) &&
        typeof t.id === "string" &&
        typeof t.label === "string" &&
        typeof t.amount === "number" &&
        Number.isSafeInteger(t.amount) &&
        isCount(t.time),
    )
  )
    throw new Error("The saved coin history is damaged.");
  const fresh = initialPlayer();
  if (
    p.settings !== undefined &&
    (!isRecord(p.settings) ||
      Object.entries(p.settings).some(([key, value]) =>
        key === "language"
          ? !["en", "it"].includes(String(value))
          : key === "quality"
            ? !["high", "low"].includes(String(value))
            : !["sound", "music", "reducedMotion"].includes(key) ||
              typeof value !== "boolean",
      ))
  )
    throw new Error("The saved settings are damaged.");
  const loaded = {
    ...fresh,
    ...p,
    settings: {
      ...fresh.settings,
      ...((p.settings as Partial<Player["settings"]>) ?? {}),
    },
  } as Player;
  loaded.favorites = [...new Set(loaded.favorites)];
  loaded.achievements = [...new Set(loaded.achievements)];
  loaded.results = loaded.results.slice(0, 500);
  loaded.transactions = loaded.transactions.slice(0, 200);
  if (loaded.pending.length) {
    const refund = loaded.pending.reduce((n, r) => n + r.bet, 0);
    if (!Number.isSafeInteger(loaded.balance + refund))
      throw new Error("The saved balance is too large.");
    loaded.balance += refund;
    loaded.transactions = [
      {
        id: crypto.randomUUID(),
        time: Date.now(),
        amount: refund,
        label: "Interrupted rounds refunded",
      },
      ...loaded.transactions,
    ].slice(0, 200);
    loaded.pending = [];
  }
  return loaded;
}
export function loadPlayer(raw: string | null): Player {
  try {
    return raw ? parsePlayer(raw) : initialPlayer();
  } catch {
    return initialPlayer();
  }
}
export function unlock(p: Player): { player: Player; unlocked: string[] } {
  let next = p;
  const unlocked: string[] = [];
  // Rewards can themselves cross a balance milestone; resolve that in the same commit.
  while (true) {
    const rewards = ACHIEVEMENTS.filter(
      (a) => !next.achievements.includes(a.id) && a.test(next),
    );
    if (!rewards.length) break;
    const ids = rewards.map((a) => a.id);
    unlocked.push(...ids);
    next = {
      ...next,
      balance: next.balance + rewards.reduce((sum, a) => sum + a.reward, 0),
      achievements: [...next.achievements, ...ids],
      transactions: [
        ...rewards.map((a) => ({
          id: crypto.randomUUID(),
          time: Date.now(),
          amount: a.reward,
          label: `Achievement: ${a.name}`,
        })),
        ...next.transactions,
      ].slice(0, 200),
    };
  }
  return { player: next, unlocked };
}
export function settlePlayer(p: Player, result: Result): Player {
  const pending = p.pending.find((r) => r.id === result.id);
  if (!pending || !Number.isFinite(result.payout)) return p;
  const payout = Math.max(0, Math.floor(result.payout));
  const win = payout > pending.bet,
    streak = win ? p.streak + 1 : 0;
  return {
    ...p,
    balance: p.balance + payout,
    pending: p.pending.filter((r) => r.id !== result.id),
    xp: p.xp + 25 + (win ? 15 : 0),
    gamesPlayed: p.gamesPlayed + 1,
    totalWon: p.totalWon + payout,
    biggestWin: Math.max(p.biggestWin, payout),
    wins: p.wins + (win ? 1 : 0),
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    results: [
      { ...result, game: pending.game, bet: pending.bet, payout },
      ...p.results,
    ].slice(0, 500),
    transactions: [
      {
        id: crypto.randomUUID(),
        time: Date.now(),
        amount: payout,
        label: `${pending.game}: ${result.detail}`,
      },
      ...p.transactions,
    ].slice(0, 200),
  };
}
