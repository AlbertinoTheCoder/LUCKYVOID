import italian from "./italian.json";
export type Language = "en" | "it";
let language: Language = "en";
export function setLanguage(value: Language) {
  language = value;
}
export function translate(text: string, selected: Language): string {
  if (selected === "en") return text;
  const dictionary: Record<string, string> = italian;
  if (dictionary[text]) return dictionary[text];
  const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
    [
      /^(\d+) balls? in flight · drop another anytime$/,
      (m) => `${m[1]} palline in volo · lanciane un’altra quando vuoi`,
    ],
    [/^Level (\d+)$/, (m) => `Livello ${m[1]}`],
    [/^HAND (\d+)$/, (m) => `MANO ${m[1]}`],
    [/^Play (.+)$/, (m) => `Gioca a ${m[1]}`],
    [/^Add (.+) to favorites$/, (m) => `Aggiungi ${m[1]} ai preferiti`],
    [/^Remove (.+) from favorites$/, (m) => `Rimuovi ${m[1]} dai preferiti`],
    [/^Select (.+) avatar$/, (m) => `Scegli l’avatar ${m[1]}`],
    [
      /^Collected at (.+)×\. Nice flight\.$/,
      (m) => `Riscosso a ${m[1]}×. Bel volo.`,
    ],
    [/^Round stopped at (.+)×\.$/, (m) => `Il volo si è fermato a ${m[1]}×.`],
    [
      /^Landed on (.+)× · (.+) risk\.$/,
      (m) => `Arrivata su ${m[1]}× · rischio ${translate(m[2], selected)}.`,
    ],
    [
      /^Tile (\d+)(.*)$/,
      (m) =>
        `Casella ${m[1]}${m[2].replace("gem", "gemma").replace("mine", "mina")}`,
    ],
    [/^Spin · (.+)$/, (m) => `Gira · ${translate(m[1], selected)}`],
    [
      /^Eight-row Plinko board with (\d+) falling balls$/,
      (m) => `Tabellone Plinko con otto file e ${m[1]} palline in caduta`,
    ],
    [
      /^(\d+)× payout · (.+)$/,
      (m) =>
        `Vincita ${m[1]}× · ${m[2] === "A little magic!" ? "Un po’ di magia!" : "Puntata restituita."}`,
    ],
    [
      /^Collected (\d+) gems at (.+)×\.$/,
      (m) => `Riscosse ${m[1]} gemme a ${m[2]}×.`,
    ],
    [
      /^(\d+) safe tiles? · collect or explore another\.$/,
      (m) => `${m[1]} caselle sicure · riscuoti o esplorane un’altra.`,
    ],
    [/^Achievement: (.+)$/, (m) => `Obiettivo: ${translate(m[1], selected)}`],
    [/^(.+): round bet$/, (m) => `${m[1]}: puntata`],
    [/^Blackjack: additional bet$/, () => `Blackjack: puntata aggiuntiva`],
    [
      /^Balance (.+) VOID coins\. View activity\.$/,
      (m) => `Saldo ${m[1]} monete VOID. Visualizza attività.`,
    ],
  ];
  for (const [pattern, replacement] of patterns) {
    const match = text.match(pattern);
    if (match) return replacement(match);
  }
  return text;
}
export function t<T>(value: T): T {
  return (typeof value === "string" ? translate(value, language) : value) as T;
}
