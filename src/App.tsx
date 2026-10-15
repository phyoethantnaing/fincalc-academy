import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Calculator as CalcIcon,
  BookOpen,
  Scale,
  Library,
  Bookmark,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Settings2,
  Search,
  History,
  Save,
  Globe,
  Check,
  Menu,
  X,
  Flame,
  Download,
  Share2,
  ExternalLink,
  TrendingUp,
  Wallet,
  Target,
  Lightbulb,
  LockKeyhole,
  Trash2,
} from "lucide-react";
import { Calculator as Engine } from "./engine/rpn";
import { D, amortization } from "./engine/finance";
import { Calculator, KeyHelp } from "./components/Calculator";
import { Beginner, type ToolResult } from "./components/Beginner";
import type { Progress } from "./components/Learning";
import { Comparison } from "./components/Comparison";
import { AmortizationTable } from "./components/AmortizationTable";
import { lessons, lessonKeys } from "./lessons/curriculum";
import {
  readStore,
  writeStore,
  money,
  snapshot,
  restore,
  download,
  type Snapshot,
  KEY_HELP,
} from "./utils";
const LessonCards = lazy(() =>
  import("./components/Learning").then((m) => ({ default: m.LessonCards })),
);
const LessonPlayer = lazy(() =>
  import("./components/Learning").then((m) => ({ default: m.LessonPlayer })),
);
const GrowthChart = lazy(() => import("./components/GrowthChart"));
const FinancialCharts = lazy(() => import("./components/FinancialCharts"));
type Saved = { id: number; name: string; date: string; state: Snapshot };
type Preferences = {
  my: boolean;
  dark: boolean;
  currency: string;
  decimals: number;
  separator: boolean;
};
const initialProgress: Progress = {};
const glossary = [
  [
    "Present Value (PV)",
    "လက်ရှိတန်ဖိုး",
    "ဒီနေ့မှာရှိသော ငွေတန်ဖိုး။ အနာဂတ်ငွေကို ယနေ့တန်ဖိုးသို့ ပြန်တွက်နိုင်သည်။",
    "The value of money today. Discount a future amount to find its present value.",
  ],
  [
    "Future Value (FV)",
    "အနာဂတ်တန်ဖိုး",
    "အတိုးနှင့် စုငွေများပေါင်းပြီး နောက်အချိန်တွင် ရရှိမည့် ငွေ။",
    "The accumulated value of money at a future point in time.",
  ],
  [
    "Payment (PMT)",
    "တစ်ကြိမ်ပေးငွေ",
    "အချိန်ကာလတိုင်း ပေးရမည့် သို့မဟုတ် ရမည့် ငွေပမာဏ။",
    "An equal amount paid or received each period.",
  ],
  [
    "Periodic rate (i)",
    "တစ်ကြိမ်စာ အတိုးနှုန်း",
    "n ကို လအလိုက်တွက်လျှင် i ကိုလည်း လစဉ်ရာခိုင်နှုန်းဖြင့် ထည့်ရသည်။",
    "The interest rate for one period, entered as a percentage.",
  ],
  [
    "Periods (n)",
    "အကြိမ်အရေအတွက်",
    "ငွေပေးချေမည့် သို့မဟုတ် အတိုးပေါင်းမည့် ကာလအရေအတွက်။",
    "The number of payment or compounding periods.",
  ],
  [
    "Amortization",
    "အဆင့်ဆင့် ပြန်ဆပ်ခြင်း",
    "တစ်ကြိမ်ပေးငွေတွင် ငွေရင်းနှင့် အတိုးကို ခွဲပြီး လက်ကျန်ချေးငွေကို လျှော့ချခြင်း။",
    "Paying down a loan over time, separating each payment into principal and interest.",
  ],
  [
    "Nominal rate",
    "သတ်မှတ်နှစ်စဉ်နှုန်း",
    "ပေါင်းတိုးအကျိုးသက်ရောက်မှုမပါသေးသော ကြော်ငြာထားသည့် နှစ်စဉ်နှုန်း။",
    "An annual quoted rate before accounting for intra-year compounding.",
  ],
  [
    "Effective annual rate (EAR)",
    "အမှန်တကယ် နှစ်စဉ်နှုန်း",
    "တစ်နှစ်အတွင်း အတိုးပေါ်အတိုး ပါဝင်သော တကယ်ကြီးထွားနှုန်း။",
    "The annual rate after accounting for compounding: (1 + j/m)^m − 1.",
  ],
  [
    "RPN",
    "နောက်မှလုပ်ဆောင်ချက်နှိပ်နည်း",
    "ကိန်းနှစ်ခုကို ENTER ဖြင့် ခွဲပြီး + စသည့် လုပ်ဆောင်ချက်ကို နောက်မှ နှိပ်သည်။",
    "Reverse Polish notation: enter operands first, then the operation.",
  ],
  [
    "Cash-flow sign convention",
    "ငွေဝင်ငွေထွက် လက္ခဏာ",
    "ရသောငွေကို အပေါင်း၊ ပေးသောငွေကို အနုတ်ဖြင့် ရေးသည်။",
    "Money received is positive; money paid is negative, from a consistent viewpoint.",
  ],
  [
    "Net present value (NPV)",
    "အသားတင် လက်ရှိတန်ဖိုး",
    "အနာဂတ်ငွေစီးဆင်းမှုများကို လျှော့တွက်ပြီး ယနေ့စတင်သုံးငွေနှင့် ပေါင်းထားသော တန်ဖိုး။",
    "The sum of discounted cash flows, including the initial cash flow at time zero.",
  ],
  [
    "Internal rate of return (IRR)",
    "အတွင်းပိုင်း ပြန်ရနှုန်း",
    "NPV သုညဖြစ်စေသော နှုန်း။ ငွေဝင်ထွက်လက္ခဏာ မကြာခဏပြောင်းလျှင် အဖြေများစွာ သို့မဟုတ် အဖြေမရှိခြင်း ဖြစ်နိုင်သည်။",
    "A rate that makes NPV zero. Non-conventional flows may have multiple or no IRRs.",
  ],
  [
    "Markup vs margin",
    "အမြတ်တင်နှုန်းနှင့် အမြတ်အချိုး",
    "Markup = အမြတ် ÷ ဝယ်ရင်း။ Margin = အမြတ် ÷ ရောင်းဈေး။",
    "Markup uses cost as its base. Gross margin uses the selling price.",
  ],
  [
    "Simple discount",
    "အတိုးကြိုဖြတ်",
    "နောက်ဆုံးပြန်ဆပ်ငွေပေါ် အတိုးကြိုနုတ်ပြီး ကျန်ငွေကို ချေးပေးခြင်း။",
    "Interest is deducted from face value upfront, so proceeds are smaller than repayment.",
  ],
];
export default function App() {
  const [offlineCached, setOfflineCached] = useState(false);
  useEffect(() => {
    navigator.serviceWorker?.ready.then(() => setOfflineCached(true));
  }, []);
  const [prefs, setPrefs] = useState<Preferences>(() =>
    readStore("preferences", {
      my: true,
      dark: false,
      currency: "MMK",
      decimals: 2,
      separator: true,
    }),
  );
  const { my, dark, currency } = prefs;
  const engine = useRef(new Engine());
  const c = engine.current;
  const [, update] = useState(0);
  const [view, setView] = useState("calculator"),
    [mode, setMode] = useState("pro"),
    [mobileNav, setMobileNav] = useState(false),
    [modal, setModal] = useState(""),
    [helpKey, setHelpKey] = useState("ENTER"),
    [showStack, setShowStack] = useState(false),
    [full, setFull] = useState(false),
    [toast, setToast] = useState("");
  const [progress, setProgress] = useState<Progress>(() =>
      readStore("progress", initialProgress),
    ),
    [bookmarks, setBookmarks] = useState<number[]>(() =>
      readStore("bookmarks", []),
    ),
    [saved, setSaved] = useState<Saved[]>(() => readStore("saved", [])),
    [days, setDays] = useState<string[]>(() => readStore("days", []));
  const [lessonId, setLessonId] = useState(2),
    [tutorial, setTutorial] = useState(false),
    [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [manual, setManual] = useState(false),
    [speed, setSpeed] = useState(650),
    [highlight, setHighlight] = useState(""),
    [feedback, setFeedback] = useState("");
  const lesson = lessons[lessonId - 1],
    keys = lessonKeys(lesson);
  const [toolResult, setToolResult] = useState<ToolResult | null>(null),
    [chartKind, setChartKind] = useState<"balance" | "split">("balance"),
    [showSchedule, setShowSchedule] = useState(false),
    [query, setQuery] = useState("");
  const defaultLoan = amortization(100000, 12, 12);
  let professionalLoan: ReturnType<typeof amortization> | null = null;
  try {
    const f = c.financial;
    if (
      f.PV.gt(0) &&
      f.PMT.lt(0) &&
      f.FV.isZero() &&
      f.n.isInteger() &&
      f.n.gt(0) &&
      f.n.lte(1200) &&
      f.i.gte(0)
    ) {
      professionalLoan = amortization(
        f.PV,
        f.i.mul(12),
        f.n.toNumber(),
        c.begin,
      );
      if (D(professionalLoan.payment).plus(f.PMT).abs().gt(".02"))
        professionalLoan = null;
    }
  } catch {
    /* schedule requires a fully defined standard loan */
  }
  const resultRows =
    toolResult?.rows ?? professionalLoan?.rows ?? defaultLoan.rows;
  function refresh() {
    update((x) => x + 1);
  }
  function notify(s: string) {
    setToast(s);
  }
  function setPref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }
  useEffect(() => {
    writeStore("preferences", prefs);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.lang = my ? "my" : "en";
    engine.current.decimals = prefs.decimals;
    refresh();
  }, [prefs]);
  useEffect(() => {
    writeStore("progress", progress);
  }, [progress]);
  useEffect(() => {
    writeStore("bookmarks", bookmarks);
  }, [bookmarks]);
  useEffect(() => {
    writeStore("saved", saved);
  }, [saved]);
  useEffect(() => {
    writeStore("days", days);
  }, [days]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  function runTo(n: number) {
    const next = new Engine();
    next.decimals = prefs.decimals;
    keys.slice(0, n).forEach((k) => next.press(k));
    engine.current = next;
    setIndex(n);
    setHighlight(n ? keys[n - 1] : keys[0]);
    refresh();
  }
  function startLesson(id: number) {
    setToolResult(null);
    setLessonId(id);
    setView("academy");
    setTutorial(true);
    setMode("pro");
    setPlaying(false);
    setManual(false);
    setIndex(0);
    setFeedback("");
    engine.current = new Engine();
    engine.current.decimals = prefs.decimals;
    setHighlight(lessonKeys(lessons[id - 1])[0]);
    refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    if (!playing || !tutorial || index >= keys.length) {
      if (index >= keys.length) setPlaying(false);
      return;
    }
    const id = setTimeout(() => runTo(index + 1), speed);
    return () => clearTimeout(id);
  }, [playing, index, speed, tutorial, lessonId]);
  function press(k: string) {
    setToolResult(null);
    if (tutorial && manual) {
      if (index >= keys.length) {
        setFeedback(
          my
            ? "လေ့ကျင့်နှိပ်ခြင်း ပြီးပါပြီ။ Practice တွင် အဖြေ ဆက်ဖြေပါ။"
            : "Sequence complete. Try the practice exercise.",
        );
        return;
      }
      if (k !== keys[index]) {
        setFeedback(
          `Try ${keys[index]} next. ${my ? "အလင်းပြထားသော ခလုတ်ကို နှိပ်ပါ။" : "Follow the highlighted key."}`,
        );
        setHighlight(keys[index]);
        return;
      }
      c.press(k);
      setIndex(index + 1);
      setHighlight(keys[index + 1] ?? "");
      setFeedback(
        "✓ " +
          (my
            ? "မှန်ပါတယ်။ နောက်တစ်ဆင့်ကို ဆက်ပါ။"
            : "Correct. Continue with the next key."),
      );
    } else {
      setPlaying(false);
      c.press(k);
      setHighlight(k);
      setTimeout(() => setHighlight((h) => (h === k ? "" : h)), 300);
    }
    refresh();
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (modal) {
        if (e.key === "Escape") setModal("");
        if (e.key === "Tab") {
          const dialog = document.querySelector("[role=dialog]");
          const items = dialog?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a[href],input,select,summary",
          );
          if (items?.length) {
            const first = items[0],
              last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        return;
      }
      if ((e.target as HTMLElement).matches("input,select,textarea")) return;
      const map: Record<string, string> = {
        Enter: "ENTER",
        "*": "×",
        "/": "÷",
        "-": "−",
        Escape: "CLx",
        Backspace: "CLx",
      };
      const k = map[e.key] ?? e.key;
      if (
        /^\d$/.test(k) ||
        ["ENTER", "×", "÷", "−", "+", ".", "%", "f", "g"].includes(k)
      ) {
        e.preventDefault();
        press(k);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  function bookmark(id: number) {
    setBookmarks((b) =>
      b.includes(id) ? b.filter((x) => x !== id) : [...b, id],
    );
  }
  function record(kind: "practice" | "quiz", pass: boolean) {
    const old = progress[lessonId] ?? {
      practice: false,
      quiz: false,
      attempts: 0,
      completed: false,
    };
    const p = { ...old, [kind]: old[kind] || pass, attempts: old.attempts + 1 };
    p.completed = p.practice && p.quiz;
    setProgress({ ...progress, [lessonId]: p });
    if (pass) {
      const day = new Date().toISOString().slice(0, 10);
      setDays((d) => (d.includes(day) ? d : [...d, day]));
    }
  }
  function sendKeys(sequence: string[]) {
    setPlaying(false);
    setTutorial(false);
    const next = new Engine();
    sequence.forEach((k) => next.press(k));
    engine.current = next;
    setMode("pro");
    refresh();
    notify(next.error || "Inputs loaded and solved with the RPN engine.");
  }
  function save() {
    setSaved((s) => [
      {
        id: Date.now(),
        name: `Calculation ${s.length + 1}`,
        date: new Date().toISOString(),
        state: snapshot(c),
      },
      ...s,
    ]);
    notify(
      my
        ? "သင့်စက်ထဲတွင် သိမ်းပြီးပါပြီ။"
        : "Calculation saved on this device.",
    );
  }
  async function share() {
    const text = `FinCalc Academy · ${money(c.x.toString(), c.decimals)} ${currency}\nn=${c.financial.n}, i=${c.financial.i}% per period, PV=${c.financial.PV}, PMT=${c.financial.PMT}, FV=${c.financial.FV}, ${c.begin ? "BEGIN" : "END"}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "FinCalc calculation", text });
      else {
        await navigator.clipboard.writeText(text);
        notify("Calculation summary copied.");
      }
    } catch {
      notify("Sharing was cancelled or unavailable. Use the report export.");
    }
  }
  const complete = Object.values(progress).filter((p) => p.completed).length;
  let streak = 0;
  for (let i = 0; i < 3650; i++) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    if (days.includes(date.toISOString().slice(0, 10))) streak++;
    else if (i === 0) continue;
    else break;
  }
  function navigate(id: string) {
    setView(id);
    setMobileNav(false);
    setPlaying(false);
    if (id !== "academy") setTutorial(false);
    setQuery("");
  }
  return (
    <div className={`app-layout ${full ? "fullscreen" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <a
          className="app-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("calculator");
          }}
        >
          <span className="brand-mark">
            <CalcIcon size={24} />
          </span>
          <div>
            FinCalc<span>ACADEMY</span>
          </div>
        </a>
        <div className="workspace-label">YOUR FINANCIAL WORKSPACE</div>
        <nav aria-label="Main navigation">
          {[
            ["calculator", "Calculator", CalcIcon],
            ["academy", "Learning Academy", BookOpen],
            ["compare", "Compare Offers", Scale],
            ["glossary", "Financial Glossary", Library],
            ["saved", "Saved Calculations", Bookmark],
          ].map(([id, label, Icon]) => {
            const I = Icon as typeof CalcIcon;
            return (
              <button
                key={id as string}
                className={view === id ? "nav-item active" : "nav-item"}
                onClick={() => navigate(id as string)}
              >
                <I size={19} />
                <span>{label as string}</span>
                {id === "academy" && <span className="nav-count">7</span>}
                {view === id && <span className="active-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-course">
          <span className="sidebar-course-icon">
            <GraduationIcon />
          </span>
          <h4>
            {my
              ? "နည်းနည်းစီ လေ့လာ၊ ပိုယုံကြည်လာ"
              : "A little learning. A lot of confidence."}
          </h4>
          <p>
            {my
              ? "အခြေခံမှ စ၍ ငွေကြေးကို နားလည်မယ်။"
              : "Build a better relationship with your numbers."}
          </p>
          <div className="course-progress">
            <span style={{ width: `${(complete / 7) * 100}%` }} />
          </div>
          <div className="course-progress-label">
            <span>{complete} of 7 lessons</span>
            <span>{Math.round((complete / 7) * 100)}%</span>
          </div>
          <button
            onClick={() =>
              startLesson(
                complete < 7
                  ? lessons.find((l) => !progress[l.id]?.completed)!.id
                  : 1,
              )
            }
          >
            Continue learning <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="private-badge">
            <ShieldCheck size={17} />
            <div>
              Private by design<span>Your numbers stay yours.</span>
            </div>
          </div>
          <button
            className="settings-button"
            onClick={() => setModal("settings")}
          >
            <Settings2 size={17} />
            Settings & preferences
          </button>
          <span className="version">
            FINCALC ACADEMY <b>v1.0</b>
          </span>
        </div>
      </aside>
      <div className="main-layout">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              title="Toggle menu"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>
              {view === "calculator"
                ? "Financial calculator"
                : view === "academy"
                  ? "Learning academy"
                  : view === "compare"
                    ? "Compare offers"
                    : view === "saved"
                      ? "Saved calculations"
                      : "Financial glossary"}
            </strong>
          </div>
          <div className="topbar-actions">
            <span className="offline-badge">
              <span className="status-dot" />
              {offlineCached ? "Offline ready" : "On-device"}
            </span>
            <button
              className="language-button"
              onClick={() => setPref("my", !my)}
            >
              <Globe size={15} />
              {my ? "မြန်မာ" : "English"}
              <ChevronDown size={12} />
            </button>
            <button
              className="icon-button theme-button"
              title="Toggle theme"
              onClick={() => setPref("dark", !dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="avatar">FA</div>
          </div>
        </header>
        <main>
          {["calculator", "academy"].includes(view) ? (
            <>
              <div className="page-title-row">
                <div>
                  <div className="title-eyebrow">
                    <span />
                    {view === "academy"
                      ? "LEARN BY DOING"
                      : "CLARITY IN EVERY CALCULATION"}
                  </div>
                  <h1>
                    {view === "academy"
                      ? my
                        ? "ငွေကြေးပညာ၊ လက်တွေ့လေ့လာမယ်။"
                        : "Learn the keys. Understand the numbers."
                      : "Financial calculator"}
                    <span className="gold-dot">.</span>
                  </h1>
                  <p>
                    {view === "academy"
                      ? my
                        ? "သင်ခန်းစာတိုင်းတွင် ကိုယ်တိုင်နှိပ်၊ တွက်၊ နားလည်နိုင်ပါသည်။"
                        : "Practical lessons, a real calculator, and a little more confidence with every step."
                      : my
                        ? "မှန်ကန်စွာတွက်ချက်၊ နားလည်စွာဆုံးဖြတ်။ သင့်ငွေကြေးခရီးစဉ် ဒီနေရာက စတင်ပါ။"
                        : "Calculate with precision. Learn with confidence. Make better financial decisions."}
                  </p>
                </div>
                <div className="page-title-actions">
                  <button
                    className="outline-button"
                    onClick={() => setModal("history")}
                  >
                    <History size={15} />
                    <span>History</span>
                  </button>
                  <button className="outline-button save-button" onClick={save}>
                    <Save size={15} />
                    <span>Save calculation</span>
                  </button>
                </div>
              </div>
              <div className="workspace-top">
                <div className="segmented mode-switch">
                  <button
                    className={mode === "pro" ? "active" : ""}
                    onClick={() => setMode("pro")}
                  >
                    <CalcIcon size={16} />
                    Professional calculator
                  </button>
                  <button
                    className={mode === "easy" ? "active" : ""}
                    onClick={() => {
                      setMode("easy");
                      setPlaying(false);
                      setTutorial(false);
                    }}
                  >
                    <Lightbulb size={16} />
                    {my ? "လွယ်ကူစွာတွက်ချက်မယ်" : "Beginner-friendly mode"}
                  </button>
                </div>
                <div className="currency-select">
                  <span>Currency</span>
                  <select
                    aria-label="Currency"
                    value={currency}
                    onChange={(e) => setPref("currency", e.target.value)}
                  >
                    {["MMK", "USD", "THB", "CNY"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                className={`workspace-grid ${tutorial ? "tutorial-grid" : ""}`}
              >
                <Calculator
                  c={c}
                  onPress={press}
                  highlight={highlight}
                  my={my}
                  showStack={showStack}
                  setShowStack={setShowStack}
                  onReset={() => {
                    setPlaying(false);
                    setTutorial(false);
                    engine.current = new Engine();
                    engine.current.decimals = prefs.decimals;
                    setToolResult(null);
                    refresh();
                  }}
                  onHelp={(k) => {
                    setHelpKey(k);
                    setModal("help");
                  }}
                  onFull={() => setFull(!full)}
                  separator={prefs.separator}
                />
                {mode === "easy" ? (
                  <aside className="panel">
                    <Beginner
                      my={my}
                      currency={currency}
                      onResult={(r) => {
                        setToolResult(r);
                        if (r.rows) setShowSchedule(true);
                      }}
                      onKeys={sendKeys}
                    />
                  </aside>
                ) : tutorial ? (
                  <LessonPlayer
                    key={lessonId}
                    lesson={lesson}
                    my={my}
                    index={index}
                    keys={keys}
                    playing={playing}
                    setPlaying={setPlaying}
                    next={() => {
                      setPlaying(false);
                      runTo(Math.min(index + 1, keys.length));
                    }}
                    previous={() => {
                      setPlaying(false);
                      runTo(Math.max(index - 1, 0));
                    }}
                    replay={() => {
                      setPlaying(false);
                      setManual(false);
                      runTo(0);
                    }}
                    manual={manual}
                    setManual={(v) => {
                      setManual(v);
                      if (v) setHighlight(keys[index] ?? "");
                    }}
                    speed={speed}
                    setSpeed={setSpeed}
                    feedback={feedback}
                    progress={progress}
                    onPractice={(pass) => record("practice", pass)}
                    onQuiz={(pass) => record("quiz", pass)}
                    onBookmark={() => bookmark(lessonId)}
                    bookmarked={bookmarks.includes(lessonId)}
                  />
                ) : (
                  <aside className="learn-start panel">
                    <div className="card-kicker">
                      <span className="tiny-star">✧</span> MORE THAN A
                      CALCULATOR
                    </div>
                    <div className="learning-art">
                      <div className="art-grid" />
                      <div className="art-card back">
                        <TrendingUp size={32} />
                        <div className="mini-bars">
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                      <div className="art-card front">
                        <span className="art-icon">
                          <BookOpen size={22} />
                        </span>
                        <div>
                          <b>Learn. Calculate.</b>
                          <span>Understand.</span>
                        </div>
                        <div className="art-complete">
                          <Check size={11} />
                        </div>
                      </div>
                      <span className="art-spark s1">✧</span>
                      <span className="art-spark s2">✧</span>
                    </div>
                    <span className="eyebrow">
                      MEET YOUR LEARNING COMPANION
                    </span>
                    <h2>
                      {my
                        ? "ခလုတ်နှိပ်ရုံထက် ပိုပြီး နားလည်မယ်။"
                        : "Know more than which button to press."}
                    </h2>
                    <p>
                      {my
                        ? "ငွေကြေးတွက်ချက်နည်းတွေကို မြန်မာဘာသာဖြင့် အဆင့်လိုက် လေ့လာပါ။ တကယ့်ခလုတ်တွေနဲ့ ကိုယ်တိုင် စမ်းကြည့်ပါ။"
                        : "Learn financial concepts step by step, with guided keystrokes and examples from everyday life."}
                    </p>
                    <div className="lesson-preview">
                      <span className="lesson-preview-icon">
                        <Wallet size={20} />
                      </span>
                      <div>
                        <small>RECOMMENDED FIRST STEP</small>
                        <h4>
                          {my
                            ? "ချေးငွေပြန်ဆပ်နည်း"
                            : "Your first loan calculation"}
                        </h4>
                        <span>
                          15 min <span>·</span> Beginner friendly
                        </span>
                      </div>
                      <ChevronRight size={17} />
                    </div>
                    <button
                      className="primary-button full"
                      onClick={() => startLesson(2)}
                    >
                      {my ? "အတူတူ လေ့လာကြမယ်" : "Start learning together"}
                      <ArrowRight size={17} />
                    </button>
                    <div className="learning-proof">
                      <span className="mini-avatars">
                        <i>M</i>
                        <i>K</i>
                        <i>A</i>
                      </span>
                      <span>
                        7 practical lessons. <b>Zero prerequisites.</b>
                      </span>
                    </div>
                  </aside>
                )}
              </div>
              {toolResult?.plot && (
                <section className="panel growth-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">YOUR NUMBERS, VISUALIZED</span>
                      <h3>{toolResult.plotLabel}</h3>
                    </div>
                    <span className="soft-badge">{currency}</span>
                  </div>
                  <Suspense
                    fallback={<div className="chart-wrap">Loading chart…</div>}
                  >
                    <GrowthChart
                      data={toolResult.plot}
                      label={toolResult.plotLabel ?? "Value"}
                      investment={toolResult.title === "Net present value"}
                    />
                  </Suspense>
                </section>
              )}
              {toolResult?.cashFlows && (
                <section className="panel cashflow-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">MONEY IN. MONEY OUT.</span>
                      <h3>Cash-flow direction</h3>
                    </div>
                    <span className="muted">+ received / − paid</span>
                  </div>
                  <div className="cashflow-diagram">
                    {toolResult.cashFlows.map((value, i) => (
                      <div
                        className={
                          value >= 0 ? "cash-positive" : "cash-negative"
                        }
                        key={i}
                        tabIndex={0}
                        title={`${i === 0 ? "Today" : "Cash flow " + i}: ${money(value)} ${currency}`}
                      >
                        <b>{value >= 0 ? "↑" : "↓"}</b>
                        <strong>{money(value, 0)}</strong>
                        <span>
                          {i === 0
                            ? "Today"
                            : toolResult.title === "Future value" ||
                                toolResult.title === "Present value" ||
                                (i === toolResult.cashFlows!.length - 1 &&
                                  toolResult.title ===
                                    "Required monthly saving")
                              ? "Future"
                              : `Period ${i}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="convention">
                    Direction illustrates the selected calculation from one
                    viewpoint. Long monthly plans show the first 12 periodic
                    flows; the schedule contains all payments. Future receipts
                    are shown separately.
                  </p>
                </section>
              )}
              <section className="register-section">
                <div className="register-heading">
                  <span>
                    <span className="register-symbol">▥</span>Financial
                    registers
                  </span>
                  <small>
                    LIVE VALUES <span className="status-dot" />
                  </small>
                  <button
                    onClick={() => {
                      setHelpKey("PV");
                      setModal("help");
                    }}
                    className="icon-button"
                    title="About financial registers"
                  >
                    <InfoIcon />
                  </button>
                </div>
                <div className="register-grid">
                  {Object.entries(c.financial).map(([key, value]) => (
                    <button
                      key={key}
                      className="register-card"
                      onClick={() => {
                        setHelpKey(key);
                        setModal("help");
                      }}
                    >
                      <div>
                        <b>{key}</b>
                        <span>
                          {key === "n"
                            ? "Periods"
                            : key === "i"
                              ? "Interest / period"
                              : key === "PV"
                                ? "Present value"
                                : key === "PMT"
                                  ? "Payment"
                                  : "Future value"}
                        </span>
                      </div>
                      <strong>
                        {money(
                          value.toString(),
                          key === "n" ? 0 : prefs.decimals,
                          prefs.separator,
                        )}
                        {key === "i" && <small>%</small>}
                      </strong>
                    </button>
                  ))}
                </div>
                <p className="register-hint">
                  <Lightbulb size={13} />
                  {my
                    ? "တန်ဖိုးကို ရိုက်ပြီး သက်ဆိုင်ရာ ခလုတ်နှိပ်၍ မှတ်ပါ။ သိပြီးသားတန်ဖိုးများ မှတ်ပြီးနောက် ရှာချင်သောခလုတ်ကို နှိပ်ပါ။"
                    : "Enter a value, then its financial key to store it. After storing the known values, press the unknown key to solve."}
                  <button onClick={share}>
                    <Share2 size={13} />
                    Share result
                  </button>
                </p>
              </section>
              {(tutorial && lessonId === 2) ||
              (mode === "easy" && toolResult?.rows) ||
              showSchedule ||
              professionalLoan ? (
                <>
                  <div className="insight-grid">
                    <section className="panel chart-panel">
                      <div className="panel-heading">
                        <div>
                          <span className="eyebrow">
                            {toolResult?.rows || professionalLoan
                              ? "YOUR REPAYMENT PLAN"
                              : "LESSON EXAMPLE · 100,000 · 12% · 12 MONTHS"}
                          </span>
                          <h3>
                            {my
                              ? "ချေးငွေလက်ကျန် တဖြည်းဖြည်း လျော့လာပုံ"
                              : "Watch your loan balance fall"}
                          </h3>
                        </div>
                        <div className="segmented small">
                          <button
                            className={chartKind === "balance" ? "active" : ""}
                            onClick={() => setChartKind("balance")}
                          >
                            Balance
                          </button>
                          <button
                            className={chartKind === "split" ? "active" : ""}
                            onClick={() => setChartKind("split")}
                          >
                            Breakdown
                          </button>
                        </div>
                      </div>
                      <Suspense
                        fallback={
                          <div className="chart-wrap">Loading chart…</div>
                        }
                      >
                        <FinancialCharts rows={resultRows} kind={chartKind} />
                      </Suspense>
                    </section>
                    <section className="panel summary-card">
                      <span className="eyebrow">THE BIG PICTURE</span>
                      <h3>
                        {my ? "ချေးငွေ အကျဉ်းချုပ်" : "Your loan at a glance"}
                      </h3>
                      <div className="summary-value">
                        <span>Regular payment · {currency}</span>
                        <strong>{money(resultRows[0]?.payment ?? 0)}</strong>
                      </div>
                      <div className="metric-line">
                        <span>Total interest</span>
                        <strong>
                          {money(
                            resultRows.reduce(
                              (s, r) => D(s).plus(r.interest).toNumber(),
                              0,
                            ),
                          )}
                        </strong>
                      </div>
                      <div className="metric-line">
                        <span>Total repayment</span>
                        <strong>
                          {money(
                            resultRows.reduce(
                              (s, r) => D(s).plus(r.payment).toNumber(),
                              0,
                            ),
                          )}
                        </strong>
                      </div>
                      <p className="convention">
                        Monthly reducing balance. Payments rounded half up to 2
                        decimal places. The final payment may differ.
                      </p>
                    </section>
                  </div>
                  <AmortizationTable
                    rows={resultRows}
                    currency={currency}
                    my={my}
                  />
                </>
              ) : view === "calculator" ? (
                <section className="discovery-grid">
                  <button
                    className="discovery-card"
                    onClick={() => {
                      setMode("easy");
                      setTutorial(false);
                    }}
                  >
                    <span className="discovery-icon">
                      <Wallet size={21} />
                    </span>
                    <div>
                      <h3>
                        {my
                          ? "ချေးငွေကို အရင်နားလည်မယ်"
                          : "Borrow with a clearer picture"}
                      </h3>
                      <p>Explore payments, interest & repayment plans.</p>
                    </div>
                    <ArrowUpRight size={18} />
                  </button>
                  <button
                    className="discovery-card"
                    onClick={() => startLesson(3)}
                  >
                    <span className="discovery-icon green">
                      <Target size={21} />
                    </span>
                    <div>
                      <h3>
                        {my
                          ? "အနာဂတ်အတွက် စုဆောင်းမယ်"
                          : "Give your savings a destination"}
                      </h3>
                      <p>Turn a monthly habit into a future goal.</p>
                    </div>
                    <ArrowUpRight size={18} />
                  </button>
                </section>
              ) : null}
              {view === "academy" && (
                <LessonCards
                  my={my}
                  selected={lessonId}
                  onSelect={startLesson}
                  progress={progress}
                  bookmarks={bookmarks}
                  onBookmark={bookmark}
                />
              )}
            </>
          ) : view === "compare" ? (
            <Comparison my={my} currency={currency} />
          ) : view === "glossary" ? (
            <>
              <div className="page-intro">
                <span className="eyebrow">
                  FINANCIAL WORDS, HUMAN EXPLANATIONS
                </span>
                <h1>
                  {my ? "ငွေကြေးအဘိဓာန်" : "A little clarity goes a long way."}
                </h1>
                <p>
                  {my
                    ? "ခက်ခဲသောစကားလုံးများကို လွယ်ကူစွာ နားလည်မယ်။"
                    : "Simple explanations for the terms behind your calculations."}
                </p>
              </div>
              <div className="search-box">
                <Search size={18} />
                <input
                  aria-label="Search glossary"
                  placeholder="Search PV, interest, အတိုး…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="glossary-grid">
                {glossary
                  .filter((x) =>
                    x.join(" ").toLowerCase().includes(query.toLowerCase()),
                  )
                  .map(([en, mm, desc, enDesc]) => (
                    <article className="panel glossary-card" key={en}>
                      <span className="glossary-icon">
                        <Library size={19} />
                      </span>
                      <h3>{en}</h3>
                      <h4>{mm}</h4>
                      <p>{my ? desc : enDesc}</p>
                    </article>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="page-intro">
                <span className="eyebrow">
                  YOUR PERSONAL CALCULATION NOTEBOOK
                </span>
                <h1>
                  {my
                    ? "သိမ်းထားသော တွက်ချက်မှုများ"
                    : "Pick up where you left off."}
                </h1>
                <p>
                  Saved only in this browser. No financial information leaves
                  your device.
                </p>
              </div>
              <div className="saved-list">
                {saved.length ? (
                  saved.map((s) => (
                    <article className="panel saved-card" key={s.id}>
                      <span className="discovery-icon">
                        <CalcIcon size={22} />
                      </span>
                      <div>
                        <input
                          aria-label="Calculation name"
                          value={s.name}
                          onChange={(e) =>
                            setSaved(
                              saved.map((x) =>
                                x.id === s.id
                                  ? { ...x, name: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                        <p>
                          {new Date(s.date).toLocaleString()} ·{" "}
                          {s.state.begin ? "BEGIN" : "END"}
                        </p>
                      </div>
                      <strong>{money(s.state.stack[0])}</strong>
                      <button
                        className="outline-button"
                        onClick={() => {
                          engine.current = restore(s.state);
                          navigate("calculator");
                          refresh();
                          notify("Saved calculation restored.");
                        }}
                      >
                        Load <ArrowRight size={14} />
                      </button>
                      <button
                        className="icon-button"
                        title="Delete saved calculation"
                        onClick={() =>
                          setSaved(saved.filter((x) => x.id !== s.id))
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="empty-state panel">
                    <Bookmark size={40} />
                    <h2>Your next useful number belongs here.</h2>
                    <p>
                      Use “Save calculation” to store the stack, registers, cash
                      flows, and result.
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => navigate("calculator")}
                    >
                      Open calculator <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
              {bookmarks.length > 0 && (
                <>
                  <h2 className="bookmarks-heading">Bookmarked lessons</h2>
                  <div className="bookmark-list">
                    {bookmarks.map((id) => (
                      <button
                        className="panel"
                        key={id}
                        onClick={() => startLesson(id)}
                      >
                        <BookOpen size={20} />
                        {my ? lessons[id - 1].my : lessons[id - 1].title}
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          <footer>
            <div>
              <span className="footer-brand">FinCalc Academy</span>
              <span>A little more confidence in every decision.</span>
            </div>
            <button onClick={() => setModal("about")}>
              About & calculator compatibility <ExternalLink size={12} />
            </button>
            <div className="footer-legal">
              Independent educational application inspired by classic financial
              calculator workflows. Not affiliated with or endorsed by HP.
            </div>
          </footer>
        </main>
      </div>
      {full && (
        <button
          className="exit-fullscreen primary-button"
          onClick={() => setFull(false)}
        >
          <X size={16} />
          Exit full screen
        </button>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal("")}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={modal === "help" ? "Calculator key help" : modal}
            className="modal panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close dialog"
              autoFocus
              onClick={() => setModal("")}
            >
              <X size={20} />
            </button>
            {modal === "help" ? (
              <KeyHelp keyName={helpKey} my={my} />
            ) : modal === "history" ? (
              <>
                <span className="eyebrow">YOUR CURRENT SESSION</span>
                <h2>Calculation history</h2>
                <div className="history-list">
                  {c.history.length ? (
                    [...c.history].reverse().map((h, i) => (
                      <div key={i}>
                        <kbd>{h.key}</kbd>
                        <span>{money(h.value, Math.min(c.decimals, 8))}</span>
                      </div>
                    ))
                  ) : (
                    <p>
                      No key presses yet. Start a calculation to see each result
                      here.
                    </p>
                  )}
                </div>
                <button
                  className="outline-button"
                  onClick={() =>
                    download(
                      "fincalc-history.csv",
                      "Key,Result\n" +
                        c.history
                          .map((h) => `"${h.key}",${h.value}`)
                          .join("\n"),
                      "text/csv",
                    )
                  }
                >
                  Export history <Download size={15} />
                </button>
              </>
            ) : modal === "settings" ? (
              <>
                <span className="eyebrow">MAKE IT YOURS</span>
                <h2>Settings & preferences</h2>
                <div className="form-grid">
                  <label>
                    Language
                    <select
                      value={my ? "my" : "en"}
                      onChange={(e) => setPref("my", e.target.value === "my")}
                    >
                      <option value="my">မြန်မာ Unicode</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                  <label>
                    Currency
                    <select
                      value={currency}
                      onChange={(e) => setPref("currency", e.target.value)}
                    >
                      {["MMK", "USD", "THB", "CNY"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Display decimals
                    <select
                      value={prefs.decimals}
                      onChange={(e) =>
                        setPref("decimals", Number(e.target.value))
                      }
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Thousands separators
                    <select
                      value={prefs.separator ? "yes" : "no"}
                      onChange={(e) =>
                        setPref("separator", e.target.value === "yes")
                      }
                    >
                      <option value="yes">1,000.00</option>
                      <option value="no">1000.00</option>
                    </select>
                  </label>
                  <label>
                    Theme
                    <select
                      value={dark ? "dark" : "light"}
                      onChange={(e) =>
                        setPref("dark", e.target.value === "dark")
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </label>
                  <label>
                    Calculator timing
                    <select
                      value={c.begin ? "begin" : "end"}
                      onChange={(e) => {
                        c.begin = e.target.value === "begin";
                        refresh();
                      }}
                    >
                      <option value="end">END</option>
                      <option value="begin">BEGIN</option>
                    </select>
                  </label>
                </div>
                <div className="tip">
                  <LockKeyhole size={16} />
                  <p>
                    Currencies are input/display units. No exchange-rate
                    conversion is performed. Internal calculations retain 40
                    significant decimal digits; display formatting does not
                    change stored values.
                  </p>
                </div>
                <p className="muted">
                  Learning activity: {complete}/7 lessons · {streak} day streak
                  ·{" "}
                  {Object.values(progress).reduce((s, p) => s + p.attempts, 0)}{" "}
                  attempts.
                </p>
                <button
                  className="danger-button"
                  onClick={() => setModal("clear")}
                >
                  Clear saved app data
                </button>
              </>
            ) : modal === "clear" ? (
              <>
                <h2>Clear your local data?</h2>
                <p>
                  This removes saved calculations, bookmarks, lesson progress
                  and preferences from this browser.
                </p>
                <button
                  className="danger-button"
                  onClick={() => {
                    Object.keys(localStorage)
                      .filter((k) => k.startsWith("fincalc."))
                      .forEach((k) => localStorage.removeItem(k));
                    setSaved([]);
                    setProgress({});
                    setBookmarks([]);
                    setDays([]);
                    setPrefs({
                      my: true,
                      dark: false,
                      currency: "MMK",
                      decimals: 2,
                      separator: true,
                    });
                    setModal("");
                    notify("Local app data cleared.");
                  }}
                >
                  Clear local data
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">BUILT FOR UNDERSTANDING</span>
                <h2>FinCalc Academy</h2>
                <p>
                  Independent educational application inspired by classic
                  financial calculator workflows. Not affiliated with or
                  endorsed by HP.
                </p>
                <h3>Supported in this release</h3>
                <p>
                  Four-level RPN stack, arithmetic, CHS, EEX, ENTER, stack roll
                  and swap, Last X, STO/RCL 0–9 and financial registers,
                  percentage functions, powers, roots, logarithms, factorial,
                  TVM, BEGIN/END, 12× / 12÷, INT, AMORT, cash-flow groups CF0 /
                  CFj / Nj, NPV and conventional IRR, calendar dates and actual
                  day differences.
                </p>
                <h3>Compatibility limits</h3>
                <p>
                  This is not a fully compatible HP 12C emulator. Programming
                  (R/S, SST), statistics (Σ+, regressions, means), bonds,
                  depreciation, memory allocation, conditional program functions
                  and 30/360 calendar output are unsupported and return explicit
                  notices. Fractional-period TVM uses standard compound growth;
                  classic odd-period simple-interest conventions and automatic
                  upward rounding of n are not reproduced. Rate solving searches
                  a finite domain; non-conventional IRR is explicitly declined.
                </p>
                <p>
                  Reference:{" "}
                  <a
                    href="https://literature.hpcalc.org/official/hp12c-ug-en.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official HP 12C user guide
                  </a>{" "}
                  · pages 16–35, 54–65, 170–179.
                </p>
                <div className="tip">
                  <p>
                    This application is for financial education and calculation.
                    Results depend on the entered assumptions and rounding
                    conventions. Verify important financial decisions against
                    actual contracts and qualified advice.
                  </p>
                </div>
                <p className="muted">
                  Currency selection does not convert values. Offline operation
                  becomes available after an initial successful online load.
                </p>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function GraduationIcon() {
  return <BookOpen size={21} />;
}
function InfoIcon() {
  return <span style={{ fontSize: 14 }}>ⓘ</span>;
}
