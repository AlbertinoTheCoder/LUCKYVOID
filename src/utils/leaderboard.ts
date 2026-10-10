import type { Player } from "../types";
export type LeaderboardMetric = "balance" | "gamesPlayed" | "biggestWin" | "xp";
export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  gamesPlayed: number;
  biggestWin: number;
  xp: number;
  demo: boolean;
}
export interface LeaderboardSource {
  entries(player: Player): LeaderboardEntry[];
}
const DEMOS = [
  {
    name: "Cosmic Fox",
    avatar: "🦊",
    balance: 85420,
    gamesPlayed: 428,
    biggestWin: 18500,
    xp: 28100,
  },
  {
    name: "Luna Blue",
    avatar: "🌙",
    balance: 62380,
    gamesPlayed: 312,
    biggestWin: 25000,
    xp: 19400,
  },
  {
    name: "Pixel Panda",
    avatar: "🐼",
    balance: 41890,
    gamesPlayed: 256,
    biggestWin: 12750,
    xp: 15300,
  },
  {
    name: "Orbit Kid",
    avatar: "🪐",
    balance: 28940,
    gamesPlayed: 180,
    biggestWin: 10000,
    xp: 10600,
  },
  {
    name: "Neon Ninja",
    avatar: "🥷",
    balance: 18200,
    gamesPlayed: 96,
    biggestWin: 8500,
    xp: 6200,
  },
  {
    name: "Lucky Clover",
    avatar: "🍀",
    balance: 12450,
    gamesPlayed: 63,
    biggestWin: 4200,
    xp: 3200,
  },
];

// Replace this source with a backend adapter when multiplayer is introduced.
export const localLeaderboard: LeaderboardSource = {
  entries(player) {
    return [
      ...DEMOS.map((p, i) => ({ ...p, id: "demo" + i, demo: true })),
      {
        name: player.username,
        avatar: player.avatar,
        balance: player.balance,
        gamesPlayed: player.gamesPlayed,
        biggestWin: player.biggestWin,
        xp: player.xp,
        id: "you",
        demo: false,
      },
    ];
  },
};
