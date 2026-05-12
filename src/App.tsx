import { useMemo, useState } from "react";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import { countries } from "./data/countries";
import { createRoundQuestions, getRoundLength, type GameType, type MistakeAnswer, type Question, type QuizMode } from "./utils/quiz";

type Screen = "start" | "quiz" | "result";

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [mode, setMode] = useState<QuizMode>("capital");
  const [gameType, setGameType] = useState<GameType>("normal");
  const [questions, setQuestions] = useState<Question[]>(() => createRoundQuestions(countries, "capital"));
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(getRoundLength("capital"));
  const [mistakes, setMistakes] = useState<MistakeAnswer[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const modeTitle = useMemo(
    () => {
      if (mode === "capital") {
        return "Угадай, чья это столица";
      }

      if (mode === "flag") {
        return "Угадай, чей это флаг";
      }

      return "Для Бульча";
    },
    [mode],
  );

  const startRound = (selectedMode = mode) => {
    setMode(selectedMode);
    setQuestions(createRoundQuestions(countries, selectedMode));
    setCorrectAnswers(0);
    setTotalQuestions(getRoundLength(selectedMode));
    setMistakes([]);
    setElapsedTime(null);
    setScreen("quiz");
  };

  const handleRoundComplete = (
    correct: number,
    finalElapsedTime: number | null,
    roundMistakes: MistakeAnswer[],
  ) => {
    setCorrectAnswers(correct);
    setMistakes(roundMistakes);
    setElapsedTime(finalElapsedTime);
    setScreen("result");
  };

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "start" && (
          <StartScreen gameType={gameType} onSelectGameType={setGameType} onSelectMode={startRound} />
        )}

        {screen === "quiz" && (
          <QuizScreen
            mode={mode}
            modeTitle={modeTitle}
            gameType={gameType}
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
