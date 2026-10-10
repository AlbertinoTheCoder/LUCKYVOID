export type GameId =
  | "neon"
  | "void"
  | "gold"
  | "blackjack"
  | "roulette"
  | "crash"
  | "mines"
  | "plinko"
  | "dice"
  | "keno"
  | "coinflip"
  | "baccarat"
  | "wheel"
  | "scratch"
  | "poker"
  | "hilo"
  | "war"
  | "rps"
  | "memory"
  | "tictactoe"
  | "codebreaker";
export type Page =
  | "lobby"
  | "games"
  | "rewards"
  | "leaderboard"
  | "profile"
  | "settings"
  | "history";
export interface GameInfo {
  id: GameId;
  name: string;
  category: "Slots" | "Table games" | "Arcade";
  tag: string;
  color: string;
  description: string;
}
export interface Result {
  id: string;
  game: GameId;
  bet: number;
  payout: number;
  detail: string;
  time: number;
  meta?: Record<string, number>;
}
export interface Transaction {
  id: string;
  time: number;
  amount: number;
  label: string;
}
export interface Settings {
  language: "en" | "it";
  sound: boolean;
  music: boolean;
  reducedMotion: boolean;
  quality: "high" | "low";
}
export interface Pending {
  id: string;
  game: GameId;
  bet: number;
}
export interface Player {
  version: 1;
  username: string;
  avatar: string;
  balance: number;
  xp: number;
  gamesPlayed: number;
  totalWon: number;
  biggestWin: number;
  wins: number;
  streak: number;
  bestStreak: number;
  dailyClaims: number;
  lastDaily: string;
  favorites: GameId[];
  achievements: string[];
  results: Result[];
  transactions: Transaction[];
  pending: Pending[];
  settings: Settings;
}
