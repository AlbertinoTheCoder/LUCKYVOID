import type { Player, GameId } from "../types";
export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  test: (p: Player) => boolean;
  icon: string;
}
const played = (p: Player, id: GameId) => p.results.some((r) => r.game === id);
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first",
    name: "First Spin",
    description: "Play your first slot round",
    reward: 100,
    icon: "🎰",
    test: (p) =>
      p.results.some((r) => ["neon", "gold", "void"].includes(r.game)),
  },
  {
    id: "seven",
    name: "Lucky Seven",
    description: "Match three or more sevens",
    reward: 777,
    icon: "7️⃣",
    test: (p) => p.results.some((r) => r.meta?.sevens === 1),
  },
  {
    id: "blackjack",
    name: "Blackjack Rookie",
    description: "Play a hand of blackjack",
    reward: 100,
    icon: "♠️",
    test: (p) => played(p, "blackjack"),
  },
  {
    id: "natural",
    name: "Blackjack Master",
    description: "Be dealt a natural blackjack",
    reward: 500,
    icon: "🃏",
    test: (p) => p.results.some((r) => r.meta?.natural === 1),
  },
  {
    id: "roulette",
    name: "Roulette Rookie",
    description: "Take a spin at roulette",
    reward: 100,
    icon: "🎡",
    test: (p) => played(p, "roulette"),
  },
  {
    id: "number",
    name: "On the Nose",
    description: "Win on a single roulette number",
    reward: 500,
    icon: "🎯",
    test: (p) => p.results.some((r) => r.meta?.straightWin === 1),
  },
  {
    id: "crash",
    name: "Lift Off",
    description: "Play your first crash round",
    reward: 100,
    icon: "🚀",
    test: (p) => played(p, "crash"),
  },
  {
    id: "moon",
    name: "Moon Walker",
    description: "Collect at 5× or higher in crash",
    reward: 500,
    icon: "🌙",
    test: (p) =>
      p.results.some(
        (r) => r.game === "crash" && (r.meta?.multiplier ?? 0) >= 5,
      ),
  },
  {
    id: "mines",
    name: "Mine Explorer",
    description: "Explore your first minefield",
    reward: 100,
    icon: "💎",
    test: (p) => played(p, "mines"),
  },
  {
    id: "miner",
    name: "Gem Collector",
    description: "Collect after revealing 5 safe tiles",
    reward: 300,
    icon: "⛏️",
    test: (p) =>
      p.results.some(
        (r) =>
          r.game === "mines" && r.payout > 0 && (r.meta?.revealed ?? 0) >= 5,
      ),
  },
  {
    id: "plinko",
    name: "First Drop",
    description: "Drop your first Plinko ball",
    reward: 100,
    icon: "🟠",
    test: (p) => played(p, "plinko"),
  },
  {
    id: "champion",
    name: "Plinko Champion",
    description: "Win 10× or more in Plinko",
    reward: 500,
    icon: "🏅",
    test: (p) =>
      p.results.some(
        (r) => r.game === "plinko" && (r.meta?.multiplier ?? 0) >= 10,
      ),
  },
  {
    id: "ten",
    name: "Getting Started",
    description: "Complete 10 rounds",
    reward: 200,
    icon: "✨",
    test: (p) => p.gamesPlayed >= 10,
  },
  {
    id: "fifty",
    name: "Regular Visitor",
    description: "Complete 50 rounds",
    reward: 500,
    icon: "🎟️",
    test: (p) => p.gamesPlayed >= 50,
  },
  {
    id: "hundred",
    name: "Century Club",
    description: "Complete 100 rounds",
    reward: 1000,
    icon: "💯",
    test: (p) => p.gamesPlayed >= 100,
  },
  {
    id: "thousand",
    name: "Arcade Legend",
    description: "Complete 1,000 rounds",
    reward: 5000,
    icon: "👑",
    test: (p) => p.gamesPlayed >= 1000,
  },
  {
    id: "win",
    name: "A Little Luck",
    description: "Win more than your bet",
    reward: 100,
    icon: "🍀",
    test: (p) => p.wins >= 1,
  },
  {
    id: "streak",
    name: "Hot Hand",
    description: "Win 3 rounds in a row",
    reward: 300,
    icon: "🔥",
    test: (p) => p.bestStreak >= 3,
  },
  {
    id: "big",
    name: "Big Moment",
    description: "Receive 5,000 coins in one round",
    reward: 500,
    icon: "💰",
    test: (p) => p.biggestWin >= 5000,
  },
  {
    id: "million",
    name: "Million Coin Club",
    description: "Reach a balance of 1,000,000 coins",
    reward: 10000,
    icon: "🪙",
    test: (p) => p.balance >= 1000000,
  },
  {
    id: "daily",
    name: "A New Day",
    description: "Claim a daily reward",
    reward: 100,
    icon: "🌅",
    test: (p) => p.dailyClaims >= 1,
  },
  {
    id: "week",
    name: "Seven Good Days",
    description: "Claim 7 daily rewards",
    reward: 1000,
    icon: "📅",
    test: (p) => p.dailyClaims >= 7,
  },
  {
    id: "level",
    name: "Level Up",
    description: "Reach player level 5",
    reward: 500,
    icon: "⚡",
    test: (p) => p.xp >= 1600,
  },
  {
    id: "all",
    name: "Into the Void",
    description: "Try all 8 games",
    reward: 1000,
    icon: "🪐",
    test: (p) => new Set(p.results.map((r) => r.game)).size === 8,
  },
];
