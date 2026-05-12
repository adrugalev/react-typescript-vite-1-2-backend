import type { GameType, QuizMode } from "../utils/quiz";

interface StartScreenProps {
  gameType: GameType;
  onSelectGameType: (gameType: GameType) => void;
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
    id: "bulch",
    title: "Для Бульча",
  },
];

function StartScreen({ gameType, onSelectGameType, onSelectMode }: StartScreenProps) {
  return (
    <section className="screen start-screen" aria-labelledby="start-title">
      <div className="intro">
        <p className="eyebrow">10 или 15 вопросов в раунде</p>
        <h1 id="start-title">Страны мира</h1>
        <p className="lead">
          Проверь, насколько уверенно ты узнаёшь столицы и флаги разных стран. Выбери режим и
          начинай короткий географический раунд.
        </p>
      </div>

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
