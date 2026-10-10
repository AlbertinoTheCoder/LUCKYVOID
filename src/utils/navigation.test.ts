import { describe, it, expect } from "vitest";
import { parseRoute, routeHash } from "./navigation";
import { GAMES } from "./games";

describe("page links", () => {
  it("restores every game from its link", () => {
    for (const game of GAMES) {
      const route = { page: "games" as const, game: game.id };
      expect(parseRoute(routeHash(route))).toEqual(route);
    }
  });
  it("restores player pages and falls back for invalid links", () => {
    expect(parseRoute("#/settings")).toEqual({ page: "settings", game: null });
    for (const hash of ["", "#/missing", "#/games/missing"])
      expect(parseRoute(hash)).toEqual({ page: "lobby", game: null });
  });
});
