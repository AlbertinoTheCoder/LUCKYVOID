import { GAMES } from "./games";
import type { GameId, Page } from "../types";

export interface Route {
  page: Page;
  game: GameId | null;
}
const pages: Page[] = [
  "lobby",
  "games",
  "rewards",
  "leaderboard",
  "profile",
  "settings",
  "history",
];
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");
  const game = GAMES.find((g) => path === `games/${g.id}`);
  if (game) return { page: "games", game: game.id };
  return {
    page: pages.includes(path as Page) ? (path as Page) : "lobby",
    game: null,
  };
}
export const routeHash = ({ page, game }: Route) =>
  `#/${game ? `games/${game}` : page}`;
