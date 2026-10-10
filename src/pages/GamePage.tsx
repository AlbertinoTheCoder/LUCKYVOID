import {t} from "../utils/i18n";
import { ArrowLeft, Heart, ShieldCheck, Clock3 } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { gameById, coins } from "../utils/games";
import type { GameId } from "../types";
import { Slots } from "../games/Slots";
import { Blackjack } from "../games/Blackjack";
import { Roulette } from "../games/Roulette";
import { Crash } from "../games/Crash";
import { Mines } from "../games/Mines";
import { Plinko } from "../games/Plinko";
import { Dice, Keno, CoinFlip } from "../games/QuickGames";
import { Baccarat, LuckyWheel, ScratchCards } from "../games/MoreGames";
export function GamePage({ id, onBack }: { id: GameId; onBack: () => void }) {
  const { player, favorite } = usePlayer();
  const game = gameById(id);
  const Component =
    id === "baccarat" ? Baccarat : id === "wheel" ? LuckyWheel : id === "scratch" ? ScratchCards : id === "dice" ? Dice : id === "keno" ? Keno : id === "coinflip" ? CoinFlip : id === "blackjack"
      ? Blackjack
      : id === "roulette"
        ? Roulette
        : id === "crash"
          ? Crash
          : id === "mines"
            ? Mines
            : id === "plinko"
              ? Plinko
              : null;
  return (
    <>
      <div className="game-page-heading">
        <div>
          <button className="text-button" onClick={onBack}>
            <ArrowLeft size={16} />
            {t("Back to the floor")}</button>
          <h1>
            {t(game.name)} <span className="tiny-badge">{t(game.category)}</span>
          </h1>
          <p>{t(game.description)}</p>
        </div>
        <button
          className={`secondary ${player.favorites.includes(id) ? "favorite-active" : ""}`}
          onClick={() => favorite(id)}
        >
          <Heart
            size={16}
            fill={player.favorites.includes(id) ? "currentColor" : "none"}
          />
          {t(player.favorites.includes(id) ? "Saved" : "Favorite")}
        </button>
      </div>
      <div className="game-layout">
        <section className="play-panel">
          {t(Component ? <Component /> : <Slots id={id} />)}
        </section>
        <aside className="game-sidebar">
          <div className="panel game-reminder">
            <ShieldCheck size={25} />
            <h3>{t("All play. No real stakes.")}</h3>
            <p>
              {t("Every coin is fictional. Play at your own pace — there’s no need to chase a result.")}</p>
            <span>{t("Browser-random outcomes")}</span>
            <small>{t("Independent rounds · Visible odds")}</small>
          </div>
          <div className="panel game-history">
            <h3>
              <Clock3 size={17} /> {t("Recent rounds")}</h3>
            {player.results
              .filter((r) => r.game === id)
              .slice(0, 8)
              .map((r) => (
                <div key={r.id}>
                  <span>
                    {t(r.detail)}
                    <small>{t("Bet")}{t(coins(r.bet))}</small>
                  </span>
                  <b className={r.payout > r.bet ? "positive" : ""}>
                    {t(coins(r.payout))}
                    <small>{t("payout")}</small>
                  </b>
                </div>
              ))}
            {t(!player.results.some((r) => r.game === id) && (
              <p>{t("Your results will appear after each round.")}</p>
            ))}
          </div>
          <p className="game-sidebar-note">
            {t("Payouts include your original bet. Coin totals round down to whole points. Each round earns 25 XP, plus 15 for a profit.")}</p>
        </aside>
      </div>
    </>
  );
}
