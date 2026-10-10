import { t } from "./utils/i18n";
import { useState, useEffect, useRef } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  LayoutGrid,
  Gamepad2,
  Gift,
  Trophy,
  UserRound,
  Settings,
  ArrowUpRight,
  Search,
  Coins,
  Clock3,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import { usePlayer } from "./state/PlayerContext";
import { AnimatedBalance } from "./components/UI";
import { Lobby } from "./pages/Lobby";
import {
  Rewards,
  Profile,
  Leaderboard,
  Settings as SettingsPage,
  History,
} from "./pages/PlayerPages";
import { GamePage } from "./pages/GamePage";
import { level, GAMES } from "./utils/games";
import { parseRoute, routeHash } from "./utils/navigation";
import type { Page, GameId } from "./types";
const nav = [
  { id: "lobby", label: "Lobby", icon: LayoutGrid },
  { id: "games", label: "All games", icon: Gamepad2 },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
] as const;
const personal = [
  { id: "profile", label: "My profile", icon: UserRound },
  { id: "history", label: "Activity", icon: Clock3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
export default function App() {
  const { player, toasts, notify, settings } = usePlayer();
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const { page, game } = route;
  const routeRef = useRef(route);
  routeRef.current = route;
  const [search, setSearch] = useState(""),
    [mobileMenu, setMobileMenu] = useState(false);
  const navigate = (p: Page, g: GameId | null = null) => {
    if (player.pending.length) {
      notify("Finish your active round before leaving the game.", "error");
      return;
    }
    const next = { page: p, game: g };
    if (routeHash(next) !== routeHash(routeRef.current))
      window.history.pushState(null, "", routeHash(next));
    routeRef.current = next;
    setRoute(next);
    setSearch("");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const follow = () => {
      const next = parseRoute(window.location.hash);
      if (routeHash(next) === routeHash(routeRef.current)) return;
      if (player.pending.length) {
        window.history.replaceState(null, "", routeHash(routeRef.current));
        notify("Finish your active round before leaving the game.", "error");
        return;
      }
      routeRef.current = next;
      setRoute(next);
      setSearch("");
      setMobileMenu(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", follow);
    window.addEventListener("hashchange", follow);
    return () => {
      window.removeEventListener("popstate", follow);
      window.removeEventListener("hashchange", follow);
    };
  }, [player.pending.length]);
  useEffect(() => {
    document.documentElement.lang = player.settings.language;
    document.documentElement.dataset.motion = player.settings.reducedMotion
      ? "reduced"
      : "full";
    document.documentElement.dataset.quality = player.settings.quality;
  }, [player.settings]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (player.pending.length) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [player.pending.length]);
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !player.pending.length &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>(".search-box input")?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [player.pending.length]);
  const active = (id: Page) => page === id && !game;
  const items = (
    arr: readonly { id: Page; label: string; icon: typeof LayoutGrid }[],
  ) =>
    arr.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        className={`nav-item ${active(id) ? "active" : ""}`}
        onClick={() => navigate(id)}
      >
        <Icon size={19} />
        {t(label)}
        {t(id === "rewards" && <span className="nav-dot" />)}
        {t(id === "games" && <small>{GAMES.length}</small>)}
      </button>
    ));
  return (
    <MotionConfig
      reducedMotion={player.settings.reducedMotion ? "always" : "user"}
    >
      <div className="app-shell">
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          {t("Skip to content")}
        </a>
        <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
          <button
            className="brand"
            onClick={() => navigate("lobby")}
            aria-label={t("LUCKYVOID home")}
          >
            <span className="brand-mark">✦</span>
            <span>
              {t("LUCKY")}
              <span>{t("VOID")}</span>
              <small>{t("THE VIRTUAL PLAYGROUND")}</small>
            </span>
          </button>
          <button
            className="mobile-menu-close icon-button"
            aria-label={t("Close menu")}
            onClick={() => setMobileMenu(false)}
          >
            <X size={22} />
          </button>
          <span className="nav-label">{t("THE PLAYGROUND")}</span>
          <nav aria-label={t("Main navigation")}>{t(items(nav))}</nav>
          <span className="nav-label personal-label">{t("YOUR SPACE")}</span>
          <nav aria-label={t("Player navigation")}>{t(items(personal))}</nav>
          <div className="sidebar-promo">
            <span className="promo-stars">✦ · ✧</span>
            <h3>
              {t("Big thrills.")}
              <br />
              {t("Zero real stakes.")}
            </h3>
            <p>
              {t("Fictional coins.")}
              <br />
              {t("Real good times.")}
            </p>
            <button onClick={() => navigate("rewards")}>
              {t("Explore rewards")}
              <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="sidebar-bottom">
            <span className="status-dot" /> {t("FREE TO PLAY. ALWAYS.")}
            <p>{t("Made for the joy of the game.")}</p>
          </div>
        </aside>
        {t(
          mobileMenu && (
            <div
              className="sidebar-overlay"
              onClick={() => setMobileMenu(false)}
            />
          ),
        )}
        <div className="main-shell">
          <header className="topbar">
            <button
              className="mobile-brand"
              aria-label={t("Open navigation")}
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
              <b>
                {t("LUCKY")}
                <span>{t("VOID")}</span>
              </b>
            </button>
            <div className="topbar-breadcrumb">
              {t("The playground")}
              <span>/</span>
              {t(" ")}
              <strong>
                {t(
                  game
                    ? game.toUpperCase()
                    : page === "lobby"
                      ? "Lobby"
                      : page.replace(/^./, (s) => s.toUpperCase()),
                )}
              </strong>
            </div>
            <form className="search-box" onSubmit={(e) => e.preventDefault()}>
              <Search size={16} />
              <input
                type="search"
                value={search}
                aria-label={t("Search games")}
                placeholder={t("Find your next favorite…")}
                onChange={(e) => {
                  if (player.pending.length) {
                    notify("Finish your round before searching.", "error");
                    return;
                  }
                  if (game || page !== "games") navigate("games");
                  setSearch(e.target.value);
                }}
              />
              <kbd>/</kbd>
            </form>
            <div className="topbar-actions">
              <button
                className="balance-button"
                aria-label={t(
                  `Balance ${player.balance} VOID coins. View activity.`,
                )}
                onClick={() => navigate("history")}
              >
                <AnimatedBalance value={player.balance} />
                <span>{t("VOID COINS")}</span>
                <ChevronDown size={14} />
              </button>
              <button
                className="sound-button icon-button"
                aria-label={t(
                  player.settings.sound
                    ? "Mute sound effects"
                    : "Enable sound effects",
                )}
                onClick={() => settings({ sound: !player.settings.sound })}
              >
                {t(
                  player.settings.sound ? (
                    <Volume2 size={19} />
                  ) : (
                    <VolumeX size={19} />
                  ),
                )}
              </button>
              <button
                className="header-avatar"
                aria-label={t("Open profile")}
                onClick={() => navigate("profile")}
              >
                {t(player.avatar)}
                <span className="avatar-level">{t(level(player.xp))}</span>
              </button>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            <motion.div
              key={game ?? page}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.18 }}
            >
              {t(
                game ? (
                  <GamePage id={game} onBack={() => navigate("games")} />
                ) : page === "lobby" || page === "games" ? (
                  <Lobby
                    onPlay={(id) => navigate("games", id)}
                    onPage={navigate}
                    all={page === "games"}
                    search={search}
                    onSearch={setSearch}
                  />
                ) : page === "rewards" ? (
                  <Rewards />
                ) : page === "profile" ? (
                  <Profile onPlay={(id) => navigate("games", id)} />
                ) : page === "leaderboard" ? (
                  <Leaderboard />
                ) : page === "history" ? (
                  <History />
                ) : (
                  <SettingsPage />
                ),
              )}
            </motion.div>

            <footer className="site-footer">
              <div>
                <span className="footer-brand">
                  <Sparkles size={17} /> {t("LUCKYVOID")}
                </span>
                <p>{t("A little escape. A lot of possibility.")}</p>
              </div>
              <p>
                {t(
                  "100% fictional currency. No purchases, cash-outs, or prizes.",
                )}
                <br />
                {t("Play for the experience. Coins have no monetary value.")}
              </p>
              <span>{t("✦ BUILT FOR PLAY")}</span>
            </footer>
          </main>
        </div>
        <nav className="bottom-nav" aria-label={t("Mobile navigation")}>
          {[
            ...nav.slice(0, 3),
            { id: "profile" as Page, label: "Profile", icon: UserRound },
            { id: "settings" as Page, label: "Settings", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={active(id) ? "active" : ""}
              onClick={() => navigate(id)}
            >
              <Icon size={20} />
              <span>{t(label)}</span>
            </button>
          ))}
        </nav>
        <div className="toast-stack" aria-live="polite" aria-atomic="false">
          {toasts.map((entry) => (
            <motion.div
              key={entry.id}
              className={`toast ${entry.kind}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span>
                {t(
                  entry.kind === "error"
                    ? "!"
                    : entry.kind === "achievement"
                      ? "✦"
                      : "✓",
                )}
              </span>
              {t(entry.text)}
            </motion.div>
          ))}
        </div>
      </div>
    </MotionConfig>
  );
}
