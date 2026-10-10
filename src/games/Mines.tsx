import {t} from "../utils/i18n";
import { useState, useRef } from "react";
import { Diamond, Bomb } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { sampleMines, minesMultiplier } from "./logic";
export function Mines() {
  const { reserve, settle, sound } = usePlayer();
  const [bet, setBet] = useState(100),
    [count, setCount] = useState(3),
    [revealed, setRevealed] = useState<number[]>([]),
    [mines, setMines] = useState<number[]>([]),
    [active, setActive] = useState(false),
    [finished, setFinished] = useState(false),
    [hit, setHit] = useState<number | null>(null),
    [payout, setPayout] = useState(0),
    [message, setMessage] = useState("Hidden gems. A little courage.");
  const run = useRef<{
    id: string;
    mines: number[];
    revealed: number[];
    bet: number;
    count: number;
  } | null>(null);
  const start = () => {
    if (run.current) return;
    const id = reserve("mines", bet);
    if (!id) return;
    const hidden = sampleMines(count);
    run.current = { id, mines: hidden, revealed: [], bet, count };
    setMines(hidden);
    setRevealed([]);
    setHit(null);
    setActive(true);
    setFinished(false);
    setPayout(0);
    setMessage("Tap a tile to uncover a gem.");
  };
  const collect = () => {
    const r = run.current;
    if (!r || !r.revealed.length) return;
    const mult = minesMultiplier(r.count, r.revealed.length),
      pay = Math.floor(r.bet * mult);
    settle(r.id, pay, `${r.revealed.length} gems · ${mult.toFixed(2)}×`, {
      revealed: r.revealed.length,
      multiplier: mult,
    });
    run.current = null;
    setActive(false);
    setFinished(true);
    setPayout(pay);
    setMessage(`Collected ${r.revealed.length} gems at ${mult.toFixed(2)}×.`);
  };
  const reveal = (n: number) => {
    const r = run.current;
    if (!r || r.revealed.includes(n)) return;
    if (r.mines.includes(n)) {
      setHit(n);
      run.current = null;
      setFinished(true);
      setActive(false);
      setMessage("A mine! This round has ended.");
      settle(r.id, 0, `Mine hit after ${r.revealed.length} gems`, {
        revealed: r.revealed.length,
      });
      return;
    }
    r.revealed.push(n);
    setRevealed([...r.revealed]);
    sound("card");
    if (r.revealed.length === 25 - r.count) collect();
    else
      setMessage(
        `${r.revealed.length} safe ${r.revealed.length === 1 ? "tile" : "tiles"} · collect or explore another.`,
      );
  };
  const m = minesMultiplier(count, revealed.length);
  return (
    <>
      <div className="mines-header">
        <span>
          <Diamond size={16} /> {t(25 - count)} {t("GEMS")}</span>
        <strong>
          {t(m.toFixed(2))}× <small>{t("CURRENT MULTIPLIER")}</small>
        </strong>
        <span>
          <Bomb size={16} /> {t(count)} {t("MINES")}</span>
      </div>
      <div className="mines-grid">
        {t(Array.from({ length: 25 }, (_, i) => {
          const gem = revealed.includes(i),
            bomb = finished && mines.includes(i);
          return (
            <button
              key={i}
              aria-label={t(`Tile ${i + 1}${gem ? ", gem" : bomb ? ", mine" : ""}`)}
              disabled={!active || gem}
              className={`${gem ? "revealed" : ""} ${bomb ? "mine" : ""} ${hit === i ? "hit" : ""}`}
              onClick={() => reveal(i)}
            >
              {t(gem ? (
                <Diamond size={30} />
              ) : bomb ? (
                <Bomb size={27} />
              ) : (
                <span>✦</span>
              ))}
            </button>
          );
        }))}
      </div>
      <ResultBanner text={message} payout={payout} />
      <div className="mines-options">
        <label>
          {t("HIDDEN MINES")}{t(" ")}
          <select
            value={count}
            disabled={active}
            onChange={(e) => {
              setCount(Number(e.target.value));
              setRevealed([]);
              setFinished(false);
            }}
          >
            {[1, 3, 5, 10, 15, 24].map((n) => (
              <option key={n} value={n}>
                {t(n)} {t("mines")}</option>
            ))}
          </select>
        </label>
        <span>
          {t("Next gem:")}{t(" ")}
          <b>
            {t(revealed.length < 25 - count
              ? minesMultiplier(count, revealed.length + 1).toFixed(2)
              : m.toFixed(2))}
            ×
          </b>
        </span>
      </div>
      <div className="game-controls">
        <BetControl bet={bet} setBet={setBet} disabled={active} />
        {t(active ? (
          <button
            className="primary gold game-action"
            disabled={!revealed.length}
            onClick={collect}
          >
            {t("Collect ·")}{t(Math.floor(bet * m).toLocaleString())} {t("coins")}</button>
        ) : (
          <button className="primary game-action" onClick={start}>
            <Diamond size={18} />
            {t("Start exploring")}</button>
        ))}
      </div>
      <Rules>
        <p>
          {t("A uniformly random selection of")}{t(count)} {t("mines is hidden in 25 tiles. Each safe reveal increases the total payout. Collect after at least one reveal; a mine loses your bet. All safe tiles revealed automatically collect.")}</p>
        <p>
          {t("Survival after k reveals = product of (25 − mines − i) ÷ (25 − i), for i = 0 to k−1. Payout multiplier = 0.97 ÷ survival probability, rounded down to 2 decimals. Expected return at a fixed target is at most 97%. Next reveal survival:")}{t(" ")}
          {t((
            ((25 - count - revealed.length) / (25 - revealed.length)) *
            100
          ).toFixed(2))}
          %.
        </p>
      </Rules>
    </>
  );
}
