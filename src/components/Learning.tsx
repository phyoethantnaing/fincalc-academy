import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Hand,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  GraduationCap,
} from "lucide-react";
import {
  lessons,
  expectedPractice,
  practiceKeys,
  type Lesson,
} from "../lessons/curriculum";
import { money } from "../utils";
const myOptions: Record<number, string[]> = {
  1: [
    "မတူပါ။ Markup သည် ဝယ်ရင်း၊ Margin သည် ရောင်းဈေးကို အခြေခံသည်။",
    "တူပါသည်။ အမြဲတူညီသည်။",
  ],
  2: [
    "ချေးငွေတွင် အတိုးမရှိသောကြောင့်။",
    "လက်ခံငွေနှင့် ဆန့်ကျင်ဘက် ပေးထွက်ငွေ ဖြစ်သောကြောင့်။",
    "တွက်ချက်မှု မှားနေသောကြောင့်။",
  ],
  3: ["BEGIN — ကာလအစတွင် ထည့်ခြင်း။", "END — ကာလဆုံးတွင် ထည့်ခြင်း။"],
  4: ["PV တိုးလာသည်။", "PV လျော့သွားသည်။"],
  5: ["တူပါသည်။", "မတူပါ။ EAR သည် 12.68% ခန့် ဖြစ်သည်။"],
  6: ["360 ရက်အခြေခံ။", "365 ရက်အခြေခံ။"],
  7: ["စာချုပ်ပေါ်ရှိ Face Value ကိုသာ။", "တကယ်လက်ခံရရှိသော Proceeds ကို။"],
};
export type Progress = Record<
  number,
  { practice: boolean; quiz: boolean; attempts: number; completed: boolean }
