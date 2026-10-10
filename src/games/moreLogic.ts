import { randomInt } from "./logic";
export type BaccaratBet = "player" | "banker" | "tie";
export function baccaratRound(draw: () => number = () => Math.min(randomInt(13) + 1, 10) % 10) {
  const player = [draw(), draw()], banker = [draw(), draw()];
  const total = (cards: number[]) => cards.reduce((a, b) => a + b, 0) % 10;
  if (total(player) < 8 && total(banker) < 8) {
    const playerThird = total(player) <= 5 ? draw() : null;
    if (playerThird !== null) player.push(playerThird);
    const b = total(banker);
    const bankerDraws = playerThird === null ? b <= 5 : b <= 2 || b === 3 && playerThird !== 8 || b === 4 && playerThird >= 2 && playerThird <= 7 || b === 5 && playerThird >= 4 && playerThird <= 7 || b === 6 && playerThird >= 6 && playerThird <= 7;
    if (bankerDraws) banker.push(draw());
  }
  const playerTotal = total(player), bankerTotal = total(banker);
  const winner: BaccaratBet = playerTotal === bankerTotal ? "tie" : playerTotal > bankerTotal ? "player" : "banker";
  return { player, banker, playerTotal, bankerTotal, winner };
}
export function baccaratMultiplier(choice: BaccaratBet, winner: BaccaratBet) {
  if (choice === winner) return choice === "banker" ? 1.95 : choice === "tie" ? 9 : 2;
  return winner === "tie" && choice !== "tie" ? 1 : 0;
}
export const WHEEL_PAY = [0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 3.5];
export const SCRATCH_SYMBOLS = ["☀", "☾", "✦", "◆"];
export function scratchMultiplier(symbols: number[]) {
  return symbols.every(n => n === symbols[0]) ? [4, 8, 16, 32][symbols[0]] : 0;
}
