import type { GameInfo, GameId } from "../types";
export const GAMES: GameInfo[] = [
  {
    id: "neon",
    name: "NEON 777",
    category: "Slots",
    tag: "FAN FAVORITE",
    color: "#b66aff",
    description: "Classic reels. Electric possibilities.",
  },
  {
    id: "blackjack",
    name: "BLACKJACK",
    category: "Table games",
    tag: "PLAY YOUR CARDS",
    color: "#58dfbc",
    description: "A little strategy. A perfect 21.",
  },
  {
    id: "roulette",
    name: "ROULETTE",
    category: "Table games",
    tag: "TAKE A SPIN",
    color: "#ff759b",
    description: "One wheel. 37 possibilities.",
  },
  {
    id: "crash",
    name: "CRASH",
    category: "Arcade",
    tag: "TO THE MOON",
    color: "#aa93ff",
    description: "How high will you fly?",
  },
  {
    id: "mines",
    name: "MINES",
    category: "Arcade",
    tag: "FIND YOUR FORTUNE",
    color: "#5cd5f5",
    description: "Unearth gems. Trust your instincts.",
  },
  {
    id: "plinko",
    name: "PLINKO",
    category: "Arcade",
    tag: "LET IT DROP",
    color: "#ffb45c",
    description: "A thousand bounces. One destination.",
  },
  {
    id: "void",
    name: "VOID SPINS",
    category: "Slots",
    tag: "BEYOND THE REELS",
    color: "#828bff",
    description: "Five reels from another dimension.",
  },
  {
    id: "gold",
    name: "GOLD RUSH",
    category: "Slots",
    tag: "STRIKE GOLD",
    color: "#ffce62",
    description: "There’s gold in these reels.",
  },
];
export const gameById = (id: GameId) => GAMES.find((g) => g.id === id)!;
export const coins = (n: number) => Math.floor(n).toLocaleString("en-US");
export const level = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
export const dailyDate = () => new Date().toISOString().slice(0, 10);
