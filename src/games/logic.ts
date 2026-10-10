// Unbiased browser entropy. All outcomes are sampled before their animation.
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max < 1) throw Error("Invalid random range");
  const limit = Math.floor(4294967296 / max) * max;
  const a = new Uint32Array(1);
  do {
    crypto.getRandomValues(a);
  } while (a[0] >= limit);
  return a[0] % max;
}
export const random = () => randomInt(16777216) / 16777216;
export const SYMBOLS = ["🍒", "🍋", "🔔", "💎", "⭐", "7"];
export const SLOT_PAY = [5, 8, 12, 20, 30, 50];
export function slotPayout(reels: number[], five = false): number {
  if (five) {
    let n = 1;
    while (n < reels.length && reels[n] === reels[0]) n++;
    return n === 5 ? 250 : n === 4 ? 72 : n === 3 ? 18 : 0;
  }
  return reels.every((r) => r === reels[0])
    ? SLOT_PAY[reels[0]]
    : reels[0] === reels[1] || reels[1] === reels[2]
      ? 1
      : 0;
}
export const rouletteNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
export const RED = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
export type RouletteBet =
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"
  | "dozen1"
  | "dozen2"
  | "dozen3"
  | number;
export function roulettePayout(bet: RouletteBet, n: number): number {
  if (typeof bet === "number") return n === bet ? 36 : 0;
  if (n === 0) return 0;
  const win =
    bet === "red"
      ? RED.has(n)
      : bet === "black"
        ? !RED.has(n)
        : bet === "odd"
          ? n % 2 === 1
          : bet === "even"
            ? n % 2 === 0
            : bet === "low"
              ? n <= 18
              : bet === "high"
                ? n >= 19
                : bet === "dozen1"
                  ? n <= 12
                  : bet === "dozen2"
                    ? n >= 13 && n <= 24
                    : n >= 25;
  return win ? (bet.startsWith("dozen") ? 3 : 2) : 0;
}
export function minesMultiplier(mines: number, revealed: number): number {
  let p = 1;
  for (let i = 0; i < revealed; i++) p *= (25 - mines - i) / (25 - i);
  return revealed ? Math.floor((0.97 / p) * 100) / 100 : 1;
}
export function sampleMines(count: number): number[] {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  return shuffle(cells).slice(0, count);
}
// Keep the stop point continuous: quantizing it would inflate the instant-stop probability.
export function crashFromUniform(u: number): number {
  if (u < 0 || u >= 1 || !Number.isFinite(u))
    throw new Error("Invalid random sample");
  return Math.min(1000, Math.max(1, 0.97 / (1 - u)));
}
export function crashPoint(): number {
  return crashFromUniform(random());
}
export function shuffle<T>(values: T[]): T[] {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export type Risk = "low" | "medium" | "high";
export function binomial(n: number, k: number): number {
  let p = 1;
  for (let i = 1; i <= k; i++) p *= (n + 1 - i) / i;
  return p;
}
export function plinkoMultipliers(risk: Risk): number[] {
  const base =
    risk === "low"
      ? [5, 2, 1.4, 1.1, 0.8, 1.1, 1.4, 2, 5]
      : risk === "medium"
        ? [20, 5, 2, 0.7, 0.3, 0.7, 2, 5, 20]
        : [100, 10, 2, 0.3, 0.1, 0.3, 2, 10, 100];
  const ev = base.reduce((v, p, i) => v + (p * binomial(8, i)) / 256, 0);
  return base.map((p) => Math.floor(((p * 0.96) / ev) * 100) / 100);
}
export function plinkoPath(): number[] {
  return Array.from({ length: 8 }, () => randomInt(2));
}
export interface Card {
  rank: number;
  suit: string;
}
export function makeDeck(): Card[] {
  return shuffle(
    Array.from({ length: 6 }, () =>
      ["♠", "♥", "♣", "♦"].flatMap((suit) =>
        Array.from({ length: 13 }, (_, i) => ({ rank: i + 1, suit })),
      ),
    ).flat(),
  );
}
export function handValue(cards: Card[]): number {
  let v = cards.reduce((s, c) => s + Math.min(c.rank, 10), 0);
  let aces = cards.filter((c) => c.rank === 1).length;
  while (aces-- > 0 && v + 10 <= 21) v += 10;
  return v;
}
export const cardLabel = (c: Card) =>
  c.rank === 1
    ? "A"
    : c.rank === 11
      ? "J"
      : c.rank === 12
        ? "Q"
        : c.rank === 13
          ? "K"
          : String(c.rank);
export function blackjackReturn(
  cards: Card[],
  dealer: Card[],
  bet: number,
  natural: boolean,
): number {
  const p = handValue(cards),
    d = handValue(dealer);
  if (p > 21) return 0;
  const dn = dealer.length === 2 && d === 21;
  if (natural && p === 21 && cards.length === 2) return dn ? bet : bet * 2.5;
  if (dn) return 0;
  return d > 21 || p > d ? bet * 2 : p === d ? bet : 0;
}
