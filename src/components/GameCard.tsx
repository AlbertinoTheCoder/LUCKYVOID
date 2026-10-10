import {t} from "../utils/i18n";
import { ArrowUpRight, Heart } from "lucide-react";
import type { GameInfo, GameId } from "../types";
import { GameArt } from "./GameArt";
import { usePlayer } from "../state/PlayerContext";
export function GameCard({
  game,
  onPlay,
}: {
  game: GameInfo;
  onPlay: (id: GameId) => void;
}) {
  const { player, favorite } = usePlayer();
  return (
    <article
      className="game-card"
      style={{ "--game-color": game.color } as React.CSSProperties}
    >
      <button
        className="card-play"
        onClick={() => onPlay(game.id)}
        aria-label={t(`Play ${game.name}`)}
      >
        <GameArt id={game.id} />
        <div className="game-card-copy">
          <span className="game-category">{t(game.category)}</span>
          <h3>
            {t(game.name)}
            <ArrowUpRight size={18} />
          </h3>
          <p>{t(game.description)}</p>
        </div>
      </button>
      <button
        className={`favorite-button ${player.favorites.includes(game.id) ? "is-favorite" : ""}`}
        aria-label={t(`${player.favorites.includes(game.id) ? "Remove" : "Add"} ${game.name} ${player.favorites.includes(game.id) ? "from" : "to"} favorites`)}
        onClick={() => favorite(game.id)}
      >
        <Heart
          size={15}
          fill={player.favorites.includes(game.id) ? "currentColor" : "none"}
        />
      </button>
      <span className="game-card-tag">{t(game.tag)}</span>
    </article>
  );
}
