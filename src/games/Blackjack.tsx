import {t} from "../utils/i18n";
import { useState, useRef, useEffect } from "react";
import { Plus, Hand, Copy, ChevronsUp } from "lucide-react";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules, Coin } from "../components/UI";
import { handValue, cardLabel, type Card } from "./logic";
import {
  newBlackjack,
  natural,
  dealerNatural,
  finishDealer,
  canSplit,
  splitHand,
  draw,
  type BJRound,
} from "./blackjackEngine";
function PlayingCard({
  card,
  hidden = false,
}: {
  card: Card;
  hidden?: boolean;
}) {
  return (
    <div
      className={`playing-card ${hidden ? "card-back" : ["♥", "♦"].includes(card.suit) ? "red-card" : ""}`}
      aria-label={
        t(hidden ? "Hidden dealer card" : `${cardLabel(card)} ${card.suit}`)
      }
    >
      {t(hidden ? (
        <span>✦</span>
      ) : (
        <>
          <b>
            {t(cardLabel(card))}
            <small>{t(card.suit)}</small>
          </b>
          <span>{t(card.suit)}</span>
          <b>{t(cardLabel(card))}</b>
        </>
      ))}
    </div>
  );
}
export function Blackjack() {
  const { reserve, increase, settle, sound, player } = usePlayer();
  const [bet, setBet] = useState(100),
    [round, setRound] = useState<BJRound | null>(null),
    [pay, setPay] = useState(0),
    [text, setText] = useState("The table is yours. Aim for 21.");
  const run = useRef<BJRound | null>(null),
    timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const render = (r: BJRound) =>
    setRound({
      ...r,
      hands: r.hands.map((h) => ({ ...h, cards: [...h.cards] })),
      dealer: [...r.dealer],
    });
  const finish = (r: BJRound) => {
    if (r.resolving || r.finished) return;
    r.resolving = true;
    setText("Dealer reveals…");
    render(r);
    timer.current = setTimeout(
      () => {
        const payout = finishDealer(r);
        setPay(payout);
        const total = r.hands.reduce((s, h) => s + h.bet, 0);
        setText(
          natural(r) && !dealerNatural(r)
            ? "Blackjack! A natural 21."
            : payout > total
              ? "You beat the dealer."
              : payout === total
                ? "Push. Your bet is returned."
                : payout > 0
                  ? "Split round complete."
                  : "Dealer wins this round.",
        );
        settle(
          r.id,
          payout,
          `Dealer ${handValue(r.dealer)} · ${r.hands.map((h) => handValue(h.cards)).join(" / ")}`,
          { natural: natural(r) ? 1 : 0 },
        );
        render(r);
        run.current = null;
      },
      player.settings.reducedMotion ? 100 : 650,
    );
  };
  const advance = (r: BJRound) => {
    while (r.active < r.hands.length && r.hands[r.active].done) r.active++;
    if (r.active >= r.hands.length) {
      r.active = r.hands.length - 1;
      finish(r);
    } else render(r);
  };
  const deal = () => {
    if (run.current) return;
    if (bet % 2 !== 0) {
      setText("Use an even bet for exact 3:2 blackjack payouts.");
      return;
    }
    const id = reserve("blackjack", bet);
    if (!id) return;
    const r = newBlackjack(id, bet);
    run.current = r;
    setPay(0);
    setText("Hit, stand, or make your move.");
    sound("card");
    render(r);
    if (natural(r) || dealerNatural(r)) finish(r);
  };
  const action = (kind: "hit" | "stand" | "double" | "split") => {
    const r = run.current;
    if (!r || r.resolving || r.finished) return;
    const h = r.hands[r.active];
    if (h.done) return;
    if (kind === "hit") {
      h.cards.push(draw(r));
      if (handValue(h.cards) >= 21) h.done = true;
    }
    if (kind === "stand") h.done = true;
    if (kind === "double") {
      if (h.cards.length !== 2 || h.splitAces || !increase(r.id, h.bet)) return;
      h.bet *= 2;
      h.cards.push(draw(r));
      h.done = true;
    }
    if (kind === "split") {
      if (!canSplit(r) || !increase(r.id, h.bet)) return;
      splitHand(r);
    }
    sound("card");
    advance(r);
  };
  const busy = !!round && !round.finished,
    h = round?.hands[round.active];
  return (
    <>
      <div className="blackjack-stage">
        <div className="felt-label">
          {t("LUCKYVOID")}<span>{t("BLACKJACK PAYS 3 TO 2 · DEALER STANDS ON ALL 17")}</span>
        </div>
        <div className="dealer-hand">
          <small>
            {t("DEALER")}{t(" ")}
            {t(round && (round.finished || round.resolving)
              ? `· ${handValue(round.dealer)}`
              : "")}
          </small>
          <div className="cards-row">
            {t(round ? (
              round.dealer.map((c, i) => (
                <PlayingCard
                  key={i}
                  card={c}
                  hidden={i === 1 && !round.finished && !round.resolving}
                />
              ))
            ) : (
              <>
                <div className="playing-card card-back">✦</div>
                <div className="playing-card card-back">✦</div>
              </>
            ))}
          </div>
        </div>
        <div className="player-hands">
          {t(round ? (
            round.hands.map((hand, i) => (
              <div
                key={i}
                className={`player-hand ${busy && i === round.active ? "active-hand" : ""}`}
              >
                <div className="cards-row">
                  {hand.cards.map((c, j) => (
                    <PlayingCard key={j} card={c} />
                  ))}
                </div>
                <small>
                  {t(round.hands.length > 1 ? `HAND ${i + 1}` : "YOUR HAND")} ·{t(" ")}
                  <b>
                    {t(handValue(hand.cards) > 21
                      ? "BUST"
                      : handValue(hand.cards))}
                  </b>{t(" ")}
                  <Coin value={hand.bet} />
                </small>
              </div>
            ))
          ) : (
            <div className="empty-hand">{t("Your cards will be dealt here")}</div>
          ))}
        </div>
      </div>
      <ResultBanner text={text} payout={pay} />
      {t(busy && (
        <div className="blackjack-actions">
          <button
            disabled={round.resolving || h?.done}
            onClick={() => action("hit")}
          >
            <Plus size={17} />
            {t("Hit")}</button>
          <button
            disabled={round.resolving || h?.done}
            onClick={() => action("stand")}
          >
            <Hand size={17} />
            {t("Stand")}</button>
          <button
            disabled={
              round.resolving ||
              h?.done ||
              h?.cards.length !== 2 ||
              h?.splitAces ||
              (h?.bet ?? 0) > player.balance
            }
            onClick={() => action("double")}
          >
            <ChevronsUp size={17} />
            {t("Double")}</button>
          <button
            disabled={!canSplit(round) || (h?.bet ?? 0) > player.balance}
            onClick={() => action("split")}
          >
            <Copy size={17} />
            {t("Split")}</button>
        </div>
      ))}
      <div className="game-controls">
        <BetControl bet={bet} setBet={setBet} disabled={busy} />
        <button className="primary game-action" disabled={busy} onClick={deal}>
          {t(busy ? "Hand in progress…" : "Deal cards")}
        </button>
      </div>
      <Rules>
        <p>
          {t("Fresh shuffled six-deck shoe each round. Face cards count 10, aces 1 or 11. Beat the dealer without exceeding 21. Dealer checks for blackjack and stands on all 17, including soft 17.")}</p>
        <p>
          {t("Wins return 2× your bet; pushes return 1×. Natural blackjack returns 2.5× (3:2 profit) unless the dealer also has blackjack. Blackjack probability in a fresh shoe is about 4.75%. Return depends on your strategy.")}</p>
        <p>
          {t("Double on any two-card hand: add one bet, receive one card, then stand. Split equal-value cards up to four hands, adding one bet per split. Split aces get one card each and cannot be resplit. A split 21 pays as a regular win. No insurance or surrender. Even bets required for exact coin payouts.")}</p>
      </Rules>
    </>
  );
}
