import { useRef, useState } from "react";
import type { GameId } from "../types";
import { usePlayer } from "../state/PlayerContext";
import { BetControl, ResultBanner, Rules } from "../components/UI";
import { t } from "../utils/i18n";
import { randomInt, shuffle } from "./logic";
import { POKER_PAY, SUITS, pokerDeck, pokerLabel, pokerResult, highLowChance, highLowMultiplier, nextHighLowCard, rpsOutcome, ticTacToeResult, type PokerCard, type Gesture } from "./cardLogic";

function useRound(game: GameId, initial: string) {
  const { reserve, settle } = usePlayer();
  const run = useRef<{id: string; bet: number} | null>(null);
  const [bet, setBet] = useState(100), [active, setActive] = useState(false), [payout, setPayout] = useState(0), [message, setMessage] = useState(initial);
  const start = () => {
    if (run.current) return false;
    const id = reserve(game, bet); if (!id) return false;
    run.current = { id, bet }; setActive(true); setPayout(0); return true;
  };
  const finish = (multiplier: number, detail: string) => {
    const r = run.current; if (!r) return;
    run.current = null;
    const pay = Math.floor(r.bet * multiplier);
    settle(r.id, pay, detail, { multiplier }); setPayout(pay); setMessage(detail); setActive(false);
  };
  return { bet, setBet, active, payout, message, setMessage, start, finish, run };
}
type Round = ReturnType<typeof useRound>;
function ChallengeControls({ round, label, start }: { round: Round; label: string; start: () => void }) {
  return <><ResultBanner text={round.message} payout={round.payout}/><div className="game-controls"><BetControl bet={round.bet} setBet={round.setBet} disabled={round.active}/>{round.active ? <button className="secondary game-action" onClick={() => round.finish(0, "Round ended without a payout.")}>{t("Give up round")}</button> : <button className="primary game-action" onClick={start}>{t(label)}</button>}</div></>;
}
function PlayingCard({ card }: { card: PokerCard | null }) {
  return <span className={`challenge-card ${card && [1,3].includes(card.suit) ? "red-card" : ""}`}><b>{card ? pokerLabel(card.rank) : "?"}</b><span>{card ? SUITS[card.suit] : "✦"}</span></span>;
}

export function VideoPoker() {
  const round = useRound("poker", "Keep your best cards. Draw for a winning hand.");
  const [hand, setHand] = useState<PokerCard[]>([]), [held, setHeld] = useState<number[]>([]);
  const deck = useRef<PokerCard[]>([]);
  const start = () => { if (!round.start()) return; deck.current = pokerDeck(); setHand(deck.current.splice(0,5)); setHeld([]); round.setMessage("Select cards to hold, then draw once."); };
  const draw = () => {
    if (!round.run.current) return;
    const final = hand.map((card, n) => held.includes(n) ? card : deck.current.shift()!);
    const result = pokerResult(final); setHand(final); round.finish(result.multiplier, result.name);
  };
  return <>
    <div className="poker-hand">{Array.from({length:5}, (_, n) => <button key={n} disabled={!round.active} aria-label={`${t("Hold card")} ${n+1}`} aria-pressed={held.includes(n)} className={held.includes(n) ? "held" : ""} onClick={() => setHeld(values => values.includes(n) ? values.filter(v => v !== n) : [...values,n])}><PlayingCard card={hand[n] ?? null}/><small>{t(held.includes(n) ? "HELD" : "HOLD")}</small></button>)}</div>
    {round.active && <button className="primary challenge-main-action" onClick={draw}>{t("Draw replacement cards")}</button>}
    <div className="poker-paytable">{POKER_PAY.map(p => <span key={p.name}>{t(p.name)}<b>{p.multiplier}×</b></span>)}</div>
    <ChallengeControls round={round} label="Deal poker hand" start={start}/>
    <Rules><p>{t("Five cards are dealt from a shuffled 52-card deck. Hold any cards and replace the rest once from the remaining deck. Aces are high, or low in A–2–3–4–5. Only a pair of jacks, queens, kings or aces pays for a single pair. The table shows total payouts including your bet. Return depends on your hold strategy.")}</p></Rules>
  </>;
}

