import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Player, GameId, Settings } from "../types";
import {
  initialPlayer,
  loadPlayer,
  parsePlayer,
  settlePlayer,
  unlock,
  STORAGE_KEY,
} from "./store";
import { ACHIEVEMENTS } from "../utils/achievements";
import { dailyDate } from "../utils/games";
import { setLanguage } from "../utils/i18n";
import { useAudio } from "../hooks/useAudio";
interface Toast {
  id: string;
  text: string;
  kind: "success" | "error" | "achievement";
}
interface API {
  player: Player;
  toasts: Toast[];
  reserve: (g: GameId, bet: number) => string | null;
  increase: (id: string, amount: number) => boolean;
  settle: (
    id: string,
    payout: number,
    detail: string,
    meta?: Record<string, number>,
  ) => void;
  refund: (id: string) => void;
  daily: () => void;
  favorite: (id: GameId) => void;
  profile: (name: string, avatar: string) => void;
  settings: (s: Partial<Settings>) => void;
  reset: () => void;
  restore: (raw: string) => boolean;
  notify: (text: string, kind?: Toast["kind"]) => void;
  sound: (kind?: string) => void;
}
const Context = createContext<API | null>(null);
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState(() => {
    try {
      return loadPlayer(localStorage.getItem(STORAGE_KEY));
    } catch {
      return initialPlayer();
    }
  });
  const ref = useRef(player);
  const [toasts, setToasts] = useState<Toast[]>([]);
  setLanguage(player.settings.language);
  const sound = useAudio(player.settings);
  const notify = (text: string, kind: Toast["kind"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, text, kind }].slice(-4));
    setTimeout(() => setToasts((t) => t.filter((v) => v.id !== id)), 5000);
  };
  const commit = (p: Player, check = true) => {
    const result = check ? unlock(p) : { player: p, unlocked: [] };
    ref.current = result.player;
    setPlayer(result.player);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.player));
    } catch {
      notify(
        "Browser storage is unavailable. Progress lasts only in this tab.",
        "error",
      );
    }
    for (const id of result.unlocked) {
      const a = ACHIEVEMENTS.find((a) => a.id === id)!;
      notify(
        `${a.icon} ${a.name} unlocked · +${a.reward} coins`,
        "achievement",
      );
      sound("achievement");
    }
  };
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ref.current));
    } catch {}
  }, []);
  const reserve = (game: GameId, bet: number) => {
    const p = ref.current;
    if (
      p.pending.length &&
      (game !== "plinko" || p.pending.some((r) => r.game !== "plinko"))
    ) {
      notify("Finish your active round first.", "error");
      return null;
    }
    if (!Number.isInteger(bet) || bet < 10 || bet > 10000 || bet > p.balance) {
      notify("Choose a bet from 10 to 10,000 within your balance.", "error");
      return null;
    }
    const id = crypto.randomUUID();
    commit(
      {
        ...p,
        balance: p.balance - bet,
        pending: [...p.pending, { id, game, bet }],
        transactions: [
          {
            id: crypto.randomUUID(),
            time: Date.now(),
            amount: -bet,
            label: `${game}: round bet`,
          },
          ...p.transactions,
        ].slice(0, 200),
      },
      false,
    );
    sound("click");
    return id;
  };
  const increase = (id: string, amount: number) => {
    const p = ref.current;
    if (
      !p.pending.some((r) => r.id === id) ||
      !Number.isInteger(amount) ||
      amount <= 0 ||
      amount > p.balance
    ) {
      notify("Not enough coins for this action.", "error");
      return false;
    }
    commit(
      {
        ...p,
        balance: p.balance - amount,
        pending: p.pending.map((r) =>
          r.id === id ? { ...r, bet: r.bet + amount } : r,
        ),
        transactions: [
          {
            id: crypto.randomUUID(),
            time: Date.now(),
            amount: -amount,
            label: "Blackjack: additional bet",
          },
          ...p.transactions,
        ].slice(0, 200),
      },
      false,
    );
    return true;
  };
  const settle = (
    id: string,
    payout: number,
    detail: string,
    meta?: Record<string, number>,
  ) => {
    const p = ref.current,
      r = p.pending.find((r) => r.id === id);
    if (!r || !Number.isFinite(payout)) return;
    commit(
      settlePlayer(p, {
        id,
        game: r.game,
        bet: r.bet,
        payout,
        detail,
        meta,
        time: Date.now(),
      }),
    );
    if (payout > r.bet) sound("win");
  };
  const refund = (id: string) => {
    const p = ref.current,
      r = p.pending.find((r) => r.id === id);
    if (!r) return;
    commit(
      {
        ...p,
        balance: p.balance + r.bet,
        pending: p.pending.filter((r) => r.id !== id),
        transactions: [
          {
            id: crypto.randomUUID(),
            time: Date.now(),
            amount: r.bet,
            label: "Interrupted round refunded",
          },
          ...p.transactions,
        ].slice(0, 200),
      },
      false,
    );
  };
  const daily = () => {
    const p = ref.current;
    if (p.lastDaily === dailyDate()) {
      notify("Your next free reward is available tomorrow (UTC).", "error");
      return;
    }
    commit({
      ...p,
      balance: p.balance + 1000,
      lastDaily: dailyDate(),
      dailyClaims: p.dailyClaims + 1,
      transactions: [
        {
          id: crypto.randomUUID(),
          time: Date.now(),
          amount: 1000,
          label: "Daily free reward",
        },
        ...p.transactions,
      ].slice(0, 200),
    });
    notify("1,000 free VOID coins added. Enjoy your next round!");
    sound("win");
  };
  const api: API = {
    player,
    toasts,
    reserve,
    increase,
    settle,
    refund,
    daily,
    sound,
    notify,
    favorite: (id) => {
      const p = ref.current;
      commit(
        {
          ...p,
          favorites: p.favorites.includes(id)
            ? p.favorites.filter((v) => v !== id)
            : [...p.favorites, id],
        },
        false,
      );
    },
    profile: (name, avatar) =>
      commit(
        {
          ...ref.current,
          username: name.trim().slice(0, 24) || "Void Explorer",
          avatar,
        },
        false,
      ),
    settings: (s) => {
      if (s.sound === true || s.music === true) sound("unlock");
      commit(
        { ...ref.current, settings: { ...ref.current.settings, ...s } },
        false,
      );
    },
    restore: (raw) => {
      if (ref.current.pending.length) {
        notify("Finish your round before restoring progress.", "error");
        return false;
      }
      try {
        commit(parsePlayer(raw), false);
        notify("Your saved adventure is restored.");
        return true;
      } catch (error) {
        notify(
          error instanceof Error
            ? error.message
            : "Unable to read this backup.",
          "error",
        );
        return false;
      }
    },
    reset: () => {
      commit(initialPlayer(), false);
      notify("Progress reset. Your 10,000 welcome coins are ready.");
    },
  };
  return <Context.Provider value={api}>{children}</Context.Provider>;
}
export function usePlayer() {
  const context = useContext(Context);
  if (!context) throw Error("Player provider is missing");
  return context;
}
