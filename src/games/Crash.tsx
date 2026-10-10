import { t } from "../utils/i18n";
import { useState, useRef, useEffect } from "react";
import { Rocket } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { crashPoint } from "./logic";
export function Crash() {
  const { reserve, settle } = usePlayer();
  const [bet, setBet] = useState(100),
    [active, setActive] = useState(false),
    [mult, setMult] = useState(1),
    [end, setEnd] = useState(false),
    [message, setMessage] = useState("Ready for takeoff?"),
    [payout, setPayout] = useState(0);
  const run = useRef<{
      id: string;
      point: number;
      start: number;
      bet: number;
    } | null>(null),
    raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const tick = (time: number) => {
    const r = run.current;
    if (!r) return;
    const next = Math.exp((time - r.start) / 8000);
    if (next >= r.point) {
      setMult(r.point);
      setEnd(true);
      setActive(false);
      setMessage(`Round stopped at ${r.point.toFixed(2)}×.`);
      settle(r.id, 0, `Stopped at ${r.point.toFixed(2)}×`);
      run.current = null;
      return;
    }
    setMult(next);
    raf.current = requestAnimationFrame(tick);
  };
  const start = () => {
    if (run.current) return;
    const id = reserve("crash", bet);
    if (!id) return;
    run.current = { id, point: crashPoint(), start: performance.now(), bet };
    setActive(true);
    setEnd(false);
    setMult(1);
    setPayout(0);
    setMessage("Multiplier climbing. Collect whenever you choose.");
    raf.current = requestAnimationFrame(tick);
  };
  const collect = () => {
    const r = run.current;
    if (!r) return;
    const actual = Math.exp((performance.now() - r.start) / 8000);
    cancelAnimationFrame(raf.current);
    run.current = null;
    setActive(false);
    if (actual >= r.point) {
      setMult(r.point);
      setEnd(true);
      setMessage(`Round stopped at ${r.point.toFixed(2)}×.`);
      settle(r.id, 0, `Stopped at ${r.point.toFixed(2)}×`);
      return;
    }
    const m = Math.floor(actual * 100) / 100,
      pay = Math.floor(r.bet * m);
    setMult(m);
    setPayout(pay);
    setMessage(`Collected at ${m.toFixed(2)}×. Nice flight.`);
    settle(r.id, pay, `Collected ${m.toFixed(2)}×`, { multiplier: m });
  };
  const progress = Math.min(1, Math.log(mult) / Math.log(12));
  return (
    <>
      <div className={`crash-stage ${end ? "crashed" : ""}`}>
        <div className="graph-grid" />
        <svg viewBox="0 0 600 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="crashFill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#a576ff" stopOpacity=".4" />
              <stop offset="1" stopColor="#a576ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M20 280 Q${70 + progress * 150} 280 ${40 + progress * 520} ${275 - progress * 245} L${40 + progress * 520} 300 L20 300Z`}
            fill="url(#crashFill)"
          />
          <path
            d={`M20 280 Q${70 + progress * 150} 280 ${40 + progress * 520} ${275 - progress * 245}`}
            fill="none"
            stroke={end ? "#ff6f8c" : "#ba91ff"}
            strokeWidth="4"
          />
        </svg>
        <div className="crash-multiplier">
          <small>
            {t(end ? "FLIGHT ENDED" : active ? "IN FLIGHT" : "READY TO LAUNCH")}
          </small>
          <strong>
            {t(mult.toFixed(2))}
            <span>×</span>
          </strong>
        </div>
        <Rocket
          className="graph-rocket"
          size={34}
          style={{
            left: `${7 + progress * 85}%`,
            bottom: `${8 + progress * 77}%`,
          }}
        />
        <div className="graph-labels">
          <span>1.00×</span>
          <span>{t("Time in flight →")}</span>
        </div>
      </div>
      <ResultBanner text={message} payout={payout} />
      <div className="game-controls">
        <BetControl bet={bet} setBet={setBet} disabled={active} />
        {t(
          active ? (
            <button className="primary gold game-action" onClick={collect}>
              {t("Collect ·")}
              {t(Math.floor(bet * mult).toLocaleString())} {t("coins")}
            </button>
          ) : (
            <button className="primary game-action" onClick={start}>
              <Rocket size={18} />
              {t("Start flight")}
            </button>
          ),
        )}
      </div>
      <Rules>
        <p>
          {t(
            "The multiplier grows exponentially until its randomly chosen stop point. Collect first to receive bet × multiplier, rounded down. If it stops first, the bet is lost. There is a 3% chance of an instant stop at 1.00×.",
          )}
        </p>
        <p>
          {t(
            "For targets above 1× and below 1,000×, survival probability is 0.97 ÷ target: 48.5% at 2× and 19.4% at 5×. Stop points are continuous; displayed multipliers use two decimals and collection rounds down. Maximum stop: 1,000×. Expected return is 97% before rounding. Every flight is independent.",
          )}
        </p>
        <p>
          {t(
            "Leaving this page is disabled during play. Background time continues to count.",
          )}
        </p>
      </Rules>
    </>
  );
}
