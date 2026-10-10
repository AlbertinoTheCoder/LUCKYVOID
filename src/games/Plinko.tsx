import { t } from "../utils/i18n";
import { useState, useRef, useEffect } from "react";
import { CircleDot } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { plinkoMultipliers, plinkoPath, binomial, type Risk } from "./logic";
export function Plinko() {
  const { reserve, settle, player, sound } = usePlayer();
  const [bet, setBet] = useState(100),
    [risk, setRisk] = useState<Risk>("medium"),
    [activeCount, setActiveCount] = useState(0),
    [landed, setLanded] = useState<number | null>(null),
    [payout, setPayout] = useState(0),
    [text, setText] = useState("Follow the bounce. Find your fortune.");
  const canvas = useRef<HTMLCanvasElement>(null),
    raf = useRef(0),
    motion = useRef<
      {
        id: string;
        start: number;
        path: number[];
        duration: number;
        risk: Risk;
        color: string;
      }[]
    >([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const multipliers = plinkoMultipliers(risk);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const draw = () => {
      const width = c.clientWidth,
        height = 360,
        dpr = Math.min(devicePixelRatio || 1, 2);
      if (c.width !== width * dpr) {
        c.width = width * dpr;
        c.height = height * dpr;
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const spacing = Math.min((width - 12) / 9, 44),
        top = 38,
        rowHeight = 31;
      for (let r = 0; r < 8; r++)
        for (let i = 0; i < r + 3; i++) {
          const x = width / 2 + (i - (r + 2) / 2) * spacing,
            y = top + r * rowHeight;
          ctx.beginPath();
          ctx.arc(
            x,
            y,
            player.settings.quality === "low" ? 3 : 4,
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = "#c7bdde";
          if (player.settings.quality === "high") {
            ctx.shadowColor = "#8a68bf";
            ctx.shadowBlur = 6;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      for (const m of motion.current) {
        let x = width / 2,
          y = 10;
        const t = Math.min(1, (performance.now() - m.start) / m.duration),
          segment = t * 8,
          row = Math.min(7, Math.floor(segment)),
          fraction = segment - row;
        const prior = m.path
            .slice(0, row)
            .reduce((s, n) => s + (n ? 0.5 : -0.5), 0),
          next = prior + (m.path[row] ? 0.5 : -0.5);
        x = width / 2 + (prior + (next - prior) * fraction) * spacing;
        y = 20 + t * 280 - Math.sin(fraction * Math.PI) * 13;
        if (t === 1) {
          x =
            width / 2 +
            m.path.reduce((s, n) => s + (n ? 0.5 : -0.5), 0) * spacing;
          y = 310;
        }
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (motion.current.length) raf.current = requestAnimationFrame(draw);
    };
    draw();
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf.current);
      draw();
    });
    observer.observe(c);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [activeCount, player.settings.quality]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    },
    [],
  );
  const drop = () => {
    if (motion.current.length >= 20) return;
    const id = reserve("plinko", bet);
    if (!id) return;
    const path = plinkoPath(),
      slot = path.reduce((s, n) => s + n, 0),
      duration = player.settings.reducedMotion ? 200 : 2600;
    motion.current.push({
      id,
      start: performance.now(),
      path,
      duration,
      risk,
      color: ["#ffcb80", "#a5d7ff", "#d5afff"][motion.current.length % 3],
    });
    setActiveCount(motion.current.length);
    setLanded(null);
    setPayout(0);
    setText("A little left. A little right…");
    sound("spin");
    const timer = setTimeout(() => {
      const m = multipliers[slot],
        pay = Math.floor(bet * m);
      setLanded(slot);
      setPayout(pay);
      setText(`Landed on ${m.toFixed(2)}× · ${risk} risk.`);
      settle(id, pay, `${m.toFixed(2)}× · ${risk} risk`, { multiplier: m });
      motion.current = motion.current.filter((ball) => ball.id !== id);
      timers.current.delete(id);
      setActiveCount(motion.current.length);
    }, duration);
    timers.current.set(id, timer);
  };
  return (
    <>
      <div className="plinko-stage">
        <canvas
          ref={canvas}
          aria-label={t(`Eight-row Plinko board with ${activeCount} falling balls`)}
          role="img"
        />
        <div className="plinko-slots">
          {multipliers.map((v, i) => (
              <div
                key={i}
                className={`${i < 2 || i > 6 ? "edge" : ""} ${landed === i ? "landed" : ""}`}
              >
                {t(v.toFixed(2))}
                <small>×</small>
              </div>
            ))}
        </div>
      </div>
      <div className="plinko-flight-count" role="status">
        {t(
          activeCount
            ? `${activeCount} ${activeCount === 1 ? "ball" : "balls"} in flight · drop another anytime`
            : "Ready for your next drop",
        )}
      </div>
      <ResultBanner text={text} payout={payout} />
      <div className="risk-options">
        <span>{t("RISK LEVEL")}</span>
        {(["low", "medium", "high"] as Risk[]).map((v) => (
            <button
              key={v}
              disabled={activeCount > 0}
              className={risk === v ? "selected" : ""}
              onClick={() => setRisk(v)}
            >
              {t(v)}
            </button>
          ))}
      </div>
      <div className="game-controls">
        <BetControl bet={bet} setBet={setBet} />
        <button
          className="primary game-action"
          disabled={activeCount >= 20}
          onClick={drop}
        >
          <CircleDot size={19} />
          {t(activeCount >= 20 ? "Board full · 20 balls" : "Drop a ball")}
        </button>
      </div>
      <Rules>
        <p>
          {t(
            "Eight fair, independent 50/50 bounces determine the landing slot. The animation follows the sampled path with arcs around each peg. Risk changes payouts, not the chances. Drop up to 20 balls at once. Each ball keeps the bet and risk selected when it was dropped; changing the bet applies to your next ball. Risk can be changed once the board is clear.",
          )}
        </p>
        <p>
          {t("Slot probabilities from left to right:")}
          {t(" ")}
          {t(
            Array.from(
              { length: 9 },
              (_, i) => ((binomial(8, i) / 256) * 100).toFixed(2) + "%",
            ).join(", "),
          )}
          {t(
            ". Payouts are normalized to an expected return of at most 96%, then rounded down to 2 decimals. Payout includes the bet.",
          )}
        </p>
      </Rules>
    </>
  );
}
