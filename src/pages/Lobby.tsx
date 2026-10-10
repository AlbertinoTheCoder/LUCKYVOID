import {t} from "../utils/i18n";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Gift,
  Flame,
  Grid2X2,
  Heart,
  Clock3,
  Gamepad2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePlayer } from "../state/PlayerContext";
import { GAMES, coins, level, dailyDate } from "../utils/games";
import { GameArt } from "../components/GameArt";
import { GameCard } from "../components/GameCard";
import { ACHIEVEMENTS } from "../utils/achievements";
import type { GameId, Page } from "../types";
export function Lobby({
  onPlay,
  onPage,
  all = false,
  search = "",
  onSearch,
}: {
  onPlay: (id: GameId) => void;
  onPage: (p: Page) => void;
  all?: boolean;
  search?: string;
  onSearch?: (value: string) => void;
}) {
  const { player, daily } = usePlayer();
  const [category, setCategory] = useState("All games");
  const recent = [...new Set(player.results.map((r) => r.game))].slice(0, 4);
  const filtered = GAMES.filter(
    (g) =>
      (category === "All games" ||
        (category === "Favorites" && player.favorites.includes(g.id)) ||
        (category === "Recent" && recent.includes(g.id)) ||
        category === g.category) &&
      (!search ||
        `${g.name} ${g.category}`.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <>
      {t(!all && !search && (
        <>
          <div className="lobby-eyebrow">
            <span className="status-dot" /> {t("YOUR NEXT GREAT MOMENT STARTS HERE")}</div>
          <section className="hero">
            <div className="hero-grid" />
            <div className="hero-copy">
              <div className="hero-pill">
                <Sparkles size={13} /> {t("ALL THE THRILL. ZERO REAL MONEY.")}</div>
              <h1>
                {t("A little luck.")}<br />
                <span>{t("A whole new universe.")}</span>
              </h1>
              <p>
                {t("Step into the void. Play your favorites.")}<br />
                {t("Make every virtual coin an adventure.")}</p>
              <div className="hero-actions">
                <button className="primary" onClick={() => onPlay("neon")}>
                  {t("Let’s play")}<ArrowUpRight size={18} />
                </button>
                <span>
                  <i>✦</i> {t("10,000 free coins to start")}</span>
              </div>
            </div>
            <GameArt id="neon" hero />
            <div className="hero-side-text">{t("LUCK IS A STATE OF MIND")}</div>
            <div className="hero-bottom">
              <span>
                <i /> {t("FREE TO PLAY. ALWAYS.")}</span>
              <span>
                01 <b>/ 01</b>
              </span>
            </div>
          </section>
          <div className="welcome-row">
            <div>
              <h2>
                {t("Welcome back,")}<span>{t(player.username.split(" ")[0])}</span>{t(" ")}
                <span className="wave">✦</span>
              </h2>
              <p>{t("Your playground. Your pace. Your next adventure.")}</p>
            </div>
            <button className="text-button" onClick={() => onPage("profile")}>
              {t("Level")}{t(level(player.xp))} <span className="level-badge">✦</span>
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="lobby-highlights">
            <button
              className="daily-card"
              onClick={daily}
              disabled={player.lastDaily === dailyDate()}
            >
              <div className="reward-present">
                <Gift size={27} />
              </div>
              <div>
                <span>{t("YOUR DAILY DOSE OF LUCK")}</span>
                <h3>
                  {t(player.lastDaily === dailyDate()
                    ? "Reward collected!"
                    : "1,000 free VOID coins")}
                </h3>
                <p>
                  {t(player.lastDaily === dailyDate()
                    ? "See you tomorrow · resets at 00:00 UTC"
                    : "A little something, on the house. No strings.")}
                </p>
              </div>
              <span className="reward-claim">
                {t(player.lastDaily === dailyDate() ? "✓" : "Claim reward")}
                <ArrowRight size={16} />
              </span>
            </button>
            <div className="lobby-stat">
              <Gamepad2 size={21} />
              <strong>{t(coins(player.gamesPlayed))}</strong>
              <span>{t("ROUNDS PLAYED")}</span>
            </div>
            <div className="lobby-stat">
              <TrendingUp size={21} />
              <strong>{t(coins(player.biggestWin))}</strong>
              <span>{t("BIGGEST VIRTUAL WIN")}</span>
            </div>
          </div>
        </>
      ))}
      <section className="game-section">
        <div className="section-heading">
          <div>
            <h2>
              {t(all ? "Find your next favorite" : "The floor is yours")}{t(" ")}
              <span className="tiny-badge">{t(`${GAMES.length} GAMES`)}</span>
            </h2>
            <p>
              {t(all
                ? "Fourteen ways to play. One extraordinary arcade."
                : "Old favorites. New discoveries. All yours to explore.")}
            </p>
          </div>
          {t(!all && (
            <button className="text-button" onClick={() => onPage("games")}>
              {t("View all games")}<ArrowRight size={16} />
            </button>
          ))}
        </div>
        {t(all && (
          <div className="mobile-game-search">
            <label htmlFor="mobile-search">{t("Find your next favorite")}</label>
            <input
              id="mobile-search"
              type="search"
              placeholder={t("Search games…")}
              value={search}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        ))}
        <div className="category-tabs">
          {[
            { name: "All games", icon: Grid2X2 },
            { name: "Slots", icon: Flame },
            { name: "Table games", icon: Gamepad2 },
            { name: "Arcade", icon: Sparkles },
            { name: "Favorites", icon: Heart },
            { name: "Recent", icon: Clock3 },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={category === name ? "active" : ""}
              onClick={() => setCategory(name)}
            >
              <Icon size={15} />
              {t(name)}
            </button>
          ))}
        </div>
        {t(search && <p className="search-summary">{t("Results for “")}{t(search)}”</p>)}
        <div className="games-grid">
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: player.settings.reducedMotion ? 0 : i * 0.04,
              }}
            >
              <GameCard game={g} onPlay={onPlay} />
            </motion.div>
          ))}
        </div>
        {t(!filtered.length && (
          <div className="empty-state">
            <Gamepad2 size={32} />
            <h3>
              {t(category === "Favorites"
                ? "Your favorites live here"
                : category === "Recent"
                  ? "Your next adventure awaits"
                  : "No games found")}
            </h3>
            <p>
              {t(category === "Favorites"
                ? "Tap the heart on any game to save it."
                : category === "Recent"
                  ? "Play a round and it will appear here."
                  : "Try another search or category.")}
            </p>
            <button
              className="secondary"
              onClick={() => setCategory("All games")}
            >
              {t("Explore all games")}</button>
          </div>
        ))}
      </section>
      {t(!all && !search && (
        <div className="lobby-bottom">
          <section className="milestone-card">
            <div className="section-heading">
              <h3>
                <Trophy size={18} /> {t("Little wins. Big milestones.")}</h3>
              <button className="text-button" onClick={() => onPage("rewards")}>
                {t("View all")}<ArrowRight size={15} />
              </button>
            </div>
            <div className="milestone-items">
              {ACHIEVEMENTS.slice(0, 3).map((a) => (
                <div key={a.id}>
                  <span
                    className={
                      player.achievements.includes(a.id) ? "unlocked" : ""
                    }
                  >
                    {t(a.icon)}
                  </span>
                  <h4>{t(a.name)}</h4>
                  <p>
                    {t(player.achievements.includes(a.id)
                      ? "Unlocked ✓"
                      : a.description)}
                  </p>
                  <small>+{t(a.reward)} {t("coins")}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="just-play-card">
            <span>{t("GOOD VIBES. FICTIONAL COINS.")}</span>
            <h3>
              {t("Here for the fun.")}<br />
              {t("Stay for the possibilities.")}</h3>
            <p>
              {t("No deposits. No cash-outs. No real stakes.")}<br />
              {t("Just a little escape into the extraordinary.")}</p>
            <button className="text-button" onClick={() => onPage("settings")}>
              {t("Make it your own")}<ArrowUpRight size={16} />
            </button>
            <span className="abstract-orbit">✧</span>
          </section>
        </div>
      ))}
    </>
  );
}
