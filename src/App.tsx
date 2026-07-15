import { useMemo, useState } from "react";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import { countries } from "./data/countries";
import {
  createRoundQuestions,
  getRoundLength,
  type GameType,
  type MistakeAnswer,
  type Question,
  type QuestionPool,
  type QuizMode,
  type TimedRecords,
} from "./utils/quiz";

type Screen = "start" | "quiz" | "result";
interface TimedRecordNotice {
  previousRecord: number | null;
  newRecord: number;
}

const TIMED_RECORDS_STORAGE_KEY = "countries-world-quiz:timed-records";
const QUIZ_MODES: QuizMode[] = ["capital", "flag", "outline", "bulch"];

function readTimedRecords(): TimedRecords {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedRecords = window.localStorage.getItem(TIMED_RECORDS_STORAGE_KEY);

    if (savedRecords === null) {
      return {};
    }

    const parsedRecords = JSON.parse(savedRecords) as Partial<Record<string, unknown>>;

    return QUIZ_MODES.reduce<TimedRecords>((records, quizMode) => {
      const savedRecord = parsedRecords[quizMode];

      if (typeof savedRecord === "number" && Number.isFinite(savedRecord) && savedRecord > 0) {
        records[quizMode] = {
          time: savedRecord,
          recordedAt: null,
        };
        return records;
      }

      if (savedRecord !== null && typeof savedRecord === "object") {
        const { time, recordedAt } = savedRecord as { time?: unknown; recordedAt?: unknown };
        const recordDate =
          typeof recordedAt === "string" && !Number.isNaN(Date.parse(recordedAt)) ? recordedAt : null;

        if (typeof time === "number" && Number.isFinite(time) && time > 0) {
          records[quizMode] = {
            time,
            recordedAt: recordDate,
          };
        }
      }

      return records;
    }, {});
  } catch {
    return {};
  }
}

function saveTimedRecords(records: TimedRecords) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(TIMED_RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Игру можно продолжать даже если браузер запретил запись в localStorage.
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [mode, setMode] = useState<QuizMode>("capital");
  const [gameType, setGameType] = useState<GameType>("normal");
  const [rareMode, setRareMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(() => createRoundQuestions(countries, "capital"));
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(getRoundLength("capital"));
  const [mistakes, setMistakes] = useState<MistakeAnswer[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [timedRecords, setTimedRecords] = useState<TimedRecords>(() => readTimedRecords());
  const [timedRecordNotice, setTimedRecordNotice] = useState<TimedRecordNotice | null>(null);

  const modeTitle = useMemo(
    () => {
      const rareModeSuffix = rareMode && mode !== "bulch" ? " · редкие страны" : "";

      if (mode === "capital") {
        return `Угадай, чья это столица${rareModeSuffix}`;
      }

      if (mode === "flag") {
        return `Угадай, чей это флаг${rareModeSuffix}`;
      }

      if (mode === "outline") {
        return `Угадай страну по очертаниям${rareModeSuffix}`;
      }

      return "Для Бульча";
    },
    [mode, rareMode],
  );

  const startRound = (selectedMode = mode) => {
    const questionPool: QuestionPool = rareMode && selectedMode !== "bulch" ? "rare" : "all";

    setMode(selectedMode);
    setQuestions(createRoundQuestions(countries, selectedMode, questionPool));
    setCorrectAnswers(0);
    setTotalQuestions(getRoundLength(selectedMode));
    setMistakes([]);
    setElapsedTime(null);
    setTimedRecordNotice(null);
    setScreen("quiz");
  };

  const handleRoundComplete = (
    correct: number,
    finalElapsedTime: number | null,
    roundMistakes: MistakeAnswer[],
  ) => {
    let nextTimedRecordNotice: TimedRecordNotice | null = null;

    const isPerfectRound = correct === questions.length;

    if (gameType === "timed" && finalElapsedTime !== null && isPerfectRound) {
      const currentRecord = timedRecords[mode];

      if (currentRecord === undefined || currentRecord.time > finalElapsedTime) {
        const nextTimedRecords = {
          ...timedRecords,
          [mode]: {
            time: finalElapsedTime,
            recordedAt: new Date().toISOString(),
          },
        };

        setTimedRecords(nextTimedRecords);
        saveTimedRecords(nextTimedRecords);
        nextTimedRecordNotice = {
          previousRecord: currentRecord?.time ?? null,
          newRecord: finalElapsedTime,
        };
      }
    }

    setCorrectAnswers(correct);
    setMistakes(roundMistakes);
    setElapsedTime(finalElapsedTime);
    setTimedRecordNotice(nextTimedRecordNotice);
    setScreen("result");
  };

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "start" && (
          <StartScreen
            gameType={gameType}
            rareMode={rareMode}
            timedRecords={timedRecords}
            onSelectGameType={setGameType}
            onToggleRareMode={setRareMode}
            onSelectMode={startRound}
          />
        )}

        {screen === "quiz" && (
          <QuizScreen
            mode={mode}
            modeTitle={modeTitle}
            gameType={gameType}
            timedRecord={timedRecords[mode]?.time ?? null}
            questions={questions}
            onBackToStart={() => setScreen("start")}
            onRoundComplete={handleRoundComplete}
          />
        )}

        {screen === "result" && (
          <ResultScreen
            correctAnswers={correctAnswers}
            totalQuestions={totalQuestions}
            mistakes={mistakes}
            elapsedTime={elapsedTime}
            timedRecordNotice={timedRecordNotice}
            onRestart={() => startRound()}
            onChooseMode={() => setScreen("start")}
          />
        )}
      </main>

      <footer className="app-footer">Географический квиз</footer>
    </div>
  );
}

export default App;
