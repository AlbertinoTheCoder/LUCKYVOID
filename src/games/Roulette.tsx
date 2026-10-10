import {t} from "../utils/i18n";
import { useState, useRef, useEffect } from "react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import {
  RED,
  rouletteNumbers,
  roulettePayout,
  randomInt,
  type RouletteBet,
} from "./logic";
const SPIN_DURATION_MS = 4500;
export function Roulette() {
  const { reserve, settle, player, sound } = usePlayer();
  const [bet, setBet] = useState(100),
    [choice, setChoice] = useState<RouletteBet>("red"),
    [busy, setBusy] = useState(false),
    [rotation, setRotation] = useState(0),
    [last, setLast] = useState<number | null>(null),
    [pay, setPay] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ballRef = useRef<HTMLElement>(null);
  const frame = useRef<number>(0);
  useEffect(() => () => {
    clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
  }, []);
  const spin = () => {
    if (busy) return;
    const id = reserve("roulette", bet);
    if (!id) return;
    const n = randomInt(37),
      idx = rouletteNumbers.indexOf(n),
      target =
        rotation +
        360 * (player.settings.reducedMotion ? 1 : 3) +
        (360 - (rotation % 360)) -
        ((idx + 0.5) * 360) / 37;
    setBusy(true);
    setPay(0);
    setRotation(target);
    const started = performance.now();
    const turns = player.settings.reducedMotion ? 1 : 4;
    const animateBall = (now: number) => {
      const progress = Math.min(1, (now - started) / SPIN_DURATION_MS);
      // Counter-rotate on the rim, then lose speed and fall into the winning pocket.
      const travel = 1 - Math.pow(1 - progress, 2.4);
      const angle = -turns * Math.PI * 2 * travel;
      const drop = Math.max(0, Math.min(1, (progress - 0.65) / 0.3));
      const fall = drop * drop * (3 - 2 * drop);
      const bounce = player.settings.reducedMotion ? 0 :
        Math.sin(drop * Math.PI * 6) * (1 - drop) * drop * 12;
      const radius = 140 - 22 * fall + bounce;
      if (ballRef.current) {
        ballRef.current.style.transform = `translate(-50%, -50%) translate(${Math.sin(angle) * radius}px, ${-Math.cos(angle) * radius}px)`;
      }
      if (progress < 1) frame.current = requestAnimationFrame(animateBall);
    };
    frame.current = requestAnimationFrame(animateBall);
    sound("spin");
    timer.current = setTimeout(
      () => {
        const payout = bet * roulettePayout(choice, n);
        setLast(n);
        setPay(payout);
        settle(
          id,
          payout,
          `${n} ${n === 0 ? "green" : RED.has(n) ? "red" : "black"} · ${choice}`,
          { straightWin: typeof choice === "number" && payout > 0 ? 1 : 0 },
        );
        setBusy(false);
      },
      SPIN_DURATION_MS,
    );
  };
  return (
    <>
      <div className="roulette-stage">
        <div className="roulette-pointer">▼</div>
        <div
          className="roulette-wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${SPIN_DURATION_MS}ms`,
            background: `conic-gradient(${rouletteNumbers.map((n, i) => `${n === 0 ? "#218d63" : RED.has(n) ? "#af3c5b" : "#23202f"} ${(i * 360) / 37}deg ${((i + 1) * 360) / 37}deg`).join(",")})`,
          }}
        >
          {rouletteNumbers.map((n, i) => (
            <span
              key={n}
              style={{
                transform: `translate(-50%,-50%) rotate(${((i + 0.5) * 360) / 37}deg) translateY(-135px)`,
              }}
            >
              {t(n)}
            </span>
          ))}
          <div className="roulette-hub">✦</div>
        </div>
        <div className="roulette-ball-track">
          <i ref={ballRef} />
        </div>
      </div>
      <ResultBanner
        text={
          busy
            ? "Around we go…"
            : last === null
              ? "Choose your bet. Give luck a spin."
              : `${last} · ${last === 0 ? "Green" : RED.has(last) ? "Red" : "Black"}${pay ? " · Winning bet!" : " · No match this round."}`
        }
        payout={pay}
      />
      <div className="roulette-table">
        <button
          className={`number zero ${choice === 0 ? "selected" : ""}`}
          disabled={busy}
          onClick={() => setChoice(0)}
        >
          0
        </button>
        <div className="roulette-numbers">
          {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              disabled={busy}
              className={`number ${RED.has(n) ? "red" : "black"} ${choice === n ? "selected" : ""}`}
              onClick={() => setChoice(n)}
            >
              {t(n)}
            </button>
          ))}
        </div>
        <div className="outside-bets">
          {(
            [
              "low",
              "even",
              "red",
              "black",
              "odd",
              "high",
              "dozen1",
              "dozen2",
              "dozen3",
            ] as RouletteBet[]
          ).map((v) => (
            <button
              key={v}
              disabled={busy}
              className={choice === v ? "selected" : ""}
              onClick={() => setChoice(v)}
            >
              {t((
                {
                  low: "1–18",
                  high: "19–36",
                  dozen1: "1st 12",
                  dozen2: "2nd 12",
                  dozen3: "3rd 12",
                } as Record<string, string>
              )[v] ?? v)}
            </button>
          ))}
        </div>
      </div>
      <div className="game-controls">
        <BetControl bet={bet} setBet={setBet} disabled={busy} />
        <button className="primary game-action" onClick={spin} disabled={busy}>
          {t(busy ? "Wheel spinning…" : `Spin · ${choice}`)}
        </button>
      </div>
      <Rules>
        <p>
          {t("European roulette: 37 equally likely pockets (0–36). Select one bet per round. Zero loses all outside bets.")}</p>
        <p>
          {t("Single number: 36× total payout, 1/37 chance. Red/black, odd/even, 1–18/19–36: 2×, 18/37 chance. Dozens: 3×, 12/37 chance. Theoretical return for all bets: 97.30%.")}</p>
        <p>
          {t("The ball slows around the wheel while the chosen pocket comes to the marker.")}</p>
      </Rules>
    </>
  );
}