export function HigherLower() {
  const round = useRound("hilo", "Read the card. Choose your next move.");
  const [card, setCard] = useState(8), [next, setNext] = useState<number | null>(null), [direction, setDirection] = useState<"higher" | "lower" | null>(null);
  const start = () => { if (!round.start()) return; setCard(nextHighLowCard()); setNext(null); setDirection(null); round.setMessage("Will the next card be higher or lower?"); };
  const choose = (side: "higher" | "lower") => {
    if (!round.run.current || !highLowChance(card, side)) return;
    const value = nextHighLowCard(), win = side === "higher" ? value > card : value < card;
    setNext(value); setDirection(side); round.finish(win ? highLowMultiplier(card, side) : 0, win ? "Good read. Your prediction wins!" : "The prediction missed. Ties also lose.");
  };
  const convert = (rank: number): PokerCard => ({ rank: rank === 14 ? 1 : rank, suit: 0 });
  return <>
    <div className="hilo-cards"><div><small>{t("CURRENT CARD")}</small><PlayingCard card={convert(card)}/></div><b>→</b><div><small>{t("NEXT CARD")}</small><PlayingCard card={next === null ? null : convert(next)}/></div></div>
    <div className="quick-options">{(["higher","lower"] as const).map(side => <button key={side} className={`secondary ${direction === side ? "selected" : ""}`} disabled={!round.active || !highLowChance(card,side)} onClick={() => choose(side)}>{t(side === "higher" ? "Higher" : "Lower")}<small>{(highLowChance(card,side)*100).toFixed(2)}% · {highLowMultiplier(card,side).toFixed(2)}×</small></button>)}</div>
    <ChallengeControls round={round} label="Start higher / lower" start={start}/>
    <Rules><p>{t("Each card is an independent, equally likely rank from 2 to Ace. Ace is highest. Choose strictly higher or lower; ties lose. Impossible choices are disabled. Win chance is the count of winning ranks divided by 13. Payout multiplier = 0.97 ÷ win chance, rounded down to two decimals. Expected return is at most 97%.")}</p></Rules>
  </>;
}

export function War() {
  const round = useRound("war", "One card each. The higher rank wins.");
  const [cards,setCards] = useState<number[]>([]);
  const start = () => {
    if (!round.start()) return;
    const player = nextHighLowCard(), dealer = nextHighLowCard(); setCards([player,dealer]);
    round.finish(player === dealer ? 1 : player > dealer ? 1.94 : 0, player === dealer ? "Equal ranks. Your bet is returned." : player > dealer ? "Your card wins the battle!" : "The dealer wins this battle.");
  };
  return <>
    <div className="hilo-cards">{["YOUR CARD","DEALER CARD"].map((label,n) => <div key={label}><small>{t(label)}</small><PlayingCard card={cards[n] ? {rank: cards[n] === 14 ? 1 : cards[n], suit:n} : null}/></div>)}</div>
    <ChallengeControls round={round} label="Deal battle cards" start={start}/>
    <Rules><p>{t("Two independent ranks from 2 to Ace are drawn, each rank equally likely. Ace is highest. Higher wins 1.94×; equal ranks refund your bet. Win and loss chances are each 6/13; tie chance is 1/13. Expected return is 97.23% before whole-coin rounding.")}</p></Rules>
  </>;
}

