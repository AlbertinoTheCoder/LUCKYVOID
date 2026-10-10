import { useState } from "react";
import { Dices, Coins, Grid3X3 } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { t } from "../utils/i18n";
import { randomInt } from "./logic";
import { diceWins, diceMultiplier, kenoDraw, KENO_PAY, kenoProbability, type DiceSide } from "./quickLogic";

export function Dice() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100);
  const [target, setTarget] = useState(50);
  const [side, setSide] = useState<DiceSide>("under");
  const [roll, setRoll] = useState<number | null>(null);
  const [payout, setPayout] = useState(0);
  const multiplier = diceMultiplier(target, side);
  const chance = side === "under" ? target : 100 - target;
  const play = () => {
    const id = reserve("dice", bet);
    if (!id) return;
    const value = randomInt(100);
    const pay = diceWins(value, target, side) ? Math.floor(bet * multiplier) : 0;
    settle(id, pay, `Dice · ${value} · ${side} ${target}`, { multiplier: pay ? multiplier : 0 });
    setRoll(value); setPayout(pay);
  };
  return <>
    <div className="quick-stage dice-stage"><Dices size={40} /><strong>{roll === null ? "00–99" : String(roll).padStart(2, "0")}</strong><span>{t("Every roll is a fresh chance.")}</span></div>
    <div className="quick-options">{(["under", "over"] as const).map(value => <button key={value} className={`secondary ${side === value ? "selected" : ""}`} aria-pressed={side === value} onClick={() => setSide(value)}>{t(value === "under" ? "Roll under" : "Roll over or equal")}</button>)}</div>
    <label className="dice-target">{t("TARGET")} <b>{target}</b><input aria-label={t("Dice target")} type="range" min="5" max="95" value={target} onChange={e => setTarget(Number(e.target.value))} /></label>
    <div className="quick-stats"><span>{t("Win chance")} <b>{chance}%</b></span><span>{t("Payout multiplier")} <b>{multiplier.toFixed(2)}×</b></span></div>
    <ResultBanner text={roll === null ? "Choose a target and roll." : payout ? "Winning roll!" : "No win this roll. Try a fresh round."} payout={payout} />
    <div className="game-controls"><BetControl bet={bet} setBet={setBet} /><button className="primary game-action" onClick={play}><Dices size={18}/>{t("Roll dice")}</button></div>
    <Rules><p>{t("Roll an integer from 0 to 99, each equally likely. Under wins below the target; over or equal wins at or above it. The target ranges from 5 to 95.")}</p><p>{t("Payout = bet × multiplier. Multiplier = 0.97 ÷ win probability, rounded down to two decimals. Expected return is at most 97%.")}</p></Rules>
  </>;
}

export function CoinFlip() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState(0);
  const [face, setFace] = useState<number | null>(null);
  const [payout, setPayout] = useState(0);
  const play = () => {
    const id = reserve("coinflip", bet);
    if (!id) return;
    const value = randomInt(2), pay = value === choice ? Math.floor(bet * 1.94) : 0;
    settle(id, pay, `Coin Flip · ${value === 0 ? "Heads" : "Tails"}`, { multiplier: pay ? 1.94 : 0 });
    setFace(value); setPayout(pay);
  };
  return <>
    <div className="quick-stage coin-stage"><div className="flip-coin">{face === null ? "✦" : face === 0 ? "☀" : "☾"}</div><strong>{t(face === null ? "COIN FLIP" : face === 0 ? "Heads" : "Tails")}</strong><span>{t("One coin. Two possibilities.")}</span></div>
    <div className="quick-options">{["Heads", "Tails"].map((name, index) => <button className={`secondary ${choice === index ? "selected" : ""}`} key={name} aria-pressed={choice === index} onClick={() => setChoice(index)}>{t(name)}</button>)}</div>
    <div className="quick-stats"><span>{t("Win chance")} <b>50%</b></span><span>{t("Payout multiplier")} <b>1.94×</b></span></div>
    <ResultBanner text={face === null ? "Pick a side and flip." : payout ? "Your side wins!" : "The other side landed. A new flip awaits."} payout={payout}/>
    <div className="game-controls"><BetControl bet={bet} setBet={setBet}/><button className="primary gold game-action" onClick={play}><Coins size={18}/>{t("Flip coin")}</button></div>
    <Rules><p>{t("Heads and tails each have a 50% chance. A matching side pays 1.94× your bet, including the original bet; a miss pays zero. Expected return is 97% before whole-coin rounding. Each flip is independent.")}</p></Rules>
  </>;
}

