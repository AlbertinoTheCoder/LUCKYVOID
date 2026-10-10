import { makeDeck, handValue, blackjackReturn, type Card } from "./logic";
export interface BJHand {
  cards: Card[];
  bet: number;
  done: boolean;
  split: boolean;
  splitAces: boolean;
}
export interface BJRound {
  id: string;
  deck: Card[];
  dealer: Card[];
  hands: BJHand[];
  active: number;
  finished: boolean;
  resolving: boolean;
}
export const draw = (r: BJRound) => {
  const card = r.deck.pop();
  if (!card) throw Error("Deck exhausted");
  return card;
};
export function newBlackjack(id: string, bet: number): BJRound {
  const r: BJRound = {
    id,
    deck: makeDeck(),
    dealer: [],
    hands: [{ cards: [], bet, done: false, split: false, splitAces: false }],
    active: 0,
    finished: false,
    resolving: false,
  };
  r.hands[0].cards = [draw(r), draw(r)];
  r.dealer = [draw(r), draw(r)];
  return r;
}
export const natural = (r: BJRound) =>
  r.hands.length === 1 &&
  !r.hands[0].split &&
  r.hands[0].cards.length === 2 &&
  handValue(r.hands[0].cards) === 21;
export const dealerNatural = (r: BJRound) =>
  r.dealer.length === 2 && handValue(r.dealer) === 21;
export function finishDealer(r: BJRound) {
  if (
    !dealerNatural(r) &&
    r.hands.some((h) => handValue(h.cards) <= 21) &&
    !natural(r)
  ) {
    while (handValue(r.dealer) < 17) r.dealer.push(draw(r));
  }
  r.finished = true;
  r.resolving = false;
  return r.hands.reduce(
    (p, h) => p + blackjackReturn(h.cards, r.dealer, h.bet, !h.split),
    0,
  );
}
export function canSplit(r: BJRound) {
  const h = r.hands[r.active];
  return (
    !r.finished &&
    !r.resolving &&
    !h.done &&
    !h.splitAces &&
    h.cards.length === 2 &&
    Math.min(h.cards[0].rank, 10) === Math.min(h.cards[1].rank, 10) &&
    r.hands.length < 4
  );
}
export function splitHand(r: BJRound) {
  const h = r.hands[r.active],
    aces = h.cards[0].rank === 1;
  const first: BJHand = {
      cards: [h.cards[0], draw(r)],
      bet: h.bet,
      done: aces,
      split: true,
      splitAces: aces,
    },
    second: BJHand = {
      cards: [h.cards[1], draw(r)],
      bet: h.bet,
      done: aces,
      split: true,
      splitAces: aces,
    };
  first.done = first.done || handValue(first.cards) === 21;
  second.done = second.done || handValue(second.cards) === 21;
  r.hands.splice(r.active, 1, first, second);
}
