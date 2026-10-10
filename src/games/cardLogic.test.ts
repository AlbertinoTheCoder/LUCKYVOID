import { describe, it, expect } from "vitest";
import { pokerDeck, pokerResult, highLowChance, highLowMultiplier, rpsOutcome, ticTacToeResult, TTT_LINES } from "./cardLogic";
const hand = (ranks: number[], flush = false) => ranks.map((rank,n) => ({rank,suit:flush ? 0 : n%4}));
describe("card and strategy games", () => {
  it("classifies poker hands including ace-low straights and high pairs", () => {
    const examples: [number[], boolean, number][] = [
      [[10,11,12,13,1],true,250], [[1,2,3,4,5],true,50], [[7,7,7,7,3],false,25],
      [[8,8,8,2,2],false,9], [[2,4,7,9,12],true,6], [[1,2,3,4,5],false,4],
      [[7,8,9,10,11],false,4], [[4,4,4,6,9],false,3], [[2,2,7,7,9],false,2],
      [[11,11,2,7,9],false,1], [[1,1,2,7,9],false,1], [[10,10,2,7,9],false,0], [[2,4,7,9,12],false,0],
    ];
    for (const [ranks,flush,mult] of examples) expect(pokerResult(hand(ranks,flush)).multiplier).toBe(mult);
    for (let n=0;n<20;n++) {
      const deck=pokerDeck();
      expect(deck).toHaveLength(52);
      expect(new Set(deck.map(c=>`${c.rank}:${c.suit}`)).size).toBe(52);
    }
  });
  it("enumerates higher/lower odds, ties and impossible choices", () => {
    for (let rank=2;rank<=14;rank++) for (const side of ["higher","lower"] as const) {
      const wins=Array.from({length:13},(_,n)=>n+2).filter(next=>side === "higher" ? next>rank : next<rank).length;
      expect(highLowChance(rank,side)).toBe(wins/13);
      expect(wins/13*highLowMultiplier(rank,side)).toBeLessThanOrEqual(0.97+1e-12);
    }
    expect(highLowMultiplier(2,"lower")).toBe(0);
    expect(highLowMultiplier(14,"higher")).toBe(0);
  });
  it("covers each gesture matchup and every tic-tac-toe winning line", () => {
    for (const choice of ["rock","paper","scissors"] as const) {
      expect(["rock","paper","scissors"].map(opponent=>rpsOutcome(choice,opponent as typeof choice)).sort()).toEqual(["draw","loss","win"]);
    }
    for (const line of TTT_LINES) for (const side of ["X","O"]) {
      const board=Array(9).fill("");for(const n of line)board[n]=side;
      expect(ticTacToeResult(board)).toBe(side);
    }
    expect(ticTacToeResult(["X","O","X","X","O","O","O","X","X"])).toBe("draw");
    expect(ticTacToeResult(Array(9).fill(""))).toBeNull();
  });
});
