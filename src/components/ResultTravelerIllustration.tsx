type TravelerMood = "joy" | "smile" | "sad" | "angry";

interface ResultTravelerIllustrationProps {
  percent: number;
}

const moodImages: Record<TravelerMood, string> = {
  joy: "./assets/result-traveler-joy.png",
  smile: "./assets/result-traveler-smile.png",
  sad: "./assets/result-traveler-sad.png",
  angry: "./assets/result-traveler-angry.png",
};

function getTravelerMood(percent: number): TravelerMood {
  if (percent === 100) {
    return "joy";
  }

  if (percent >= 80) {
    return "smile";
  }

  if (percent >= 60) {
    return "sad";
  }

  return "angry";
}

function getMoodLabel(mood: TravelerMood): string {
  if (mood === "joy") {
    return "Герой-путешественник радуется идеальному результату";
  }

  if (mood === "smile") {
    return "Герой-путешественник улыбается хорошему результату";
  }

  if (mood === "sad") {
    return "Герой-путешественник печалится из-за ошибок";
  }

  return "Герой-путешественник злится из-за низкого результата";
}

function ResultTravelerIllustration({ percent }: ResultTravelerIllustrationProps) {
  const mood = getTravelerMood(percent);

  return (
    <figure className={`result-hero result-hero--${mood}`}>
      <img className="result-hero__image" src={moodImages[mood]} alt={getMoodLabel(mood)} />
    </figure>
  );
}

export default ResultTravelerIllustration;
