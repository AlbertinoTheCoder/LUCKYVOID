# LUCKYVOID

A free virtual arcade built with React, TypeScript, and Vite. Fourteen games use fictional VOID coins, with browser-saved profiles, achievements, rewards, and activity history.

## Development

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

Game and player pages use hash links, so refreshing or using browser history works on static hosting. Interrupted rounds are refunded when saved progress is loaded.

In Settings, export a JSON backup or import one after reviewing the profile. Importing replaces the current browser's saved progress. No accounts, purchases, cash-outs, or multiplayer services are required.

## Launch in GitHub Codespaces

Use Node.js **22.12 or newer** (Node 24 recommended):

```bash
npm install
npm run dev
```

Vite listens on **0.0.0.0:5173**. In Codespaces, open the **Ports** panel, forward **5173** if it isn't listed, and select **Open in Browser** / the globe icon. Open that forwarded HTTPS URL on your phone or tablet too. Keep the forwarded port private unless you want to share it.

`npm run build` creates the static `dist/` output. `npm run preview` serves it on port **4173**. No API keys, paid services, or external database are required.

## Features

- Original dark casino artwork, purple/gold accents, animated lobby, responsive game cards, search, categories, recent games, and favorites.
- Fourteen playable games: Baccarat, Lucky Wheel, Scratch Cards, Dice, Keno, Coin Flip, NEON 777, VOID SPINS, GOLD RUSH, Blackjack, European Roulette, Crash, Mines, and canvas Plinko.
- 10,000 starting coins; free daily 1,000-coin rewards; 24 automatic achievements with one-time rewards; animated balance and transaction history.
- Editable player name, eight avatars, XP/levels, lifetime statistics, and local leaderboards with explicitly simulated demo players.
- Mobile bottom navigation, scrolling landscape sidebar, touch controls, safe-area padding, keyboard access, and reset/import confirmation dialogs.
- Synthesized effects and chaotic arcade music in 4/4, enabled by default after the first click or tap; persistent reduced-motion and animation-quality settings.
- English (default) and Italian interfaces, saved in Settings.
- Up to 20 Plinko balls in flight with independent bets and payouts.
- JSON progress export/import, persistent browser storage, and English/Italian language selection.

## Rules and probabilities

Rules and payout tables are visible within every game. Baccarat uses independent rank draws and standard third-card rules, with Player/Banker/Tie bets. Lucky Wheel has twelve equal-probability pockets with 95.83% return. Scratch Cards have three independent symbols, pay matching triples, and have 93.75% return; their results settle at purchase. Dice supports roll-under and roll-over-or-equal targets with a return of at most 97%. Coin Flip pays 1.94× on a 50/50 match. Keno draws 10 unique numbers from 40 against 6 picks, paying 4×/12×/70×/500× for 3/4/5/6 matches. Payouts include the original bet and round down to whole coins. The three-reel slot games have 85.65% theoretical return; five-reel VOID SPINS has 88.73%. European roulette uses 37 equally likely pockets and 97.30% return. Mines uses exact survival probabilities with a 3% margin; Crash uses an independent multiplier survival model with a 3% instant-stop chance. Plinko samples eight independent 50/50 bounces and normalizes risk tables to at most 96% return. Blackjack uses a fresh six-deck shoe, stands on all 17, pays natural blackjack 3:2, and supports double down and up to four split hands. Split aces receive one card each. Return depends on strategy.

Outcomes use browser `crypto.getRandomValues` with unbiased rejection sampling. Animations do not determine results. These probabilities describe long-run expectations; they do not guarantee a particular player's outcome.

## Browser testing

With the development server running:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

To test production instead, run `npm run preview` and set `LUCKYVOID_TEST_URL=http://127.0.0.1:4173` for the browser test command. Unit tests enumerate every slot/roulette outcome and verify blackjack, Mines/Plinko probability models, wallet settlement, achievements, persistence, and navigation. Browser tests play each game, reconcile wallet transactions, test saving/resetting/restoring, and check touch layouts and horizontal overflow at phone, landscape, tablet, and desktop sizes.

## Project structure

`src/components` contains reusable controls and casino illustrations; `src/pages` contains the lobby and player views; `src/games` separates probability/rule engines from the playable interfaces; `src/state` manages the persistent wallet; `src/hooks` implements audio; `src/utils` contains achievements, navigation, and the replaceable leaderboard source; `src/types` defines shared contracts; `src/styles` contains the responsive visual system.

## Limitations

All VOID coins are fictional, with no monetary value, purchases, transfers, cash-outs, or prizes. Progress belongs to one browser/origin and can be edited locally; there is no authentication, cloud sync, or live multiplayer. Use one tab at a time. The latest 500 rounds and 200 wallet transactions are retained; lifetime totals remain. Interrupted rounds refund reserved bets on restore, which is a forgiving local arcade recovery policy rather than tamper-resistant accounting. Plinko uses a sampled binomial path with physics-inspired animation. Responsive and touch checks use Chromium emulation; physical iPhone/Android and Safari testing remains advisable.
