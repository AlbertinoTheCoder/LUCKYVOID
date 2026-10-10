import { useState } from "react";
import { CircleDollarSign, RotateCw, Sparkles } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { t } from "../utils/i18n";
import { randomInt } from "./logic";
import { baccaratRound, baccaratMultiplier, WHEEL_PAY, SCRATCH_SYMBOLS, scratchMultiplier, type BaccaratBet } from "./moreLogic";

export function Baccarat() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100), [choice, setChoice] = useState<BaccaratBet>("player");
  const [round, setRound] = useState<ReturnType<typeof baccaratRound> | null>(null), [payout, setPayout] = useState(0);
  const play = () => {
    const id = reserve("baccarat", bet); if (!id) return;
    const result = baccaratRound(), mult = baccaratMultiplier(choice, result.winner), pay = Math.floor(bet * mult);
    settle(id, pay, `Baccarat · ${result.playerTotal}:${result.bankerTotal} · ${result.winner}`, { multiplier: mult });
    setRound(result); setPayout(pay);
  };
  return <>
    <div className="baccarat-table">{(["player", "banker"] as const).map(side => <div key={side}><h3>{t(side === "player" ? "Player hand" : "Banker hand")}</h3><div className="baccarat-cards">{(round?.[side] ?? [null, null]).map((n, i) => <span key={i}>{n === null ? "✦" : n === 0 ? "10/J/Q/K" : n}</span>)}</div><strong>{round ? round[side === "player" ? "playerTotal" : "bankerTotal"] : "—"}</strong></div>)}</div>
    <div className="quick-options">{(["player", "banker", "tie"] as const).map(side => <button key={side} className={`secondary ${choice === side ? "selected" : ""}`} aria-pressed={choice === side} onClick={() => setChoice(side)}>{t(side === "player" ? "Player" : side === "banker" ? "Banker" : "Tie")} · {side === "player" ? "2" : side === "banker" ? "1.95" : "9"}×</button>)}</div>
    <ResultBanner text={!round ? "Choose a hand. Closest to nine wins." : round.winner === "tie" ? "The hands tie." : round.winner === "player" ? "Player hand wins." : "Banker hand wins."} payout={payout}/>
    <div className="game-controls"><BetControl bet={bet} setBet={setBet}/><button className="primary game-action" onClick={play}><CircleDollarSign size={18}/>{t("Deal baccarat")}</button></div>
    <Rules><p>{t("Cards are drawn independently with replacement from 13 ranks. Aces count 1, ranks 2–9 count their value, and 10/J/Q/K count 0. Zero has probability 4/13; each other value has probability 1/13. Hand totals use the last digit. Natural 8 or 9 stops drawing; otherwise Player draws on 0–5. If Player stands, Banker draws on 0–5. If Player draws, Banker draws on 0–2; on 3 except against 8; on 4 against 2–7; on 5 against 4–7; on 6 against 6–7; and stands on 7.")}</p><p>{t("Player pays 2×, Banker 1.95×, Tie 9×, including your bet. A tie refunds Player and Banker bets. Banker winnings have a 5% commission. The Tie bet wins only when both totals match.")}</p></Rules>
  </>;
}

export function LuckyWheel() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100), [landed, setLanded] = useState<number | null>(null), [payout, setPayout] = useState(0);
  const play = () => {
    const id = reserve("wheel", bet); if (!id) return;
    const pocket = randomInt(WHEEL_PAY.length), pay = Math.floor(bet * WHEEL_PAY[pocket]);
    settle(id, pay, `Lucky Wheel · ${WHEEL_PAY[pocket]}×`, { multiplier: WHEEL_PAY[pocket] });
    setLanded(pocket); setPayout(pay);
  };
  return <>
    <div className="quick-stage lucky-wheel-stage"><div className="lucky-wheel"><span>{landed === null ? "✦" : `${WHEEL_PAY[landed]}×`}</span></div><strong>{t("LUCKY WHEEL")}</strong></div>
    <div className="wheel-paytable">{WHEEL_PAY.map((mult, index) => <span className={landed === index ? "selected" : ""} key={index}>{mult}×</span>)}</div>
    <ResultBanner text={landed === null ? "Twelve pockets. One lucky spin." : payout > bet ? "A winning pocket!" : payout ? "Your bet returns." : "An empty pocket. A fresh spin awaits."} payout={payout}/>
    <div className="game-controls"><BetControl bet={bet} setBet={setBet}/><button className="primary gold game-action" onClick={play}><RotateCw size={18}/>{t("Spin lucky wheel")}</button></div>
    <Rules><p>{t("All twelve pockets are equally likely. Six pay 0×, three pay 1×, and one each pays 2×, 3× and 3.5×. Payout includes your original bet. Expected return is 95.83% before whole-coin rounding. The highlight shows the sampled pocket.")}</p></Rules>
  </>;
}

export function ScratchCards() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100), [symbols, setSymbols] = useState<number[]>([]), [revealed, setRevealed] = useState<number[]>([]), [payout, setPayout] = useState(0);
  const [played, setPlayed] = useState(false);
  const buy = () => {
    if (symbols.length && revealed.length < 3) return;
    const id = reserve("scratch", bet); if (!id) return;
    const values = Array.from({ length: 3 }, () => randomInt(4)), mult = scratchMultiplier(values), pay = Math.floor(bet * mult);
    // Settle immediately so leaving a paid card cannot refund or reroll it.
    settle(id, pay, `Scratch Cards · ${mult}×`, { multiplier: mult });
    setSymbols(values); setRevealed([]); setPayout(pay); setPlayed(true);
  };
  const reveal = (index: number) => setRevealed(values => values.includes(index) ? values : [...values, index]);
  const active = symbols.length > 0 && revealed.length < 3;
  return <>
    <div className="scratch-heading"><Sparkles size={24}/><strong>{t("Match three. Reveal a little magic.")}</strong></div>
    <div className="scratch-tiles">{Array.from({ length: 3 }, (_, index) => <button key={index} disabled={!symbols.length || revealed.includes(index)} onClick={() => reveal(index)} aria-label={`${t("Reveal panel")} ${index + 1}`} className={revealed.includes(index) ? "revealed" : ""}>{revealed.includes(index) ? SCRATCH_SYMBOLS[symbols[index]] : "✦"}<small>{t(revealed.includes(index) ? "Revealed" : "Tap to reveal")}</small></button>)}</div>
    <div className="scratch-paytable">{SCRATCH_SYMBOLS.map((symbol, index) => <span key={symbol}>{symbol} {symbol} {symbol}<b>{[4, 8, 16, 32][index]}×</b></span>)}</div>
    <ResultBanner text={!played ? "Get a card to begin." : active ? "Tap each panel to reveal your symbols." : payout ? "Three matching symbols!" : "No match on this card. A new card awaits."} payout={active ? 0 : payout}/>
    <div className="game-controls"><BetControl bet={bet} setBet={setBet} disabled={active}/>{active ? <button className="primary game-action" onClick={() => setRevealed([0, 1, 2])}>{t("Reveal all")}</button> : <button className="primary game-action" onClick={buy}><Sparkles size={18}/>{t("Get scratch card")}</button>}</div>
    <Rules><p>{t("Three symbols are sampled independently from four equally likely symbols. Three suns pay 4×, moons 8×, stars 16× and diamonds 32×. Any other combination pays zero. Each matching triple has a 1 in 64 chance; total win chance is 6.25%. Expected return is 93.75%.")}</p><p>{t("The card is paid and its result saved when you get it. Revealing panels displays that fixed result; leaving the page does not refund the card. Payouts include the original bet.")}</p></Rules>
  </>;
}