>;
export function LessonCards({
  my,
  selected,
  onSelect,
  progress,
  bookmarks,
  onBookmark,
}: {
  my: boolean;
  selected: number;
  onSelect: (n: number) => void;
  progress: Progress;
  bookmarks: number[];
  onBookmark: (n: number) => void;
}) {
  return (
    <section className="lesson-library">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR PATH TO FINANCIAL CONFIDENCE</span>
          <h2>
            {my
              ? "အခြေခံမှ စတင်လေ့လာမယ်"
              : "Small lessons. Lasting confidence."}
          </h2>
        </div>
        <span className="soft-badge">
          7 lessons ·{" "}
          {Object.values(progress).filter((x) => x.completed).length} completed
        </span>
      </div>
      <div className="lesson-grid">
        {lessons.map((l) => (
          <article
            key={l.id}
            className={`lesson-card ${selected === l.id ? "selected" : ""}`}
          >
            <div className="lesson-card-top">
              <span className="lesson-number">
                {progress[l.id]?.completed ? (
                  <Check size={17} />
                ) : (
                  String(l.id).padStart(2, "0")
                )}
              </span>
              <button
                aria-label={`Bookmark lesson ${l.id}`}
                className={
                  bookmarks.includes(l.id)
                    ? "bookmarked icon-button"
                    : "icon-button"
                }
                onClick={() => onBookmark(l.id)}
              >
                <Bookmark size={16} />
              </button>
            </div>
            <span className="eyebrow">{l.category}</span>
            <h3>{my ? l.my : l.title}</h3>
            <p>{l.description}</p>
            <button className="lesson-open" onClick={() => onSelect(l.id)}>
              <span>
                {progress[l.id]?.completed
                  ? "Review lesson"
                  : my
                    ? "သင်ခန်းစာ စမယ်"
                    : "Start learning"}{" "}
                <span className="muted">· {l.minutes} min</span>
              </span>
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
export function LessonPlayer({
  lesson,
  my,
  index,
  keys,
  playing,
  setPlaying,
  next,
  previous,
  replay,
  manual,
  setManual,
  speed,
  setSpeed,
  feedback,
  progress,
  onPractice,
  onQuiz,
  onBookmark,
  bookmarked,
}: {
  lesson: Lesson;
  my: boolean;
  index: number;
  keys: string[];
  playing: boolean;
  setPlaying: (v: boolean) => void;
  next: () => void;
  previous: () => void;
  replay: () => void;
  manual: boolean;
  setManual: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  feedback: string;
  progress: Progress;
  onPractice: (pass: boolean) => void;
  onQuiz: (pass: boolean) => void;
  onBookmark: () => void;
  bookmarked: boolean;
}) {
  const [tab, setTab] = useState("learn");
  let count = 0;
  const activeStep = lesson.steps.findIndex((s) => {
    count += s.keys.length;
    return index < count;
  });
  const step =
    lesson.steps[activeStep < 0 ? lesson.steps.length - 1 : activeStep];
  return (
    <aside className="lesson-player panel">
      <div className="lesson-player-top">
        <span className="soft-badge">
          <BookOpen size={12} />
          LESSON {String(lesson.id).padStart(2, "0")} / 07
        </span>
        <button
          title="Bookmark lesson"
          className={`icon-button ${bookmarked ? "bookmarked" : ""}`}
          onClick={onBookmark}
        >
          <Bookmark size={17} />
        </button>
      </div>
      <h2>{my ? lesson.my : lesson.title}</h2>
      <p className="lesson-subtitle">
        {my ? lesson.title : lesson.description}
      </p>
      <div className="lesson-tabs">
        {[
          ["learn", "Learn"],
          ["practice", "Practice"],
          ["quiz", "Quiz"],
        ].map(([id, name]) => (
          <button
            className={tab === id ? "active" : ""}
            key={id}
            onClick={() => setTab(id)}
          >
            {name}
            {id === "practice" && progress[lesson.id]?.practice && (
              <Check size={12} />
            )}
            {id === "quiz" && progress[lesson.id]?.quiz && <Check size={12} />}
          </button>
        ))}
      </div>
      {tab === "learn" ? (
        <>
          <p className="myanmar-text">
            {my ? lesson.explanation : lesson.description}
          </p>
          <div className="scenario">
            <span className="eyebrow">
              {my ? "လက်တွေ့ဥပမာ" : "REAL-LIFE SCENARIO"}
            </span>
            <p>{lesson.scenario}</p>
            <div className="value-tags">
              {lesson.values.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </div>
          <div className="step-caption">
            <span className="step-count">
              {index === keys.length ? (
                <Check size={14} />
              ) : (
                String(
                  (activeStep < 0 ? lesson.steps.length - 1 : activeStep) + 1,
                ).padStart(2, "0")
              )}
            </span>
            <div>
              <span className="eyebrow">
                {index === keys.length
                  ? "DEMONSTRATION COMPLETE"
                  : `STEP ${(activeStep < 0 ? lesson.steps.length - 1 : activeStep) + 1} OF ${lesson.steps.length}`}
              </span>
              <p>{my ? step.my : step.en}</p>
            </div>
          </div>
          <div className="key-sequence">
            {keys.map((k, i) => (
              <span
                className={`${i < index ? "done" : ""} ${i === index ? "current" : ""}`}
                key={i}
              >
                {k}
              </span>
            ))}
          </div>
          <div className="demo-progress">
            <i style={{ width: `${(index / keys.length) * 100}%` }} />
          </div>
          <div className="demo-controls">
            <button
              aria-label="Previous step"
              title="Previous key"
              onClick={previous}
              disabled={!index}
            >
              <SkipBack size={17} />
            </button>
            <button
              aria-label="Play tutorial"
              className="play-button"
              onClick={() => {
                setManual(false);
                setPlaying(!playing);
              }}
              disabled={index === keys.length}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              aria-label="Next step"
              title="Next key"
              onClick={next}
              disabled={index === keys.length}
            >
              <SkipForward size={17} />
            </button>
            <button
              aria-label="Replay tutorial"
              title="Replay"
              onClick={replay}
            >
              <RotateCcw size={16} />
            </button>
            <select
              aria-label="Animation speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={1200}>0.5×</option>
              <option value={650}>1×</option>
              <option value={250}>2×</option>
            </select>
          </div>
          <button
            className={`outline-button full ${manual ? "practice-active" : ""}`}
            onClick={() => {
              setPlaying(false);
              setManual(!manual);
            }}
          >
            <Hand size={15} />
            {manual
              ? "Practice mode active"
              : my
                ? "ကိုယ်တိုင် ခလုတ်နှိပ်မယ်"
                : "Practice myself"}
          </button>
          {feedback && (
            <p className="practice-feedback" aria-live="polite">
              {feedback}
            </p>
          )}
          {index === keys.length && (
            <div className="success-banner">
              <CheckCircle2 size={16} />
              <span>
                {my
                  ? "ဖန်သားပြင်တွင် အဖြေကိုကြည့်ပါ။ လေ့ကျင့်ခန်း ဆက်ဖြေမယ်။"
                  : "The result is on the calculator. Ready to try an exercise?"}
              </span>
              <button onClick={() => setTab("practice")}>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          <details>
            <summary>Formula & key takeaway</summary>
            <div className="formula">{lesson.formula}</div>
            <p>{lesson.takeaway}</p>
          </details>
        </>
      ) : tab === "practice" ? (
        <PracticeExercise
          key={lesson.id}
          lesson={lesson}
          my={my}
          onAnswer={onPractice}
        />
      ) : (
        <QuizCard key={lesson.id} lesson={lesson} my={my} onAnswer={onQuiz} />
      )}
    </aside>
  );
}
function PracticeExercise({
  lesson,
  my,
  onAnswer,
}: {
  lesson: Lesson;
  my: boolean;
  onAnswer: (pass: boolean) => void;
}) {
  const [answer, setAnswer] = useState(""),
    [difficulty, setDifficulty] = useState(0),
    [checked, setChecked] = useState<boolean | null>(null);
  const expected = expectedPractice(lesson, difficulty);
  function check() {
    const pass =
      answer.trim() !== "" &&
      Number.isFinite(Number(answer)) &&
      Math.abs(Number(answer) - expected) <= 0.01;
    setChecked(pass);
    onAnswer(pass);
  }
  return (
    <div className="exercise">
      <span className="exercise-icon">
        <GraduationCap size={30} />
      </span>
      <h3>{my ? "နားလည်မှုကို စမ်းကြည့်မယ်" : "Your turn to work it out."}</h3>
      <div className="segmented small">
        {["Easy", "Medium", "Advanced"].map((x, i) => (
          <button
            key={x}
            className={difficulty === i ? "active" : ""}
            onClick={() => {
              setDifficulty(i);
              setChecked(null);
              setAnswer("");
            }}
          >
            {x}
          </button>
        ))}
      </div>
      <p>{my ? lesson.practice.my : lesson.practice.question}</p>
      {difficulty > 0 && (
        <p className="tip">
          {my
            ? `မေးခွန်းရှိ ငွေပမာဏအားလုံးကို ${difficulty + 1} ဆ ပြောင်း၍ တွက်ပါ။ နှုန်းနှင့် အချိန် မပြောင်းပါ။`
            : `Multiply every monetary input in the question by ${difficulty + 1}. Keep the rate and term unchanged.`}
        </p>
      )}
      <label>
        Your answer · {lesson.practice.unit}
        <input
          data-testid="practice-answer"
          type="number"
          step=".01"
          placeholder="0.00"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setChecked(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
        />
      </label>
      <button className="primary-button full" onClick={check}>
        {my ? "အဖြေစစ်မယ်" : "Check answer"}
        <ArrowRight size={15} />
      </button>
      {checked !== null && (
        <div
          role="status"
          className={checked ? "success-banner" : "error-banner"}
        >
          {checked
            ? "✓ Correct — excellent work."
            : "Try again. Check the rate period, payment timing and cash-flow signs."}
          <p>
            Rounded answer: {money(expected)} {lesson.practice.unit}. Tolerance:
            ±0.01.
          </p>
          <p>{lesson.takeaway}</p>
          <details>
            <summary>Show the steps</summary>
            <p>{practiceKeys(lesson, difficulty).join(" → ")}</p>
            <p>{lesson.formula}</p>
          </details>
        </div>
      )}
    </div>
  );
}
function QuizCard({
  lesson,
  my,
  onAnswer,
}: {
  lesson: Lesson;
  my: boolean;
  onAnswer: (pass: boolean) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="exercise">
      <span className="exercise-icon">
        <BookOpen size={28} />
      </span>
      <h3>{my ? "သဘောတရားကို နားလည်ပြီလား။" : "Check your understanding."}</h3>
      <p>{my ? lesson.quiz.my : lesson.quiz.question}</p>
      <div className="quiz-options">
        {lesson.quiz.options.map((o, i) => (
          <button
            className={
              choice === i
                ? i === lesson.quiz.correct
                  ? "correct"
                  : "incorrect"
                : ""
            }
            key={o}
            onClick={() => {
              setChoice(i);
              onAnswer(i === lesson.quiz.correct);
            }}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {my ? myOptions[lesson.id][i] : o}
          </button>
        ))}
      </div>
      {choice !== null && (
        <div
          role="status"
          className={
            choice === lesson.quiz.correct ? "success-banner" : "error-banner"
          }
        >
          {choice === lesson.quiz.correct
            ? "✓ Correct."
            : "Not quite. Try again."}
          <p>{lesson.quiz.explanation}</p>
        </div>
      )}
    </div>
  );
}