export function Keno() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100);
  const [selected, setSelected] = useState<number[]>([]);
  const [draw, setDraw] = useState<number[]>([]);
  const [hits, setHits] = useState<number | null>(null);
  const [payout, setPayout] = useState(0);
  const toggle = (n: number) => {
    setSelected(values => values.includes(n) ? values.filter(v => v !== n) : values.length < 6 ? [...values, n] : values);
    setDraw([]); setHits(null); setPayout(0);
  };
  const play = () => {
    if (selected.length !== 6) return;
    const id = reserve("keno", bet);
    if (!id) return;
    const numbers = kenoDraw(), matches = selected.filter(n => numbers.includes(n)).length;
    const pay = Math.floor(bet * KENO_PAY[matches]);
    settle(id, pay, `Keno · ${matches}/6`, { hits: matches, multiplier: KENO_PAY[matches] });
    setDraw(numbers); setHits(matches); setPayout(pay);
  };
  return <>
    <div className="keno-heading"><Grid3X3 size={24}/><strong>{t("Pick six numbers")}</strong><span>{selected.length}/6</span></div>
    <div className="keno-grid">{Array.from({ length: 40 }, (_, i) => i + 1).map(n => <button key={n} aria-label={`${t("Number")} ${n}`} aria-pressed={selected.includes(n)} disabled={selected.length === 6 && !selected.includes(n)} className={`${selected.includes(n) ? "chosen" : ""} ${draw.includes(n) ? "drawn" : ""} ${selected.includes(n) && draw.includes(n) ? "matched" : ""}`} onClick={() => toggle(n)}>{n}</button>)}</div>
    <div className="quick-options"><button className="secondary" onClick={() => { setSelected(kenoDraw().slice(0, 6)); setDraw([]); setHits(null); setPayout(0); }}>{t("Quick pick")}</button><button className="secondary" onClick={() => { setSelected([]); setDraw([]); setHits(null); setPayout(0); }}>{t("Clear picks")}</button></div>
    <div className="keno-paytable">{KENO_PAY.map((mult, n) => <div className={hits === n ? "selected" : ""} key={n}><span>{n}/6</span><b>{mult}×</b></div>)}</div>
    <ResultBanner text={hits === null ? "Ten numbers drawn. How many will match?" : hits >= 3 ? "Three or more matches!" : "Fewer than three matches. No payout this round."} payout={payout}/>
    <div className="game-controls"><BetControl bet={bet} setBet={setBet}/><button className="primary game-action" disabled={selected.length !== 6} onClick={play}><Grid3X3 size={18}/>{t("Draw numbers")}</button></div>
    <Rules><p>{t("Choose exactly six numbers from 1 to 40. Ten unique numbers are drawn uniformly each round. Match 3, 4, 5 or 6 to receive 4×, 12×, 70× or 500× your bet. Fewer matches pay zero. Gold tiles show matches; outlined tiles show other drawn numbers.")}</p><p>{t("Chance of k matches = C(6,k) × C(34,10−k) ÷ C(40,10). Expected return:")} {(KENO_PAY.reduce((sum, mult, n) => sum + mult * kenoProbability(n), 0) * 100).toFixed(2)}%.</p></Rules>
  </>;
}
