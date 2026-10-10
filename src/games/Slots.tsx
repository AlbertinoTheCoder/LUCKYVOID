import {t} from "../utils/i18n";
import { useState, useEffect, useRef } from "react";
import { RotateCw } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { SYMBOLS, SLOT_PAY, randomInt, slotPayout } from "./logic";
import type { GameId } from "../types";
export function Slots({ id }: { id: GameId }) {
  const { reserve, settle, sound } = usePlayer();
  const five = id === "void";
  const count = five ? 5 : 3;
  const [bet, setBet] = useState(100),
    [reels, setReels] = useState<number[]>(Array(count).fill(5)),
    [spinning, setSpinning] = useState(false),
    [result, setResult] = useState("Your next spin is waiting."),
    [payout, setPayout] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const spin = () => {
    if (spinning) return;
    const round = reserve(id, bet);
    if (!round) return;
    const next = Array.from({ length: count }, () => randomInt(6));
    setSpinning(true);
    setPayout(0);
    setResult("Reels in motion…");
    sound("spin");
    timers.current.push(
      setTimeout(
        () => {
          const mult = slotPayout(next, five),
            pay = bet * mult;
          setReels(next);
          setPayout(pay);
          setResult(
            mult
              ? `${mult}× payout · ${pay > bet ? "A little magic!" : "Bet returned."}`
              : "No match. Thanks for playing.",
          );
          settle(
            round,
            pay,
            `${next.map((n) => SYMBOLS[n]).join(" ")} · ${mult}×`,
            { sevens: next.slice(0, 3).every((n) => n === 5) ? 1 : 0 },
          );
          setSpinning(false);
        },
        2000,
      ),
    );
  };
  return (
    <>
      <div className={`slot-stage ${id}`}>
        <div className="machine-marquee">
          {t(id === "neon"
            ? "NEON 777"
            : id === "void"
              ? "VOID SPINS"
              : "GOLD RUSH")}
          <small>{t("✦ YOUR LUCK STARTS HERE ✦")}</small>
        </div>
        <div
          className={`live-reels ${five ? "five" : ""} ${spinning ? "spinning" : ""}`}
        >
          {reels.map((n, i) => (
            <div className="live-reel" key={i}>
              <div
                className="reel-strip"
                style={{ animationDelay: `-${i * 0.11}s` }}
              >
                <span>{t(SYMBOLS[(n + 1) % 6])}</span>
                <strong>{t(SYMBOLS[n])}</strong>
                <span>{t(SYMBOLS[(n + 2) % 6])}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="payline" />
        <div className="machine-caption">
          {t(five
            ? "5 REELS · 6 SYMBOLS · INFINITE VIBES"
            : "3 REELS · CLASSIC COMBINATIONS")}
        </div>
      </div>
      <ResultBanner text={result} payout={payout} />
      <div className="game-controls">
        <BetControl bet={bet} setBet={setBet} disabled={spinning} />
        <button
          className="primary game-action"
          onClick={spin}
          disabled={spinning}
        >
          <RotateCw size={19} className={spinning ? "rotate" : ""} />
          {t(spinning ? "Spinning…" : "Spin the reels")}
        </button>
      </div>
      <Rules>
        {t(five ? (
          <>
            <p>
              {t("Five independent reels, six equally likely symbols. Matches must start at the leftmost reel.")}</p>
            <p>
              {t("Exactly 3 matching: 18× (5/216 odds). Exactly 4: 72× (5/1,296). All 5: 250× (1/1,296). Theoretical return: 88.73%.")}</p>
          </>
        ) : (
          <>
            <p>
              {t("Each reel has six equally likely symbols. Three identical symbols pay the table below. Exactly two adjacent matching symbols return 1× your bet (27.78% chance). Triples occur 2.78% of the time. Theoretical return: 85.65%.")}</p>
            <div className="payout-table">
              {SYMBOLS.map((s, i) => (
                <span key={s}>
                  {t(s)} {t(s)} {t(s)}
                  <b>{t(SLOT_PAY[i])}×</b>
                </span>
              ))}
            </div>
          </>
        ))}
        <p>
          {t("All payouts include your bet. No autoplay. Results are chosen before the visual spin.")}</p>
      </Rules>
    </>
  );
}
