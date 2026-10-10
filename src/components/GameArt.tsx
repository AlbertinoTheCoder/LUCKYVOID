import {t} from "../utils/i18n";
import type { GameId } from "../types";
export function GameArt({ id, hero = false }: { id: GameId; hero?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`game-art art-${id} ${hero ? "hero-art" : ""}`}
    >
      <div className="art-orbit" />
      {t(["neon", "gold", "void"].includes(id) ? (
        <div className="slot-illustration">
          <div className="slot-top">
            {t(id === "gold"
              ? "GOLD RUSH"
              : id === "void"
                ? "VOID SPINS"
                : "LUCKY SEVENS")}
            <span>★ ★ ★</span>
          </div>
          <div className="slot-body">
            <div className="slot-window">
              {(id === "void"
                ? ["◆", "7", "◆"]
                : id === "gold"
                  ? ["♦", "♦", "♦"]
                  : ["7", "7", "7"]
              ).map((v, i) => (
                <div key={i}>
                  <span>{t(v === "7" ? "★" : "7")}</span>
                  <b>{t(v)}</b>
                  <span>{t(v === "7" ? "◆" : "★")}</span>
                </div>
              ))}
            </div>
            <div className="slot-bottom">
              <i />
              <span>{t("✦ JACKPOT ✦")}</span>
              <i />
            </div>
          </div>
          <div className="slot-foot" />
          <div className="slot-lever">
            <i />
          </div>
        </div>
      ) : id === "baccarat" ? (
        <div className="baccarat-illustration"><span>8<small>♠</small></span><span>9<small>♥</small></span></div>
      ) : id === "wheel" ? (
        <div className="lucky-wheel art-lucky-wheel"><span>✦</span></div>
      ) : id === "scratch" ? (
        <div className="scratch-illustration"><span>◆</span><span>◆</span><span>◆</span></div>
      ) : id === "dice" ? (
        <div className="dice-illustration"><span>⚄</span><span>⚂</span></div>
      ) : id === "coinflip" ? (
        <div className="coin-illustration"><span>☀</span><i>✦</i></div>
      ) : id === "keno" ? (
        <div className="keno-illustration">{[7, 12, 21, 28, 33, 40].map((n, i) => <span key={n} className={i % 2 ? "lit" : ""}>{n}</span>)}</div>
      ) : id === "blackjack" ? (
        <div className="card-illustration">
          <div className="art-card card-one">
            <b>{t("A")}</b>
            <span>♠</span>
            <b>{t("A")}</b>
          </div>
          <div className="art-card card-two">
            <b>{t("K")}</b>
            <span>♥</span>
            <b>{t("K")}</b>
          </div>
          <div className="art-chip">21</div>
        </div>
      ) : id === "roulette" ? (
        <div className="wheel-illustration">
          <div className="wheel-inner">
            <div className="wheel-star">✦</div>
          </div>
          <i className="wheel-ball" />
        </div>
      ) : id === "crash" ? (
        <div className="crash-illustration">
          <svg viewBox="0 0 300 170">
            <path
              d="M20 145 Q160 150 250 20"
              fill="none"
              stroke="#b99bff"
              strokeWidth="6"
            />
            <path
              d="M20 145 Q160 150 250 20 L250 170 L20 170"
              fill="#a37cfd"
              opacity=".1"
            />
            <path d="M236 31 L264 6 L260 43 L248 36Z" fill="#e0d0ff" />
          </svg>
          <strong>
            2.48<span>×</span>
          </strong>
          <span className="art-stars">✧ · ✦ · ✧</span>
        </div>
      ) : id === "mines" ? (
        <div className="mines-illustration">
          {t(Array.from({ length: 9 }, (_, i) => (
            <div key={i} className={[1, 4, 6].includes(i) ? "gem-tile" : ""}>
              {t([1, 4, 6].includes(i) ? "◆" : i === 8 ? "✦" : "")}
            </div>
          )))}
        </div>
      ) : (
        <div className="plinko-illustration">
          {t(Array.from({ length: 6 }, (_, r) => (
            <div key={r}>
              {t(Array.from({ length: r + 3 }, (_, i) => (
                <i key={i} />
              )))}
            </div>
          )))}
          <span className="plinko-ball" />
          <footer>
            {["5×", "2×", ".5×", "2×", "5×"].map((v, i) => (
              <b key={i}>{t(v)}</b>
            ))}
          </footer>
        </div>
      ))}
      <span className="art-spark spark-one">✦</span>
      <span className="art-spark spark-two">✧</span>
    </div>
  );
}