export function RockPaperScissors() {
  const round = useRound("rps", "Pick your move. Challenge the void.");
  const [choice,setChoice] = useState<Gesture>("rock"), [opponent,setOpponent] = useState<Gesture | null>(null);
  const icons = {rock:"✊",paper:"✋",scissors:"✌"};
  const start = () => {
    if (!round.start()) return;
    const next = (["rock","paper","scissors"] as const)[randomInt(3)], outcome = rpsOutcome(choice,next); setOpponent(next);
    round.finish(outcome === "draw" ? 1 : outcome === "win" ? 1.9 : 0, outcome === "draw" ? "Same move. Your bet returns." : outcome === "win" ? "Your move wins!" : "The void wins this match.");
  };
  return <>
    <div className="rps-stage"><div><span>{icons[choice]}</span><small>{t("YOUR MOVE")}</small></div><b>VS</b><div><span>{opponent ? icons[opponent] : "?"}</span><small>{t("VOID MOVE")}</small></div></div>
    <div className="quick-options">{(["rock","paper","scissors"] as const).map(move => <button key={move} className={`secondary ${choice === move ? "selected" : ""}`} aria-pressed={choice === move} onClick={() => {setChoice(move); setOpponent(null);}}>{icons[move]} {t(move === "rock" ? "Rock" : move === "paper" ? "Paper" : "Scissors")}</button>)}</div>
    <ChallengeControls round={round} label="Play your move" start={start}/>
    <Rules><p>{t("Rock beats scissors, scissors beat paper, paper beats rock. The opponent chooses uniformly and independently. A win pays 1.9×, a draw returns your bet, and a loss pays zero. Each has a 1/3 chance. Expected return is 96.67% before rounding.")}</p></Rules>
  </>;
}

export function MemoryMatch() {
  const round = useRound("memory", "Remember the symbols. Find eight pairs.");
  const [cards,setCards] = useState<number[]>([]), [visible,setVisible] = useState<number[]>([]), [matched,setMatched] = useState<number[]>([]), [turns,setTurns] = useState(0);
  const picks = useRef<number[]>([]), matches = useRef<number[]>([]), turnCount = useRef(0);
  const symbols = ["☀","☾","✦","◆","♠","♥","♣","♦"];
  const start = () => {if (!round.start()) return; setCards(shuffle(Array.from({length:16},(_,n)=>n%8))); setVisible([]); setMatched([]); setTurns(0); picks.current=[]; matches.current=[]; turnCount.current=0; round.setMessage("Find all eight pairs in sixteen turns.");};
  const reveal = (n: number) => {
    if (!round.run.current || picks.current.length >= 2 || picks.current.includes(n) || matches.current.includes(n)) return;
    picks.current.push(n); setVisible([...picks.current]);
    if (picks.current.length === 2) {
      turnCount.current++; setTurns(turnCount.current);
      if (cards[picks.current[0]] === cards[n]) {matches.current.push(...picks.current); setMatched([...matches.current]); picks.current=[]; setVisible([]);}
      if (matches.current.length === 16) round.finish(2,"Eight pairs found. Memory mastered!");
      else if (turnCount.current >= 16) round.finish(0,"Sixteen turns used. Try a fresh board.");
    }
  };
  return <>
    <div className="challenge-heading"><strong>{t("MATCHED PAIRS")} {matched.length/2}/8</strong><span>{t("TURNS")} {turns}/16</span></div>
    <div className="memory-board">{Array.from({length:16},(_,n)=><button key={n} className={matched.includes(n) ? "matched" : ""} aria-label={`${t("Memory tile")} ${n+1}`} disabled={!round.active || picks.current.length >= 2 || visible.includes(n) || matched.includes(n)} onClick={()=>reveal(n)}>{visible.includes(n) || matched.includes(n) || (!round.active && cards.length > 0) ? symbols[cards[n]] : "?"}</button>)}</div>
    {round.active && visible.length === 2 && <button className="secondary challenge-main-action" onClick={()=>{picks.current=[]; setVisible([]);}}>{t("Continue matching")}</button>}
    <ChallengeControls round={round} label="Start memory challenge" start={start}/>
    <Rules><p>{t("Sixteen shuffled tiles hide eight pairs. Reveal two per turn. Matches stay visible; after a miss, continue to hide both tiles. Find every pair within sixteen turns to receive 2× your bet. Otherwise the bet is lost. Return depends on memory and choices; there is no fixed win probability.")}</p></Rules>
  </>;
}

