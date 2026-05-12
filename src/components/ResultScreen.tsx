import { formatElapsedTime, getFlagUrl, getResultSummary, type MistakeAnswer } from "../utils/quiz";
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
                  {mistake.mode === "flag" ? (
                    <img
                      className={`mistake-correct-flag ${
                        mistake.correctCountry.code === "NP" ? "flag-image--nepal" : ""
                      }`}
                      src={getFlagUrl(mistake.correctCountry.code)}
                      alt={`Флаг страны ${mistake.correctCountry.country}`}
                    />
                  ) : (
                    <strong>{mistake.correctCountry.country}</strong>
                  )}
                </div>
                <div className="mistake-answer-pair">
                  <small>Твой ответ: {mistake.selectedCountry.country}</small>
                  {mistake.mode === "flag" && (
                    <img
                      className={mistake.selectedCountry.code === "NP" ? "flag-image--nepal" : ""}
                      src={getFlagUrl(mistake.selectedCountry.code)}
                      alt={`Флаг страны ${mistake.selectedCountry.country}`}
                    />
                  )}
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
