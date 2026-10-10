import {t} from "../utils/i18n";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Coins, Minus, Plus, Info } from "lucide-react";
import { coins } from "../utils/games";
import { usePlayer } from "../state/PlayerContext";
export function Coin({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={`coin-value ${className}`}>
      <span className="coin-icon">
        <Coins size={13} />
      </span>
      {t(coins(value))}
    </span>
  );
}
export function AnimatedBalance({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  const { player } = usePlayer();
  useEffect(() => {
    if (player.settings.reducedMotion) {
      setShown(value);
      prev.current = value;
      return;
    }
    const start = performance.now(),
      from = prev.current;
    prev.current = value;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 450);
      setShown(Math.round(from + (value - from) * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, player.settings.reducedMotion]);
  return <Coin value={shown} />;
}
export function BetControl({
  bet,
  setBet,
  disabled = false,
}: {
  bet: number;
  setBet: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="bet-control">
      <label htmlFor="bet">
        {t("BET AMOUNT")}<span>{t("VOID COINS")}</span>
      </label>
      <div className="bet-input">
        <button
          aria-label={t("Halve bet")}
          disabled={disabled}
          onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
        >
          <Minus size={16} />
        </button>
        <input
          id="bet"
          type="number"
          min="10"
          max="10000"
          step="10"
          value={bet}
          disabled={disabled}
          onChange={(e) => setBet(Number(e.target.value))}
        />
        <button
          aria-label={t("Double bet")}
          disabled={disabled}
          onClick={() => setBet(Math.min(10000, bet * 2))}
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="chip-options">
        {[50, 100, 250, 500].map((n) => (
          <button
            key={n}
            disabled={disabled}
            className={bet === n ? "selected" : ""}
            onClick={() => setBet(n)}
          >
            {t(n)}
          </button>
        ))}
      </div>
    </div>
  );
}
export function ResultBanner({
  text,
  payout = 0,
}: {
  text: string;
  payout?: number;
}) {
  return (
    <div className={`result-banner ${payout > 0 ? "win" : ""}`} role="status">
      {t(text)}
      {t(payout > 0 && <Coin value={payout} />)}
    </div>
  );
}
export function Rules({ children }: { children: ReactNode }) {
  return (
    <details className="rules">
      <summary>
        <Info size={16} /> {t("Rules, payouts & odds")}</summary>
      <div>{t(children)}</div>
    </details>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            'button,input,select,[tabindex="0"]',
          ) ?? [],
        );
        if (!els.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      old?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={t(title)}
        ref={ref}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <h2>{t(title)}</h2>
          <button
            className="icon-button"
            aria-label={t("Close dialog")}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {t(children)}
      </div>
    </div>
  );
}