export function TicTacToe() {
  const round = useRound("tictactoe", "Three in a row. Outthink the void.");
  const [board,setBoard] = useState<string[]>(Array(9).fill(""));
  const cells = useRef<string[]>(Array(9).fill(""));
  const start = () => {if (!round.start()) return; cells.current=Array(9).fill(""); setBoard([...cells.current]); round.setMessage("You are X. Choose a square.");};
  const move = (n: number) => {
    if (!round.run.current || cells.current[n]) return;
    const next = [...cells.current]; next[n]="X";
    let result = ticTacToeResult(next);
    if (!result) {const empty = next.flatMap((v,i)=>v ? [] : [i]); next[empty[randomInt(empty.length)]]="O"; result = ticTacToeResult(next);}
    cells.current=next; setBoard(next);
    if (result) round.finish(result === "X" ? 2 : result === "draw" ? 1 : 0, result === "X" ? "Three in a row. You win!" : result === "draw" ? "A draw. Your bet returns." : "The void made three in a row.");
  };
  return <>
    <div className="ttt-board">{board.map((value,n)=><button key={n} aria-label={`${t("Square")} ${n+1}${value ? `, ${value}` : ""}`} disabled={!round.active || !!value} className={value === "X" ? "player-mark" : ""} onClick={()=>move(n)}>{value || "·"}</button>)}</div>
    <ChallengeControls round={round} label="Start tic-tac-toe" start={start}/>
    <Rules><p>{t("You play X and move first. The opponent plays O and chooses a random empty square after each move. Make three in a row, column or diagonal to win 2×. A full board with no winner returns your bet; an opponent win pays zero. Return depends on your strategy.")}</p></Rules>
  </>;
}

export function Codebreaker() {
  const round = useRound("codebreaker", "A hidden number. Six chances to find it.");
  const secret = useRef(1), tries = useRef<number[]>([]);
  const [guess,setGuess] = useState(50), [history,setHistory] = useState<{value:number;clue:string}[]>([]);
  const start = () => {if (!round.start()) return; secret.current=randomInt(100)+1; tries.current=[]; setHistory([]); setGuess(50); round.setMessage("Find the secret number from 1 to 100.");};
  const submit = () => {
    if (!round.run.current || !Number.isInteger(guess) || guess < 1 || guess > 100 || tries.current.includes(guess)) return;
    tries.current.push(guess);
    const clue = guess === secret.current ? "Unlocked!" : guess < secret.current ? "Go higher" : "Go lower";
    setHistory(values=>[...values,{value:guess,clue}]);
    if (guess === secret.current) round.finish(1.5,"Code cracked. Well played!");
    else if (tries.current.length === 6) round.finish(0,`Secret number: ${secret.current}`);
    else round.setMessage(clue);
  };
  return <>
    <div className="code-stage"><strong>{!round.active && history.length ? String(secret.current).padStart(3,"0") : "???"}</strong><span>{t("ATTEMPTS")} {history.length}/6</span></div>
    <form className="code-input" onSubmit={e=>{e.preventDefault();submit();}}><label htmlFor="code-guess">{t("Your guess")}</label><input id="code-guess" type="number" min="1" max="100" value={guess} disabled={!round.active} onChange={e=>setGuess(Number(e.target.value))}/><button type="submit" className="primary" disabled={!round.active || !Number.isInteger(guess) || guess < 1 || guess > 100 || tries.current.includes(guess)}>{t("Check code")}</button></form>
    <div className="code-history">{history.map(h=><span key={h.value}><b>{h.value}</b>{t(h.clue)}</span>)}</div>
    <ChallengeControls round={round} label="Start codebreaker" start={start}/>
    <Rules><p>{t("A uniformly random secret integer from 1 to 100 stays fixed for the round. You have six different guesses. Each miss tells you to go higher or lower. A correct guess pays 1.5×; six misses lose the bet. An optimal six-guess search can cover at most 63 numbers, giving at most 63% win chance and 94.5% expected return before rounding.")}</p></Rules>
  </>;
}
