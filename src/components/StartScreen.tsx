import type { GameType, QuizMode } from "../utils/quiz";

interface StartScreenProps {
  gameType: GameType;
  rareMode: boolean;
  onSelectGameType: (gameType: GameType) => void;
  onToggleRareMode: (rareMode: boolean) => void;
  onSelectMode: (mode: QuizMode) => void;
}

const modes: Array<{
  id: QuizMode;
  title: string;
}> = [
  {
    id: "capital",
    title: "Угадай, чья это столица",
  },
  {
    id: "flag",
    title: "Угадай, чей это флаг",
  },
  {
    id: "outline",
    title: "Угадай страну по очертаниям",
  },
  {
    id: "bulch",
    title: "Для Бульча",
  },
];

function StartScreen({ gameType, rareMode, onSelectGameType, onToggleRareMode, onSelectMode }: StartScreenProps) {
  return (
    <section className="screen start-screen" aria-labelledby="start-title">
      <div className="intro">
        <p className="eyebrow">Географический квиз</p>
        <h1 id="start-title">Страны мира</h1>
        <p className="lead">
          Проверь, насколько уверенно ты узнаёшь столицы и флаги разных стран.
          <br />
          Выбери режим и начинай короткий географический раунд.
        </p>
      </div>

      <div className="start-controls">
        <div className="game-type-switch" aria-label="Тип игры">
          <button
            className={gameType === "normal" ? "is-active" : ""}
            type="button"
            onClick={() => onSelectGameType("normal")}
          >
            Обычная игра
          </button>
          <button
            className={gameType === "timed" ? "is-active" : ""}
            type="button"
            onClick={() => onSelectGameType("timed")}
          >
            Игра на время
          </button>
        </div>

        <label className="difficulty-toggle">
          <span className="difficulty-toggle__copy">
            <span>Сложный режим</span>
            <small>Редкие страны и флаги</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={rareMode}
            onChange={(event) => onToggleRareMode(event.target.checked)}
          />
          <span className="difficulty-toggle__switch" aria-hidden="true" />
        </label>
      </div>

      <div className="mode-grid" role="radiogroup" aria-label="Режим игры">
        {modes.map((mode) => (
          <button
            className={`mode-card mode-card--${mode.id}`}
            key={mode.id}
            type="button"
            role="radio"
            onClick={() => onSelectMode(mode.id)}
          >
            <span>{mode.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default StartScreen;
