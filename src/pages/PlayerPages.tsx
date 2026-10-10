import {t} from "../utils/i18n";
import { localLeaderboard } from "../utils/leaderboard";
import { useRef, useState } from "react";
import {
  Gift,
  Trophy,
  Settings as SettingsIcon,
  Volume2,
  Music,
  Move,
  Monitor,
  Trash2,
  Save,
  Star,
  Clock3,
  Download,
  Upload,
} from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { ACHIEVEMENTS } from "../utils/achievements";
import { coins, level, dailyDate, GAMES, gameById } from "../utils/games";
import { Coin, Modal } from "../components/UI";
import { GameCard } from "../components/GameCard";
import { parsePlayer } from "../state/store";
import type { Player, GameId } from "../types";
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <span>{t(eyebrow)}</span>
      <h1>{t(title)}</h1>
      <p>{t(description)}</p>
    </div>
  );
}
export function Rewards() {
  const { player, daily } = usePlayer();
  const [filter, setFilter] = useState("All");
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE EXTRA MAGIC"
        title={t("Good things come to play.")}
        description="Celebrate the milestones. Every reward is free fictional currency."
      />
      <div className="reward-banner">
        <div className="reward-present large">
          <Gift size={48} />
        </div>
        <div>
          <span>{t("DAILY REWARD")}</span>
          <h2>{t("1,000 VOID coins. On us.")}</h2>
          <p>{t("One free claim per UTC day. No streak requirements.")}</p>
        </div>
        <button
          className="primary gold"
          disabled={player.lastDaily === dailyDate()}
          onClick={daily}
        >
          {t(player.lastDaily === dailyDate()
            ? "Claimed · back tomorrow"
            : "Claim free coins")}
        </button>
      </div>
      <div className="section-heading">
        <h2>
          {t("Achievements")}{t(" ")}
          <span className="tiny-badge">
            {t(player.achievements.length)} / {t(ACHIEVEMENTS.length)}
          </span>
        </h2>
        <div className="segmented">
          {["All", "Unlocked", "Locked"].map((v) => (
            <button
              key={v}
              className={filter === v ? "selected" : ""}
              onClick={() => setFilter(v)}
            >
              {t(v)}
            </button>
          ))}
        </div>
      </div>
      <div className="achievement-grid">
        {ACHIEVEMENTS.filter(
          (a) =>
            filter === "All" ||
            (filter === "Unlocked") === player.achievements.includes(a.id),
        ).map((a) => (
          <article
            className={`achievement-card ${player.achievements.includes(a.id) ? "unlocked" : ""}`}
            key={a.id}
          >
            <div className="achievement-icon">{t(a.icon)}</div>
            <div>
              <h3>
                {t(a.name)} {t(player.achievements.includes(a.id) && <span>✓</span>)}
              </h3>
              <p>{t(a.description)}</p>
              <Coin value={a.reward} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function Profile({ onPlay }: { onPlay: (id: GameId) => void }) {
  const { player, profile, notify } = usePlayer();
  const [name, setName] = useState(player.username),
    [avatar, setAvatar] = useState(player.avatar);
  const l = level(player.xp),
    start = (l - 1) ** 2 * 100,
    end = l * l * 100,
    progress = ((player.xp - start) / (end - start)) * 100;
  return (
    <>
      <PageHeading
        eyebrow="YOUR CORNER OF THE VOID"
        title={t("Player profile")}
        description="All your adventures, saved on this browser."
      />
      <div className="profile-grid">
        <section className="profile-card panel">
          <div className="profile-avatar">{t(avatar)}</div>
          <span className="level-pill">{t("LEVEL")}{t(l)} {t("· VOID EXPLORER")}</span>
          <h2>{t(player.username)}</h2>
          <div className="xp-label">
            <span>{t(coins(player.xp))} {t("XP")}</span>
            <span>
              {t(coins(end - player.xp))} {t("XP TO LEVEL")}{t(l + 1)}
            </span>
          </div>
          <div className="progress-bar">
            <i style={{ width: `${progress}%` }} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profile(name, avatar);
              notify("Profile updated. Looking good!");
            }}
          >
            <label>
              {t("PLAYER NAME")}<input
                maxLength={24}
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>{t("CHOOSE YOUR AVATAR")}</label>
            <div className="avatar-options">
              {["👾", "🦊", "🐼", "🪐", "👽", "🦄", "🤖", "🎰"].map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-label={t(`Select ${a} avatar`)}
                  aria-pressed={avatar === a}
                  className={avatar === a ? "selected" : ""}
                  onClick={() => setAvatar(a)}
                >
                  {t(a)}
                </button>
              ))}
            </div>
            <button className="primary" type="submit">
              <Save size={16} />
              {t("Save profile")}</button>
          </form>
        </section>
        <div>
          <div className="profile-stats">
            {[
              { label: "VOID COIN BALANCE", v: player.balance, icon: "✦" },
              { label: "ROUNDS PLAYED", v: player.gamesPlayed, icon: "🎮" },
              { label: "TOTAL PAYOUTS", v: player.totalWon, icon: "🪙" },
              { label: "BIGGEST PAYOUT", v: player.biggestWin, icon: "⚡" },
              { label: "WINNING ROUNDS", v: player.wins, icon: "🍀" },
              {
                label: "ACHIEVEMENTS",
                v: player.achievements.length,
                icon: "🏆",
              },
            ].map((s) => (
              <div className="panel" key={s.label}>
                <span>{t(s.icon)}</span>
                <strong>{t(coins(s.v))}</strong>
                <small>{t(s.label)}</small>
              </div>
            ))}
          </div>
          <section className="panel recent-profile">
            <h3>
              <Clock3 size={17} /> {t("Recent adventures")}</h3>
            {t(player.results.length ? (
              player.results.slice(0, 5).map((r) => (
                <div className="recent-row" key={r.id}>
                  <span>
                    {t(gameById(r.game).name)}
                    <small>{t(new Date(r.time).toLocaleString())}</small>
                  </span>
                  <span className={r.payout > r.bet ? "positive" : ""}>
                    {t(r.payout - r.bet >= 0 ? "+" : "")}
                    {t(coins(r.payout - r.bet))}
                  </span>
                </div>
              ))
            ) : (
              <p>{t("Play your first round to start your story.")}</p>
            ))}
          </section>
        </div>
      </div>
      <div className="section-heading">
        <h2>
          <Star size={20} /> {t("Your favorites")}</h2>
      </div>
      <div className="games-grid">
        {GAMES.filter((g) => player.favorites.includes(g.id)).map((g) => (
          <GameCard key={g.id} game={g} onPlay={onPlay} />
        ))}
      </div>
      {t(!player.favorites.length && (
        <div className="empty-state">
          {t("Tap a game’s heart to keep your favorites here.")}</div>
      ))}
    </>
  );
}
export function Leaderboard() {
  const { player } = usePlayer();
  const [metric, setMetric] = useState<
    "balance" | "gamesPlayed" | "biggestWin" | "xp"
  >("balance");
  const rows = localLeaderboard
    .entries(player)
    .sort((a, b) => b[metric] - a[metric]);
  return (
    <>
      <PageHeading
        eyebrow="A FRIENDLY LITTLE COMPETITION"
        title={t("The stars of the void")}
        description="A local leaderboard with simulated demo players. Your stats are real browser progress."
      />
      <div className="leaderboard-disclaimer">
        <Trophy size={18} /> {t("Demo players are fictional and simulated. There is no multiplayer competition or prize.")}</div>
      <div className="category-tabs">
        {[
          { id: "balance", label: "Highest balance" },
          { id: "gamesPlayed", label: "Most rounds" },
          { id: "biggestWin", label: "Biggest win" },
          { id: "xp", label: "Highest level" },
        ].map((m) => (
          <button
            key={m.id}
            className={metric === m.id ? "active" : ""}
            onClick={() => setMetric(m.id as typeof metric)}
          >
            {t(m.label)}
          </button>
        ))}
      </div>
      <div className="podium">
        {rows.slice(0, 3).map((r, i) => (
          <div
            className={`podium-card rank-${i + 1} ${!r.demo ? "your-row" : ""}`}
            key={r.id}
          >
            <span className="podium-rank">{t(i === 0 ? "♛" : i + 1)}</span>
            <span className="podium-avatar">{t(r.avatar)}</span>
            <h3>{t(r.name)}</h3>
            <small>{t(r.demo ? "SIMULATED PLAYER" : "YOU")}</small>
            <strong>
              {t(metric === "xp" ? `Level ${level(r.xp)}` : coins(r[metric]))}
            </strong>
          </div>
        ))}
      </div>
      <div className="leaderboard-table panel">
        <div className="leaderboard-row table-head">
          <span>{t("RANK")}</span>
          <span>{t("PLAYER")}</span>
          <span>{t(metric === "xp" ? "LEVEL" : "SCORE")}</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.id}
            className={`leaderboard-row ${!r.demo ? "your-row" : ""}`}
          >
            <span className="rank-number">
              {t(String(i + 1).padStart(2, "0"))}
            </span>
            <span>
              <b className="table-avatar">{t(r.avatar)}</b>
              <span>
                {t(r.name)}
                <small>
                  {t(r.demo ? "Simulated demo player" : "You · saved locally")}
                </small>
              </span>
            </span>
            <strong>{t(metric === "xp" ? level(r.xp) : coins(r[metric]))}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
export function Settings() {
  const { player, settings, reset, restore, notify } = usePlayer();
  const [confirm, setConfirm] = useState(false),
    [backup, setBackup] = useState<{ raw: string; player: Player } | null>(
      null,
    );
  const fileInput = useRef<HTMLInputElement>(null);
  const exportBackup = () => {
    if (player.pending.length) {
      notify("Finish your round before saving a backup.", "error");
      return;
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(player, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `luckyvoid-progress-${dailyDate()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const readBackup = async (file?: File) => {
    if (!file) return;
    if (player.pending.length) {
      notify("Finish your round before restoring progress.", "error");
      return;
    }
    if (file.size > 2_000_000) {
      notify("Choose a LUCKYVOID backup smaller than 2 MB.", "error");
      return;
    }
    try {
      const raw = await file.text();
      setBackup({ raw, player: parsePlayer(raw) });
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to read this backup.",
        "error",
      );
    }
  };
  const toggleItems = [
    {
      key: "sound" as const,
      title: "Sound effects",
      text: "A little coin sparkle, card shuffle, and celebration.",
      icon: Volume2,
    },
    {
      key: "music" as const,
      title: "Arcade music",
      text: "A driving 4/4 beat, restless synths, and chaotic arcade fills.",
      icon: Music,
    },
    {
      key: "reducedMotion" as const,
      title: "Reduced motion",
      text: "Shorter transitions and minimal decorative motion.",
      icon: Move,
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="SET YOUR OWN PACE"
        title={t("Make yourself at home.")}
        description="Your preferences are saved automatically on this browser."
      />
      <div className="settings-panel panel">
        <h3>
          <SettingsIcon size={19} /> {t("Experience")}</h3>
        {toggleItems.map((s) => (
          <div className="setting-row" key={s.key}>
            <s.icon size={21} />
            <div>
              <h4>{t(s.title)}</h4>
              <p>{t(s.text)}</p>
            </div>
            <button
              className={`toggle ${player.settings[s.key] ? "on" : ""}`}
              role="switch"
              aria-label={t(s.title)}
              aria-checked={player.settings[s.key]}
              onClick={() => settings({ [s.key]: !player.settings[s.key] })}
            >
              <i />
            </button>
          </div>
        ))}
        <div className="setting-row"><Monitor size={21}/><div><h4>{t("Language")}</h4><p>{t("Choose the language for your playground.")}</p></div><select aria-label={t("Language")} value={player.settings.language} onChange={e=>settings({language:e.target.value as "en"|"it"})}><option value="en">English</option><option value="it">Italiano</option></select></div>
        <div className="setting-row">
          <Monitor size={21} />
          <div>
            <h4>{t("Animation quality")}</h4>
            <p>{t("Lower quality reduces glow effects and background motion.")}</p>
          </div>
          <select
            aria-label={t("Animation quality")}
            value={player.settings.quality}
            onChange={(e) =>
              settings({ quality: e.target.value as "high" | "low" })
            }
          >
            <option value="high">{t("High")}</option>
            <option value="low">{t("Low")}</option>
          </select>
        </div>
      </div>
      <div className="settings-panel panel">
        <h3>{t("Your progress")}</h3>
        <p>
          {t("Balance, achievements, preferences, and the latest 500 rounds stay in this browser. The wallet keeps the latest 200 transactions. Clearing browser data removes your progress.")}</p>
        <div className="setting-row backup-row">
          <Download size={21} />
          <div>
            <h4>{t("Keep your adventure")}</h4>
            <p>
              {t("Download a backup to keep your progress or move it to another browser.")}</p>
          </div>
          <button className="secondary" onClick={exportBackup}>
            {t("Export backup")}</button>
        </div>
        <div className="setting-row backup-row">
          <Upload size={21} />
          <div>
            <h4>{t("Restore saved progress")}</h4>
            <p>
              {t("Choose a LUCKYVOID backup. You’ll review it before replacing your current progress.")}</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            hidden
            aria-label={t("Choose a progress backup")}
            onChange={(e) => {
              void readBackup(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            className="secondary"
            onClick={() => fileInput.current?.click()}
          >
            {t("Import backup")}</button>
        </div>
        <div className="setting-row">
          <Trash2 size={21} />
          <div>
            <h4>{t("Start a fresh adventure")}</h4>
            <p>{t("Reset your coins, profile, settings, and achievements.")}</p>
          </div>
          <button
            className="danger-button"
            onClick={() => {
              if (player.pending.length) {
                notify("Finish your round before resetting.", "error");
                return;
              }
              setConfirm(true);
            }}
          >
            {t("Reset progress")}</button>
        </div>
      </div>
      <div className="fictional-notice">
        <strong>{t("Fictional by design.")}</strong>
        <p>
          {t("VOID coins have no monetary value. They cannot be purchased, transferred, exchanged, or redeemed for money or prizes. LUCKYVOID is a free arcade simulation.")}</p>
      </div>
      {t(backup && (
        <Modal title={t("Restore this adventure?")} onClose={() => setBackup(null)}>
          <p>{t("This replaces the progress currently saved in this browser.")}</p>
          <div className="backup-summary">
            <strong>
              {t(backup.player.avatar)} {t(backup.player.username)}
            </strong>
            <span>
              {t(coins(backup.player.balance))} {t("VOID coins · Level")}{t(" ")}
              {t(level(backup.player.xp))}
            </span>
            <span>
              {t(coins(backup.player.gamesPlayed))} {t("rounds ·")}{t(" ")}
              {t(backup.player.achievements.length)} {t("achievements")}</span>
          </div>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setBackup(null)}>
              {t("Keep current progress")}</button>
            <button
              className="primary"
              onClick={() => {
                if (restore(backup.raw)) setBackup(null);
              }}
            >
              {t("Restore backup")}</button>
          </div>
        </Modal>
      ))}
      {t(confirm && (
        <Modal title={t("Start over?")} onClose={() => setConfirm(false)}>
          <p>
            {t("This permanently removes the saved player profile, achievements, history, and settings from this browser. You’ll start again with 10,000 free VOID coins.")}</p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setConfirm(false)}>
              {t("Keep my progress")}</button>
            <button
              className="danger-button"
              onClick={() => {
                reset();
                setConfirm(false);
              }}
            >
              {t("Yes, reset everything")}</button>
          </div>
        </Modal>
      ))}
    </>
  );
}
export function History() {
  const { player } = usePlayer();
  const [view, setView] = useState("Transactions");
  return (
    <>
      <PageHeading
        eyebrow="EVERY COIN HAS A STORY"
        title={t("Your activity")}
        description="A transparent record of bets, payouts, and free rewards."
      />
      <div className="category-tabs">
        {["Transactions", "Game rounds"].map((v) => (
          <button
            key={v}
            className={view === v ? "active" : ""}
            onClick={() => setView(v)}
          >
            {t(v)}
          </button>
        ))}
      </div>
      <div className="panel history-table">
        {t(view === "Transactions"
          ? player.transactions.map((entry) => (
              <div className="recent-row" key={entry.id}>
                <span>
                  {t(entry.label)}
                  <small>{t(new Date(entry.time).toLocaleString())}</small>
                </span>
                <span
                  className={
                    entry.amount > 0 ? "positive" : entry.amount < 0 ? "negative" : ""
                  }
                >
                  {t(entry.amount > 0 ? "+" : "")}
                  {t(coins(entry.amount))}
                </span>
              </div>
            ))
          : player.results.map((r) => (
              <div className="recent-row" key={r.id}>
                <span>
                  {t(gameById(r.game).name)}
                  <small>
                    {t(r.detail)} {t("· Bet")}{t(coins(r.bet))} ·{t(" ")}
                    {t(new Date(r.time).toLocaleString())}
                  </small>
                </span>
                <span className={r.payout > r.bet ? "positive" : ""}>
                  {t(coins(r.payout))}
                  <small>{t("Total payout")}</small>
                </span>
              </div>
            )))}
        {t(view === "Game rounds" && !player.results.length && (
          <div className="empty-state">{t("Your first round will appear here.")}</div>
        ))}
      </div>
    </>
  );
}
