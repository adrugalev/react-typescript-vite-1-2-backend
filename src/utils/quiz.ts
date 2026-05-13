import type { Country } from "../data/countries";

export const ROUND_LENGTH = 10;
export const OPTIONS_COUNT = 4;
export const HARD_ROUND_LENGTH = 15;
export const HARD_OPTIONS_COUNT = 6;

const RARE_COUNTRY_CODES = new Set([
  "AD",
  "AG",
  "BB",
  "BH",
  "BJ",
  "BN",
  "BT",
  "CV",
  "DJ",
  "DM",
  "ER",
  "FJ",
  "FM",
  "GD",
  "GM",
  "GQ",
  "GW",
  "KI",
  "KM",
  "KN",
  "LC",
  "LI",
  "LS",
  "MH",
  "MV",
  "NR",
  "PW",
  "SB",
  "SC",
  "SM",
  "ST",
  "SZ",
  "TL",
  "TO",
  "TV",
  "VC",
  "VU",
  "WS",
  "YE",
  "BI",
  "BF",
  "CF",
  "CG",
  "GA",
  "GY",
  "LA",
  "LR",
  "MR",
  "MW",
  "MZ",
  "NE",
  "OM",
  "PG",
  "RW",
  "SL",
  "SO",
  "SR",
  "SS",
  "TD",
  "TG",
  "TJ",
]);

export type QuizMode = "capital" | "flag" | "bulch";
export type QuestionKind = "capital" | "flag";
export type GameType = "normal" | "timed";
export type QuestionPool = "all" | "rare";

export interface Question {
  country: Country;
  options: Country[];
  kind: QuestionKind;
}

export interface MistakeAnswer {
  mode: QuestionKind;
  prompt: string;
  correctCountry: Country;
  selectedCountry: Country;
}

export interface ResultSummary {
  correct: number;
  mistakes: number;
  percent: number;
  message: string;
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function pickRandomQuestions(countries: readonly Country[], count = ROUND_LENGTH): Country[] {
  return shuffleArray(countries).slice(0, count);
}

export function generateWrongOptions(
  countries: readonly Country[],
  correctCountry: Country,
  count = OPTIONS_COUNT - 1,
): Country[] {
  return shuffleArray(countries.filter((country) => country.code !== correctCountry.code)).slice(0, count);
}

export function generateOptions(countries: readonly Country[], correctCountry: Country, optionCount = OPTIONS_COUNT): Country[] {
  return shuffleArray([correctCountry, ...generateWrongOptions(countries, correctCountry, optionCount - 1)]);
}

export function getRoundLength(mode: QuizMode): number {
  return mode === "bulch" ? HARD_ROUND_LENGTH : ROUND_LENGTH;
}

export function getOptionsCount(mode: QuizMode): number {
  return mode === "bulch" ? HARD_OPTIONS_COUNT : OPTIONS_COUNT;
}

export function getQuestionKind(mode: QuizMode): QuestionKind {
  if (mode === "bulch") {
    return Math.random() > 0.5 ? "capital" : "flag";
  }

  return mode;
}

export function createRoundQuestions(
  countries: readonly Country[],
  mode: QuizMode = "capital",
  questionPool: QuestionPool = "all",
): Question[] {
  const count = getRoundLength(mode);
  const optionCount = getOptionsCount(mode);
  const rareCountries = countries.filter((country) => RARE_COUNTRY_CODES.has(country.code));
  const shouldUseRareCountries = mode === "bulch" || questionPool === "rare";
  const questionSource = shouldUseRareCountries && rareCountries.length >= count ? rareCountries : countries;
  const optionSource = shouldUseRareCountries && rareCountries.length >= optionCount ? rareCountries : countries;

  return pickRandomQuestions(questionSource, count).map((country) => ({
    country,
    options: generateOptions(optionSource, country, optionCount),
    kind: getQuestionKind(mode),
  }));
}

export function getResultSummary(correct: number, total = ROUND_LENGTH): ResultSummary {
  const mistakes = total - correct;
  const percent = Math.round((correct / total) * 100);

  let message = "Путешественник сердится: срочно открываем атлас и берём реванш!";

  if (percent === 100) {
    message = "Путешественник счастлив: всё отлично, ты разбираешься в географии на 5!";
  } else if (percent >= 80) {
    message = "Путешественник улыбается: отличный маршрут, осталось совсем чуть-чуть!";
  } else if (percent >= 60) {
    message = "Путешественник приуныл: несколько стран ещё просят повторения.";
  }

  return {
    correct,
    mistakes,
    percent,
    message,
  };
}

export function getFlagUrl(code: string): string {
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}

export function getFlagFallbackUrl(code: string): string {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

export function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((milliseconds % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}
