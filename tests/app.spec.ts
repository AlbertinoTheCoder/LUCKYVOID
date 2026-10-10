import { test, expect, type Page } from "@playwright/test";
async function stored(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("luckyvoid.player.v1")!),
  );
}
async function fast(page: Page) {
  await page.addInitScript(() => {
    const key = "luckyvoid.player.v1",
      raw = localStorage.getItem(key);
    if (raw) {
      const p = JSON.parse(raw);
      p.settings.reducedMotion = true;
      localStorage.setItem(key, JSON.stringify(p));
    }
  });
  await page.goto("/");
  await expect(page.locator(".games-grid")).toBeVisible();
  await page.reload();
  await expect(page.locator(".games-grid")).toBeVisible();
}
async function play(page: Page, name: string) {
  await page.getByRole("button", { name: `Play ${name}`, exact: true }).click();
  await expect(page.locator(".play-panel")).toBeVisible();
}
async function complete(page: Page, n: number) {
  await expect.poll(async () => (await stored(page)).gamesPlayed).toBe(n);
  const p = await stored(page);
  expect(p.pending).toHaveLength(0);
  expect(p.balance).toBe(
    p.transactions.reduce(
      (sum: number, t: { amount: number }) => sum + t.amount,
      0,
    ),
  );
}
async function floor(page: Page) {
  await page.getByRole("button", { name: "Back to the floor" }).click();
  await expect(page.locator(".games-grid")).toBeVisible();
}
test("all twenty-one games settle through the shared wallet without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fast(page);
  await play(page, "NEON 777");
  await page.getByRole("button", { name: "Spin the reels" }).click();
  await complete(page, 1);
  await floor(page);
  await play(page, "VOID SPINS");
  await page.getByRole("button", { name: "Spin the reels" }).click();
  await complete(page, 2);
  await floor(page);
  await play(page, "GOLD RUSH");
  await page.getByRole("button", { name: "Spin the reels" }).click();
  await complete(page, 3);
  await floor(page);
  await play(page, "ROULETTE");
  await page.getByRole("button", { name: "Spin · red", exact: true }).click();
  await complete(page, 4);
  await floor(page);
  await play(page, "BLACKJACK");
  await page.getByRole("button", { name: "Deal cards", exact: true }).click();
  if ((await stored(page)).pending.length) {
    const stand = page.getByRole("button", { name: "Stand", exact: true });
    if (await stand.isEnabled()) await stand.click();
  }
  await complete(page, 5);
  await floor(page);
  await play(page, "MINES");
  await page.getByRole("button", { name: "Start exploring" }).click();
  const p = await stored(page);
  expect(p.pending).toHaveLength(1);
  for (let i = 1; i <= 25; i++) {
    if (!(await stored(page)).pending.length) break;
    await page.getByRole("button", { name: `Tile ${i}`, exact: true }).click();
    const collect = page.getByRole("button", { name: /Collect ·/ });
    if ((await collect.count()) && (await collect.isEnabled())) {
      await collect.click();
      break;
    }
  }
  await complete(page, 6);
  await floor(page);
  await play(page, "PLINKO");
  await page.getByRole("button", { name: "Drop a ball" }).click();
  await complete(page, 7);
  await floor(page);
  await play(page, "CRASH");
  await page.evaluate(() => {
    crypto.getRandomValues = <T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint32Array) a.fill(8388608);
      return a;
    };
  });
  await page.getByRole("button", { name: "Start flight" }).click();
  const collect = page.getByRole("button", { name: /Collect ·/ });
  if (await collect.count()) await collect.click();
  await complete(page, 8);
  expect((await stored(page)).achievements).toContain("all");
  await floor(page);
  await play(page, "DICE");
  await page.getByRole("button", { name: "Roll dice", exact: true }).click();
  await complete(page, 9);
  await floor(page);
  await play(page, "COIN FLIP");
  await page.getByRole("button", { name: "Flip coin", exact: true }).click();
  await complete(page, 10);
  await floor(page);
  await play(page, "KENO");
  await expect(page.getByRole("button", { name: "Draw numbers", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Quick pick", exact: true }).click();
  await page.getByRole("button", { name: "Draw numbers", exact: true }).click();
  await complete(page, 11);
  await floor(page);
  await play(page, "BACCARAT");
  await page.getByRole("button", { name: "Deal baccarat", exact: true }).click();
  await complete(page, 12);
  await floor(page);
  await play(page, "LUCKY WHEEL");
  await page.getByRole("button", { name: "Spin lucky wheel", exact: true }).click();
  await complete(page, 13);
  await floor(page);
  await play(page, "SCRATCH CARDS");
  await page.getByRole("button", { name: "Get scratch card", exact: true }).click();
  await complete(page, 14);
  await page.getByRole("button", { name: "Reveal all", exact: true }).click();
  await floor(page);
  await play(page, "VIDEO POKER");
  await page.getByRole("button", { name: "Deal poker hand", exact: true }).click();
  await page.getByRole("button", { name: "Draw replacement cards", exact: true }).click();
  await complete(page, 15);
  await floor(page);
  await play(page, "HIGHER / LOWER");
  await page.getByRole("button", { name: "Start higher / lower", exact: true }).click();
  const higher = page.getByRole("button", { name: /^Higher/ });
  if (await higher.isEnabled()) await higher.click();
  else await page.getByRole("button", { name: /^Lower/ }).click();
  await complete(page, 16);
  await floor(page);
  await play(page, "CARD WAR");
  await page.getByRole("button", { name: "Deal battle cards", exact: true }).click();
  await complete(page, 17);
  await floor(page);
  await play(page, "ROCK PAPER SCISSORS");
  await page.getByRole("button", { name: "Play your move", exact: true }).click();
  await complete(page, 18);
  await floor(page);
  await play(page, "MEMORY MATCH");
  await page.getByRole("button", { name: "Start memory challenge", exact: true }).click();
  await page.getByRole("button", { name: "Give up round", exact: true }).click();
  await complete(page, 19);
  await floor(page);
  await play(page, "TIC-TAC-TOE");
  await page.getByRole("button", { name: "Start tic-tac-toe", exact: true }).click();
  await page.getByRole("button", { name: "Give up round", exact: true }).click();
  await complete(page, 20);
  await floor(page);
  await play(page, "CODEBREAKER");
  await page.getByRole("button", { name: "Start codebreaker", exact: true }).click();
  await page.getByRole("button", { name: "Give up round", exact: true }).click();
  await complete(page, 21);
  expect(errors).toEqual([]);
});
test("daily rewards, favorites, profile and settings persist; reset requires confirmation", async ({
  page,
}) => {
  await fast(page);
  await page.getByRole("button", { name: /1,000 free VOID coins/ }).click();
  let p = await stored(page);
  expect(p.balance).toBe(11100);
  expect(p.dailyClaims).toBe(1);
  await expect(
    page.getByRole("button", { name: /Reward collected!/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Add NEON 777 to favorites" }).click();
  await page.getByRole("button", { name: "Open profile", exact: true }).click();
  await page.locator(".profile-card input").fill("Cosmic Test");
  await page.getByRole("button", { name: "Select 🦊 avatar" }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await page.reload();
  p = await stored(page);
  expect(p.username).toBe("Cosmic Test");
  expect(p.avatar).toBe("🦊");
  expect(p.favorites).toContain("neon");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("switch", { name: "Sound effects" }).click();
  await page.getByRole("switch", { name: "Arcade music" }).click();
  await page
    .getByRole("combobox", { name: "Animation quality" })
    .selectOption("low");
  await page.reload();
  p = await stored(page);
  expect(p.settings.sound).toBe(true);
  expect(p.settings.music).toBe(true);
  expect(p.settings.quality).toBe("low");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep my progress" }).click();
  expect((await stored(page)).username).toBe("Cosmic Test");
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page.getByRole("button", { name: "Yes, reset everything" }).click();
  expect((await stored(page)).balance).toBe(10000);
  expect((await stored(page)).gamesPlayed).toBe(0);
});
test("bet validation and navigation cannot interrupt an active round", async ({
  page,
}) => {
  await page.goto("/");
  await play(page, "NEON 777");
  await page.locator("#bet").fill("10001");
  await page.getByRole("button", { name: "Spin the reels" }).click();
  expect((await stored(page)).balance).toBe(10000);
  await expect(page.locator(".toast.error")).toBeVisible();
  await page.locator("#bet").fill("100");
  await page.getByRole("button", { name: "Spin the reels" }).click();
  await page.getByRole("button", { name: "Back to the floor" }).click();
  await expect(page.locator(".live-reels")).toBeVisible();
  await complete(page, 1);
  await page.reload();
  expect((await stored(page)).gamesPlayed).toBe(1);
});
test("a forced seven triple pays 50x and achievements exactly once", async ({
  page,
}) => {
  await fast(page);
  await play(page, "NEON 777");
  await page.evaluate(() => {
    crypto.getRandomValues = <T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint32Array) a.fill(5);
      return a;
    };
  });
  await page.getByRole("button", { name: "Spin the reels" }).click();
  await complete(page, 1);
  const p = await stored(page);
  expect(p.results[0].payout).toBe(5000);
  expect(p.achievements).toContain("seven");
  await page.getByRole("button", { name: "Spin the reels" }).click();
  await complete(page, 2);
  expect(
    (await stored(page)).achievements.filter((v: string) => v === "seven"),
  ).toHaveLength(1);
});
for (const viewport of [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
]) {
  test(`all pages and games fit ${viewport.width}×${viewport.height}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport, hasTouch: true });
    const page = await context.newPage();
    await page.goto("/");
    const overflow = async () => {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    };
    await overflow();
    if (viewport.width === 390 || viewport.width === 1440)
      await page.screenshot({
        path: `test-results/lobby-${viewport.width}.png`,
        fullPage: true,
      });
    for (const name of [
      "NEON 777",
      "BLACKJACK",
      "ROULETTE",
      "CRASH",
      "MINES",
      "PLINKO",
      "VOID SPINS",
      "GOLD RUSH",
      "DICE",
      "COIN FLIP",
      "KENO",
      "BACCARAT",
      "LUCKY WHEEL",
      "SCRATCH CARDS",
      "VIDEO POKER",
      "HIGHER / LOWER",
      "CARD WAR",
      "MEMORY MATCH",
      "TIC-TAC-TOE",
      "ROCK PAPER SCISSORS",
      "CODEBREAKER",
    ]) {
      await page
        .getByRole("button", { name: `Play ${name}`, exact: true })
        .tap();
      await expect(page.locator(".play-panel")).toBeVisible();
      await overflow();
      await page.getByRole("button", { name: "Back to the floor" }).tap();
      await expect(page.locator(".games-grid")).toBeVisible();
    }
    for (const name of [
      "Rewards",
      "My profile",
      "Activity",
      "Leaderboard",
      "Settings",
    ]) {
      if (viewport.width <= 700) {
        await page.getByRole("button", { name: "Open navigation" }).tap();
      }
      await page
        .locator(".sidebar")
        .getByRole("button", { name, exact: true })
        .tap();
      const titles: Record<string, string> = {
        Rewards: "Good things come to play.",
        "My profile": "Player profile",
        Activity: "Your activity",
        Leaderboard: "The stars of the void",
        Settings: "Make yourself at home.",
      };
      await expect(page.locator(".page-heading h1")).toHaveText(titles[name]);
      await overflow();
    }
    if (viewport.width <= 700) {
      await page
        .locator(".bottom-nav")
        .getByRole("button", { name: "Lobby", exact: true })
        .tap();
      await play(page, "MINES");
      await page.getByRole("button", { name: "Start exploring" }).tap();
      await page.getByRole("button", { name: "Tile 1", exact: true }).tap();
      if ((await stored(page)).pending.length)
        await page.getByRole("button", { name: /Collect ·/ }).tap();
      await expect.poll(async () => (await stored(page)).gamesPlayed).toBe(1);
      await overflow();
    }
    await context.close();
  });
}

test("page links survive refresh and history while rounds stay protected", async ({
  page,
}) => {
  await page.goto("/#/games/mines");
  await expect(page.locator(".mines-grid")).toBeVisible();
  await page.reload();
  await expect(page.locator(".mines-grid")).toBeVisible();
  await floor(page);
  await play(page, "PLINKO");
  await page.goBack();
  await expect(page.locator(".games-grid")).toBeVisible();
  await page.goForward();
  await expect(page.locator(".plinko-stage")).toBeVisible();
  await floor(page);
  await play(page, "MINES");
  await page.getByRole("button", { name: "Start exploring" }).click();
  await page.goBack();
  await expect(page.locator(".mines-grid")).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe("#/games/mines");
});
test("progress backups require review and leave progress intact on invalid input", async ({
  page,
}) => {
  await page.goto("/#/settings");
  const original = await stored(page);
  const backup = { ...original, username: "Restored Explorer", balance: 12345 };
  await page.locator("input[type=file]").setInputFiles({
    name: "progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByRole("dialog")).toContainText("Restored Explorer");
  expect((await stored(page)).username).toBe(original.username);
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  expect((await stored(page)).balance).toBe(12345);
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.locator(".toast.error")).toBeVisible();
  expect((await stored(page)).balance).toBe(12345);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  expect((await download).suggestedFilename()).toMatch(
    /^luckyvoid-progress-.*\.json$/,
  );
});
test("audio is muted by default and starts only when explicitly enabled", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const created: AudioContext[] = [];
    (window as any).__audio = created;
    window.AudioContext = class extends Native {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        created.push(this);
      }
    };
  });
  await page.goto("/#/settings");
  await expect(
    page.getByRole("switch", { name: "Sound effects" }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(
    page.getByRole("switch", { name: "Arcade music" }),
  ).toHaveAttribute("aria-checked", "false");
  await page.getByRole("heading", { name: "Make yourself at home." }).click();
  expect(await page.evaluate(() => (window as any).__audio.length)).toBe(0);
  await page.getByRole("switch", { name: "Arcade music" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__audio[0]?.state))
    .toBe("running");
  await page.getByRole("switch", { name: "Arcade music" }).click();
  await expect(
    page.getByRole("switch", { name: "Arcade music" }),
  ).toHaveAttribute("aria-checked", "false");
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Arcade music" }),
  ).toHaveAttribute("aria-checked", "false");
});
test("Plinko accepts overlapping balls with independent bets and settles each once", async ({
  page,
}) => {
  await page.goto("/#/games/plinko");
  await page.getByRole("button", { name: "Drop a ball", exact: true }).click();
  await page.locator("#bet").fill("250");
  await page.getByRole("button", { name: "Drop a ball", exact: true }).click();
  await page.locator("#bet").fill("50");
  await page.getByRole("button", { name: "Drop a ball", exact: true }).click();
  const pending = (await stored(page)).pending;
  expect(pending).toHaveLength(3);
  expect(pending.map((r: { bet: number }) => r.bet)).toEqual([100, 250, 50]);
  expect(new Set(pending.map((r: { id: string }) => r.id)).size).toBe(3);
  await expect(page.locator(".plinko-flight-count")).toContainText("3 balls");
  await expect(
    page.getByRole("button", { name: "Drop a ball", exact: true }),
  ).toBeEnabled();
  await complete(page, 3);
  expect(
    (await stored(page)).results
      .map((r: { bet: number }) => r.bet)
      .sort((a: number, b: number) => a - b),
  ).toEqual([50, 100, 250]);
  await expect(page.locator(".plinko-flight-count")).toContainText("Ready");
});

async function shoeWithTopCards(page: Page, ranks: number[]) {
  await page.evaluate((wanted) => {
    const deck = Array.from({ length: 312 }, (_, i) => ({
      rank: (i % 13) + 1,
      used: false,
    }));
    const choices: number[] = [];
    for (let i = 311; i > 0; i--) {
      const ordinal = 311 - i;
      const target =
        ordinal < wanted.length
          ? deck.findIndex((c, j) => j <= i && c.rank === wanted[ordinal])
          : 0;
      choices.push(target);
      [deck[i], deck[target]] = [deck[target], deck[i]];
    }
    let cursor = 0;
    crypto.getRandomValues = <T extends ArrayBufferView | null>(
      array: T,
    ): T => {
      if (array instanceof Uint32Array) array.fill(choices[cursor++] ?? 0);
      return array;
    };
  }, ranks);
}
test("blackjack split, stand, and double down account for every additional bet", async ({
  page,
}) => {
  await fast(page);
  await play(page, "BLACKJACK");
  await shoeWithTopCards(page, [8, 8, 10, 7, 9, 3, 5]);
  await page.getByRole("button", { name: "Deal cards", exact: true }).click();
  await page.getByRole("button", { name: "Split", exact: true }).click();
  expect((await stored(page)).pending[0].bet).toBe(200);
  await page.getByRole("button", { name: "Stand", exact: true }).click();
  await page.getByRole("button", { name: "Double", exact: true }).click();
  await complete(page, 1);
  const p = await stored(page);
  expect(p.results[0].bet).toBe(300);
  expect(p.results[0].payout).toBe(100);
  expect(p.balance).toBe(9900);
});
test("split aces receive one card each and split 21 pays a normal win", async ({
  page,
}) => {
  await fast(page);
  await play(page, "BLACKJACK");
  await shoeWithTopCards(page, [1, 1, 10, 7, 9, 10]);
  await page.getByRole("button", { name: "Deal cards", exact: true }).click();
  await page.getByRole("button", { name: "Split", exact: true }).click();
  await complete(page, 1);
  const p = await stored(page);
  expect(p.results[0].bet).toBe(200);
  expect(p.results[0].payout).toBe(400);
  expect(p.achievements).not.toContain("natural");
  await expect(page.locator(".player-hand")).toHaveCount(2);
});
test("instant crash loses only the reserved bet and disables collection", async ({
  page,
}) => {
  await fast(page);
  await play(page, "CRASH");
  await page.evaluate(() => {
    crypto.getRandomValues = <T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint32Array) a.fill(0);
      return a;
    };
  });
  await page.getByRole("button", { name: "Start flight", exact: true }).click();
  await complete(page, 1);
  expect((await stored(page)).results[0].payout).toBe(0);
  await expect(page.getByRole("button", { name: /Collect ·/ })).toHaveCount(0);
  await expect(page.locator(".result-banner")).toContainText("1.00×");
});

test("English is default and Italian changes the interface and persists", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await expect(
    page.getByRole("combobox", { name: "Language", exact: true }),
  ).toHaveValue("en");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("it");
  await expect(
    page.getByRole("heading", { name: "Mettiti comodo." }),
  ).toBeVisible();
  await expect(
    page.getByRole("switch", { name: "Effetti sonori", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Lingua", exact: true }),
  ).toHaveValue("it");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /Tutti i giochi/ })
    .click();
  await page
    .getByRole("button", { name: "Gioca a PLINKO", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Lancia una pallina", exact: true }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Impostazioni", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Lingua", exact: true })
    .selectOption("en");
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
});

test("language selection persists and the Italian profile fits a phone screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/settings");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("it");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  expect((await stored(page)).settings.language).toBe("it");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await page.locator(".header-avatar").click();
  await expect(page.locator(".profile-card")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("long player names and large balances fit the mobile lobby, profile and leaderboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await fast(page);
  await page.evaluate(() => {
    const key = "luckyvoid.player.v1";
    const p = JSON.parse(localStorage.getItem(key)!);
    p.balance += 100000000000;
    p.biggestWin = 100000000000;
    p.totalWon = 100000000000;
    p.transactions.unshift({
      id: "layout",
      time: Date.now(),
      label: "Layout fixture",
      amount: 100000000000,
    });
    localStorage.setItem(key, JSON.stringify(p));
  });
  await page.goto("/#/profile");
  await page.locator(".profile-card input").fill("W".repeat(24));
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  const check = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  await check();
  await page
    .locator(".bottom-nav")
    .getByRole("button", { name: "Lobby", exact: true })
    .click();
  await expect(page.locator(".hero")).toBeVisible();
  await check();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Leaderboard", exact: true })
    .click();
  await expect(page.locator(".podium")).toBeVisible();
  await check();
});

test("new games respect choices, settle exact payouts and preserve progress", async ({ page }) => {
  await fast(page);
  await page.evaluate(() => {
    crypto.getRandomValues = <T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint32Array) a.fill(0);
      return a;
    };
  });
  await play(page, "DICE");
  await page.getByRole("button", { name: "Roll dice", exact: true }).click();
  await complete(page, 1);
  expect((await stored(page)).results[0].payout).toBe(194);
  await page.getByRole("button", { name: "Roll over or equal", exact: true }).click();
  await page.getByRole("button", { name: "Roll dice", exact: true }).click();
  await complete(page, 2);
  expect((await stored(page)).results[0].payout).toBe(0);
  await floor(page);
  await play(page, "COIN FLIP");
  await page.getByRole("button", { name: "Flip coin", exact: true }).click();
  await complete(page, 3);
  expect((await stored(page)).results[0].payout).toBe(194);
  await page.getByRole("button", { name: "Tails", exact: true }).click();
  await page.getByRole("button", { name: "Flip coin", exact: true }).click();
  await complete(page, 4);
  expect((await stored(page)).results[0].payout).toBe(0);
  await floor(page);
  await play(page, "KENO");
  await page.getByRole("button", { name: "Quick pick", exact: true }).click();
  await expect(page.locator(".keno-grid .chosen")).toHaveCount(6);
  await page.getByRole("button", { name: "Draw numbers", exact: true }).click();
  await complete(page, 5);
  expect((await stored(page)).results[0].payout).toBe(50000);
  await expect(page.locator(".keno-grid .matched")).toHaveCount(6);
  await expect(page.locator(".keno-grid .drawn")).toHaveCount(10);
  await page.getByRole("button", { name: "Favorite", exact: true }).click();
  await page.reload();
  expect((await stored(page)).favorites).toContain("keno");
  expect((await stored(page)).results.slice(0, 5).map((r: { game: string }) => r.game)).toEqual(["keno", "coinflip", "coinflip", "dice", "dice"]);
});

test("baccarat ties refund, wheel settles, and scratch cards survive leaving unrevealed", async ({ page }) => {
  await fast(page);
  await page.evaluate(() => {
    crypto.getRandomValues = <T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint32Array) a.fill(0);
      return a;
    };
  });
  await play(page, "BACCARAT");
  await page.getByRole("button", { name: "Deal baccarat", exact: true }).click();
  await complete(page, 1);
  expect((await stored(page)).results[0].payout).toBe(100);
  await page.getByRole("button", { name: "Tie · 9×", exact: true }).click();
  await page.getByRole("button", { name: "Deal baccarat", exact: true }).click();
  await complete(page, 2);
  expect((await stored(page)).results[0].payout).toBe(900);
  await floor(page);
  await play(page, "LUCKY WHEEL");
  await page.getByRole("button", { name: "Spin lucky wheel", exact: true }).click();
  await complete(page, 3);
  expect((await stored(page)).results[0].payout).toBe(0);
  await floor(page);
  await play(page, "SCRATCH CARDS");
  await page.getByRole("button", { name: "Get scratch card", exact: true }).click();
  await complete(page, 4);
  expect((await stored(page)).results[0].payout).toBe(400);
  await expect(page.getByRole("button", { name: "Get scratch card", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal panel 1", exact: true }).click();
  await expect(page.locator(".scratch-tiles .revealed")).toHaveCount(1);
  await page.getByRole("button", { name: "Reveal all", exact: true }).click();
  await expect(page.locator(".scratch-tiles .revealed")).toHaveCount(3);
  await page.getByRole("button", { name: "Get scratch card", exact: true }).click();
  await complete(page, 5);
  const balance = (await stored(page)).balance;
  await page.reload();
  expect((await stored(page)).balance).toBe(balance);
  expect((await stored(page)).results[0].payout).toBe(400);
  expect((await stored(page)).transactions[0].label).not.toBe("Interrupted round refunded");
});

test("seven card and skill games honor player choices and exact winning payouts", async ({ page }) => {
  await fast(page);
  const entropy = async (values: number[]) => page.evaluate(values => {
    let index = 0;
    crypto.getRandomValues = <T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint32Array) a.fill(values[index++] ?? 0);
      return a;
    };
  }, values);
  await entropy([]);
  await play(page, "VIDEO POKER");
  await page.getByRole("button", { name: "Deal poker hand", exact: true }).click();
  await expect(page.locator(".poker-hand")).toBeVisible();
  for (let n=1;n<=5;n++) await page.getByRole("button", { name: `Hold card ${n}`, exact: true }).click();
  await expect(page.locator(".poker-hand .held")).toHaveCount(5);
  await page.getByRole("button", { name: "Draw replacement cards", exact: true }).click();
  await complete(page, 1);
  expect((await stored(page)).results[0].payout).toBe(5000);
  await floor(page);
  await play(page, "HIGHER / LOWER");
  await entropy([6,7]);
  await page.getByRole("button", { name: "Start higher / lower", exact: true }).click();
  await page.getByRole("button", { name: /^Higher/ }).click();
  await complete(page, 2);
  expect((await stored(page)).results[0].payout).toBe(210);
  await floor(page);
  await entropy([]);
  await play(page, "CARD WAR");
  await page.getByRole("button", { name: "Deal battle cards", exact: true }).click();
  await complete(page, 3);
  expect((await stored(page)).results[0].payout).toBe(100);
  await floor(page);
  await play(page, "ROCK PAPER SCISSORS");
  await page.getByRole("button", { name: "Paper", exact: false }).click();
  await page.getByRole("button", { name: "Play your move", exact: true }).click();
  await complete(page, 4);
  expect((await stored(page)).results[0].payout).toBe(190);
  await floor(page);
  await play(page, "MEMORY MATCH");
  await page.getByRole("button", { name: "Start memory challenge", exact: true }).click();
  await page.getByRole("button", { name: "Memory tile 1", exact: true }).click();
  await page.getByRole("button", { name: "Memory tile 2", exact: true }).click();
  await page.getByRole("button", { name: "Continue matching", exact: true }).click();
  for (let n=1;n<=8;n++) {
    await page.getByRole("button", { name: `Memory tile ${n}`, exact: true }).click();
    await page.getByRole("button", { name: `Memory tile ${n+8}`, exact: true }).click();
  }
  await complete(page, 5);
  expect((await stored(page)).results[0].payout).toBe(200);
  await expect(page.locator(".memory-board .matched")).toHaveCount(16);
  await floor(page);
  await play(page, "TIC-TAC-TOE");
  await page.getByRole("button", { name: "Start tic-tac-toe", exact: true }).click();
  for (const n of [1,5,9]) await page.getByRole("button", { name: `Square ${n}`, exact: true }).click();
  await complete(page, 6);
  expect((await stored(page)).results[0].payout).toBe(200);
  await floor(page);
  await play(page, "CODEBREAKER");
  await page.getByRole("button", { name: "Start codebreaker", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Your guess", exact: true }).fill("50");
  await page.getByRole("button", { name: "Check code", exact: true }).click();
  await expect(page.locator(".code-history")).toContainText("Go lower");
  await expect(page.getByRole("button", { name: "Check code", exact: true })).toBeDisabled();
  await page.getByRole("spinbutton", { name: "Your guess", exact: true }).fill("1");
  await page.getByRole("button", { name: "Check code", exact: true }).click();
  await complete(page, 7);
  expect((await stored(page)).results[0].payout).toBe(150);
  await page.reload();
  expect((await stored(page)).gamesPlayed).toBe(7);
  expect((await stored(page)).pending).toHaveLength(0);
});
