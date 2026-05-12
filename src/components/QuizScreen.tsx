import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Country } from "../data/countries";
import {
  formatElapsedTime,
  getFlagUrl,
  type GameType,
  type MistakeAnswer,
  type Question,
  type QuizMode,
} from "../utils/quiz";

interface QuizScreenProps {
  mode: QuizMode;
  modeTitle: string;
  gameType: GameType;
  questions: Question[];
  onBackToStart: () => void;
  onRoundComplete: (correctAnswers: number, elapsedTime: number | null, mistakes: MistakeAnswer[]) => void;
}

function QuizScreen({ mode, modeTitle, gameType, questions, onBackToStart, onRoundComplete }: QuizScreenProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false);
  const [mistakes, setMistakes] = useState<MistakeAnswer[]>([]);
  const autoNextTimer = useRef<number | null>(null);
  const penaltyNoticeTimer = useRef<number | null>(null);
  const timerInterval = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const penaltyTime = useRef(0);

  const currentQuestion = questions[questionIndex];
  const isAnswered = selectedCode !== null;
  const isFlagQuestion = currentQuestion.kind === "flag";
  const completedQuestions = questionIndex + (isAnswered ? 1 : 0);
  const progressStyle = {
    "--quiz-progress": `${(completedQuestions / questions.length) * 100}%`,
  } as CSSProperties;

  useEffect(() => {
    if (autoNextTimer.current !== null) {
      window.clearTimeout(autoNextTimer.current);
    }
    if (penaltyNoticeTimer.current !== null) {
      window.clearTimeout(penaltyNoticeTimer.current);
    }

    setQuestionIndex(0);
    setSelectedCode(null);
    setCorrectAnswers(0);
    setElapsedTime(0);
    setShowPenalty(false);
    setMistakes([]);
    penaltyTime.current = 0;
    startedAt.current = gameType === "timed" ? Date.now() : null;

    if (timerInterval.current !== null) {
      window.clearInterval(timerInterval.current);
    }

    if (gameType === "timed") {
      timerInterval.current = window.setInterval(() => {
        if (startedAt.current !== null) {
          setElapsedTime(Date.now() - startedAt.current + penaltyTime.current);
        }
      }, 40);
    }

    return () => {
      if (autoNextTimer.current !== null) {
        window.clearTimeout(autoNextTimer.current);
      }

      if (penaltyNoticeTimer.current !== null) {
        window.clearTimeout(penaltyNoticeTimer.current);
      }

      if (timerInterval.current !== null) {
        window.clearInterval(timerInterval.current);
      }
    };
  }, [gameType, questions]);

  const handleAnswer = (country: Country) => {
    if (isAnswered) {
      return;
    }

    setSelectedCode(country.code);

    const isCorrect = country.code === currentQuestion.country.code;
    const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    const nextPenaltyTime = penaltyTime.current + (!isCorrect && gameType === "timed" ? 10_000 : 0);
    const nextMistakes = isCorrect
      ? mistakes
      : [
          ...mistakes,
          {
            prompt:
              currentQuestion.kind === "capital"
                ? `Чья столица — ${currentQuestion.country.capital}?`
                : `Какой флаг у страны ${currentQuestion.country.country}?`,
            mode: currentQuestion.kind,
            correctCountry: currentQuestion.country,
            selectedCountry: country,
          },
        ];

    if (isCorrect) {
      setCorrectAnswers(nextCorrectAnswers);
    } else {
      setMistakes(nextMistakes);

      if (gameType === "timed") {
        penaltyTime.current = nextPenaltyTime;
        setElapsedTime((value) => value + 10_000);
        setShowPenalty(false);

        window.requestAnimationFrame(() => {
          setShowPenalty(true);
        });

        if (penaltyNoticeTimer.current !== null) {
          window.clearTimeout(penaltyNoticeTimer.current);
        }

        penaltyNoticeTimer.current = window.setTimeout(() => {
          setShowPenalty(false);
        }, 850);
      }
    }

    autoNextTimer.current = window.setTimeout(() => {
      if (questionIndex + 1 >= questions.length) {
        const finalElapsedTime = startedAt.current === null ? null : Date.now() - startedAt.current + nextPenaltyTime;
        onRoundComplete(nextCorrectAnswers, finalElapsedTime, nextMistakes);
        return;
      }

      setQuestionIndex((index) => index + 1);
      setSelectedCode(null);
    }, 900);
  };

  const getOptionClassName = (country: Country) => {
    const classNames = ["answer-card"];

    if (isFlagQuestion) {
      classNames.push("flag-answer");
    }

    if (isFlagQuestion && country.code === "NP") {
      classNames.push("flag-answer--nepal");
    }

    if (isAnswered && country.code === currentQuestion.country.code) {
      classNames.push("is-correct");
    }

    if (isAnswered && selectedCode === country.code && country.code !== currentQuestion.country.code) {
      classNames.push("is-wrong");
    }

    return classNames.join(" ");
  };

  return (
    <section className="screen quiz-screen" aria-labelledby="quiz-title">
      <div className="quiz-header">
        <div>
          <p className="eyebrow">Текущий режим</p>
          <h1 id="quiz-title">{modeTitle}</h1>
        </div>
        <div
          className={`score-box ${gameType === "timed" ? "score-box--timed" : ""}`}
          aria-label="Счёт"
          style={progressStyle}
        >
          {gameType === "timed" && (
            <em className="timer-line">
              <span>Время: {formatElapsedTime(elapsedTime)}</span>
              {showPenalty && <span className="penalty-notice">+10 секунд!</span>}
            </em>
          )}
          <span>Вопрос {questionIndex + 1} из {questions.length}</span>
          <strong>Правильно: {correctAnswers}</strong>
        </div>
      </div>

      <div className="question-panel">
        {currentQuestion.kind === "capital" ? (
          <h2>Чья столица — {currentQuestion.country.capital}?</h2>
        ) : (
          <h2>Какой флаг у страны {currentQuestion.country.country}?</h2>
        )}
      </div>

      <div
        className={`answers-grid ${isFlagQuestion ? "flags-grid" : ""} ${
          currentQuestion.options.length === 6 ? "answers-grid--six" : ""
        }`}
      >
        {currentQuestion.options.map((country) => (
          <button
            className={getOptionClassName(country)}
            key={country.code}
            type="button"
            disabled={isAnswered}
            onClick={() => handleAnswer(country)}
          >
            {currentQuestion.kind === "capital" ? (
              country.country
            ) : (
              <img
                className={country.code === "NP" ? "flag-image--nepal" : ""}
                src={getFlagUrl(country.code)}
                alt={`Флаг страны ${country.country}`}
              />
            )}
          </button>
        ))}
      </div>

      <button className="secondary-button back-button" type="button" onClick={onBackToStart}>
        Вернуться
      </button>
    </section>
  );
}

export default QuizScreen;
