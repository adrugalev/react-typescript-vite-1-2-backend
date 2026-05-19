import { formatElapsedTime, type GameType, type QuizMode, type TimedRecords } from "../utils/quiz";

interface StartScreenProps {
  gameType: GameType;
  rareMode: boolean;
  timedRecords: TimedRecords;
  onSelectGameType: (gameType: GameType) => void;
  onToggleRareMode: (rareMode: boolean) => void;
  onSelectMode: (mode: QuizMode) => void;
}

const modes: Array<{
  id: QuizMode;
  title: string;
  recordTitle: string;
  badge?: string;
}> = [
  {
    id: "capital",
    title: "Угадай, чья это столица",
    recordTitle: "Столицы",
  },
  {
    id: "flag",
    title: "Угадай, чей это флаг",
    recordTitle: "Флаги",
  },
  {
    id: "outline",
    title: "Угадай страну по очертаниям",
    recordTitle: "Очертания",
  },
  {
    id: "bulch",
    title: "Для Бульча",
    recordTitle: "Для Бульча",
    badge: "Сложнота",
  },
];

const recordDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatRecordDate(recordedAt: string | null) {
  if (recordedAt === null) {
    return "—";
  }

  const timestamp = Date.parse(recordedAt);

  if (Number.isNaN(timestamp)) {
    return "—";
  }

  return recordDateFormatter.format(new Date(timestamp));
}

function StartScreen({
  gameType,
  rareMode,
  timedRecords,
  onSelectGameType,
  onToggleRareMode,
  onSelectMode,
}: StartScreenProps) {
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
            {mode.badge !== undefined && <small className="mode-card__badge">{mode.badge}</small>}
            <span>{mode.title}</span>
          </button>
        ))}
      </div>

      <section className="records-panel" aria-label="Рекорды на время">
        <div className="records-panel__header">
          <p className="eyebrow">Рекорды на время</p>
        </div>

        <div className="records-table-wrap">
          <table className="records-table">
            <caption className="visually-hidden">Рекорды игры на время по каждому режиму</caption>
            <thead>
              <tr>
                <th scope="col">Режим</th>
                <th scope="col">Рекорд</th>
                <th scope="col">Дата и время</th>
              </tr>
            </thead>
            <tbody>
              {modes.map((mode) => {
                const record = timedRecords[mode.id];

                return (
                  <tr key={mode.id}>
                    <th scope="row">{mode.recordTitle}</th>
                    <td className="records-table__time">
                      {record === undefined ? "—" : <strong>{formatElapsedTime(record.time)}</strong>}
                    </td>
                    <td className={record === undefined ? "records-table__empty" : ""}>
                      {record === undefined ? "Пока нет" : formatRecordDate(record.recordedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default StartScreen;
