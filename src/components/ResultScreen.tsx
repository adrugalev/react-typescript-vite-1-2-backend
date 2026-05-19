import {
  formatElapsedTime,
  getFlagFallbackUrl,
  getFlagUrl,
  getOutlineUrl,
  getResultSummary,
  type MistakeAnswer,
} from "../utils/quiz";
import ResultTravelerIllustration from "./ResultTravelerIllustration";

interface ResultScreenProps {
  correctAnswers: number;
  totalQuestions: number;
  mistakes: MistakeAnswer[];
  elapsedTime: number | null;
  onRestart: () => void;
  onChooseMode: () => void;
}

function ResultScreen({ correctAnswers, totalQuestions, mistakes, elapsedTime, onRestart, onChooseMode }: ResultScreenProps) {
  const result = getResultSummary(correctAnswers, totalQuestions);

  const renderMistakeVisual = (mistake: MistakeAnswer, variant: "correct" | "selected") => {
    const country = variant === "correct" ? mistake.correctCountry : mistake.selectedCountry;

    if (mistake.mode === "flag") {
      return (
        <img
          className={`${variant === "correct" ? "mistake-correct-flag" : ""} ${
            country.code === "NP" ? "flag-image--nepal" : ""
          }`}
          src={getFlagUrl(country.code)}
          alt={`Флаг страны ${country.country}`}
          onError={(event) => {
            const image = event.currentTarget;

            if (image.src !== getFlagFallbackUrl(country.code)) {
              image.src = getFlagFallbackUrl(country.code);
            }
          }}
        />
      );
    }

    if (mistake.mode === "outline") {
      return (
        <img
          className={variant === "correct" ? "mistake-correct-outline" : "mistake-selected-outline"}
          src={getOutlineUrl(country.code)}
          alt={`Очертания страны ${country.country}`}
        />
      );
    }

    return null;
  };

  return (
    <section className="screen result-screen" aria-labelledby="result-title">
      <div className="intro">
        <p className="eyebrow">Финиш</p>
        <h1 id="result-title">Раунд завершён</h1>
        <p className="lead">{result.message}</p>
      </div>

      <ResultTravelerIllustration percent={result.percent} />

      <div className="result-grid" aria-label="Статистика раунда">
        <div className="result-card">
          <span>Правильных ответов</span>
          <strong>{result.correct}</strong>
        </div>
        <div className="result-card">
          <span>Ошибок</span>
          <strong>{result.mistakes}</strong>
        </div>
        <div className="result-card">
          <span>Точность</span>
          <strong>{result.percent}%</strong>
        </div>
        {elapsedTime !== null && (
          <div className="result-card">
            <span>Время</span>
            <strong>{formatElapsedTime(elapsedTime)}</strong>
          </div>
        )}
      </div>

      {mistakes.length > 0 && (
        <div className="mistakes-panel">
          <h2>Правильные ответы</h2>
          <div className="mistakes-list">
            {mistakes.map((mistake, index) => (
              <div className="mistake-row" key={`${mistake.correctCountry.code}-${index}`}>
                <div>
                  <span>{mistake.prompt}</span>
                  {mistake.mode === "capital" ? (
                    <strong>{mistake.correctCountry.country}</strong>
                  ) : (
                    renderMistakeVisual(mistake, "correct")
                  )}
                </div>
                <div className="mistake-answer-pair">
                  <small>Твой ответ: {mistake.selectedCountry.country}</small>
                  {mistake.mode !== "capital" && renderMistakeVisual(mistake, "selected")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="result-actions">
        <button className="primary-button" type="button" onClick={onRestart}>
          Сыграть ещё раз
        </button>
        <button className="secondary-button" type="button" onClick={onChooseMode}>
          Выбрать другой режим
        </button>
      </div>
    </section>
  );
}

export default ResultScreen;
