import type { GameInfo, GameId } from "../types";
export const GAMES: GameInfo[] = [
  { id: "poker", name: "VIDEO POKER", category: "Table games", tag: "HOLD YOUR HAND", color: "#aa93ff", description: "Five cards. One draw. Your call." },
  { id: "hilo", name: "HIGHER / LOWER", category: "Table games", tag: "READ THE NEXT CARD", color: "#58dfbc", description: "A high card? A low card? Make the call." },
  { id: "war", name: "CARD WAR", category: "Table games", tag: "WIN THE BATTLE", color: "#ff759b", description: "Your card against the void. Highest wins." },
  { id: "memory", name: "MEMORY MATCH", category: "Arcade", tag: "TRUST YOUR MEMORY", color: "#5cd5f5", description: "Sixteen tiles. Eight pairs. Stay sharp." },
  { id: "tictactoe", name: "TIC-TAC-TOE", category: "Arcade", tag: "THREE MAKES MAGIC", color: "#b66aff", description: "Take your square. Find your line." },
  { id: "rps", name: "ROCK PAPER SCISSORS", category: "Arcade", tag: "MAKE YOUR MOVE", color: "#ffb45c", description: "Three moves. One quick showdown." },
  { id: "codebreaker", name: "CODEBREAKER", category: "Arcade", tag: "CRACK THE CODE", color: "#7be4d0", description: "Follow the clues. Unlock the secret." },
  { id: "baccarat", name: "BACCARAT", category: "Table games", tag: "CLOSEST TO NINE", color: "#58dfbc", description: "Two hands. A race to nine." },
  { id: "wheel", name: "LUCKY WHEEL", category: "Arcade", tag: "SPIN YOUR FORTUNE", color: "#ffb45c", description: "Twelve pockets. A little golden luck." },
  { id: "scratch", name: "SCRATCH CARDS", category: "Arcade", tag: "REVEAL THE MAGIC", color: "#f093cf", description: "Uncover three symbols. Find a match." },
  {
    id: "dice", name: "DICE", category: "Arcade", tag: "SET YOUR ODDS",
    color: "#7be4d0", description: "Choose your target. Make your roll.",
  },
  {
    id: "keno", name: "KENO", category: "Table games", tag: "PICK YOUR SIX",
    color: "#f093cf", description: "Six picks. Ten numbers. Find your match.",
  },
  {
    id: "coinflip", name: "COIN FLIP", category: "Arcade", tag: "A LITTLE LUCK",
    color: "#ffce62", description: "Pick a side. Let fate flip.",
  },
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
