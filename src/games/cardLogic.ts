import { randomInt, shuffle } from "./logic";
export interface PokerCard { rank: number; suit: number }
export const SUITS = ["♠", "♥", "♣", "♦"];
export function pokerDeck() {
  return shuffle(Array.from({ length: 52 }, (_, n) => ({ rank: n % 13 + 1, suit: Math.floor(n / 13) })));
}
export const POKER_PAY = [
  { name: "Royal flush", multiplier: 250 },
  { name: "Straight flush", multiplier: 50 },
  { name: "Four of a kind", multiplier: 25 },
  { name: "Full house", multiplier: 9 },
  { name: "Flush", multiplier: 6 },
  { name: "Straight", multiplier: 4 },
  { name: "Three of a kind", multiplier: 3 },
  { name: "Two pair", multiplier: 2 },
  { name: "Jacks or better", multiplier: 1 },
];
export function pokerResult(hand: PokerCard[]) {
  const ranks = hand.map(c => c.rank === 1 ? 14 : c.rank).sort((a,b) => a-b);
  const counts = new Map<number, number>();
  for (const rank of ranks) counts.set(rank, (counts.get(rank) ?? 0) + 1);
  const groups = [...counts.values()].sort((a,b) => b-a);
  const flush = hand.every(c => c.suit === hand[0].suit);
  const straight = counts.size === 5 && (ranks[4] - ranks[0] === 4 || ranks.join(",") === "2,3,4,5,14");
  const index = flush && straight ? ranks[0] === 10 ? 0 : 1 : groups[0] === 4 ? 2 : groups[0] === 3 && groups[1] === 2 ? 3 : flush ? 4 : straight ? 5 : groups[0] === 3 ? 6 : groups[0] === 2 && groups[1] === 2 ? 7 : [...counts].some(([rank, count]) => count === 2 && rank >= 11) ? 8 : -1;
  return index < 0 ? { name: "No winning hand", multiplier: 0 } : POKER_PAY[index];
}
export const pokerLabel = (rank: number) => rank === 1 ? "A" : rank === 11 ? "J" : rank === 12 ? "Q" : rank === 13 ? "K" : String(rank);
export function highLowChance(rank: number, direction: "higher" | "lower") {
  return (direction === "higher" ? 14 - rank : rank - 2) / 13;
}
export function highLowMultiplier(rank: number, direction: "higher" | "lower") {
  const p = highLowChance(rank, direction);
  return p ? Math.floor(0.97 / p * 100) / 100 : 0;
}
export const nextHighLowCard = () => randomInt(13) + 2;
export type Gesture = "rock" | "paper" | "scissors";
export function rpsOutcome(choice: Gesture, opponent: Gesture) {
  if (choice === opponent) return "draw";
  return ({ rock: "scissors", paper: "rock", scissors: "paper" }[choice] === opponent) ? "win" : "loss";
}
export const TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function ticTacToeResult(board: string[]) {
  for (const line of TTT_LINES) if (board[line[0]] && line.every(n => board[n] === board[line[0]])) return board[line[0]];
  return board.every(Boolean) ? "draw" : null;
}
