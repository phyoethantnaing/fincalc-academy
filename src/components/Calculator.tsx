import { useRef, useState } from "react";
import {
  Copy,
  RotateCcw,
  Maximize2,
  HelpCircle,
  ChevronDown,
  Keyboard,
  WifiOff,
} from "lucide-react";
import { Calculator as Engine, KEYS } from "../engine/rpn";
import { money, KEY_HELP } from "../utils";
export function Calculator({
  c,
  onPress,
  highlight,
  my,
  showStack,
  setShowStack,
  onReset,
  onHelp,
  onFull,
  separator,
}: {
  c: Engine;
  onPress: (key: string) => void;
  highlight: string;
  my: boolean;
  showStack: boolean;
  setShowStack: (v: boolean) => void;
  onReset: () => void;
  onHelp: (key: string) => void;
  onFull: () => void;
  separator: boolean;
}) {
  const [touch, setTouch] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <section className={`calculator-workspace ${touch ? "touch-layout" : ""}`}>
      <div className="section-toolbar">
        <span>
          <span className="status-dot" />{" "}
          {my ? "အသင့်ဖြစ်ပါပြီ" : "Ready to calculate"} <b>RPN</b>
        </span>
        <div>
          <button
            className="icon-button"
            title="Key help"
            onClick={() => onHelp("ENTER")}
          >
            <HelpCircle size={16} />
          </button>
          <button
            className="icon-button"
            title="Reset calculator"
            onClick={onReset}
          >
            <RotateCcw size={16} />
          </button>
          <button
            className="icon-button"
            title="Full-screen calculator"
            onClick={onFull}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      <div className="calc-shell">
        <div className="calc-top">
          <div className="calc-brand">
            <span className="brand-glyph">f</span>
            <div>
              FINCALC <span>PROFESSIONAL</span>
            </div>
          </div>
          <span className="model-label">FINANCIAL CALCULATOR</span>
        </div>
        <div className="display-frame">
          <div className="lcd">
            <div className="lcd-status">
              <span>{c.prefix || "RPN"}</span>
              <span>
                {c.begin ? "BEGIN" : "END"}{" "}
                <span className="lcd-currency">• DEC {c.decimals}</span>
              </span>
            </div>
            <output aria-label="Calculator display" aria-live="polite">
              {!c.on
                ? ""
                : c.error
                  ? "Error"
                  : c.dateDisplay
                    ? c.dateDisplay
                    : c.entering
                      ? c.entry
                      : Math.abs(c.x.toNumber()) >= 1e12
                        ? c.x.toExponential(6)
                        : money(c.x.toString(), c.decimals, separator)}
            </output>
            <div className="lcd-bottom">
              <span>
                {c.error
                  ? "CHECK INPUT"
                  : my
                    ? "တစ်ကြိမ်စီ မှန်ကန်စွာတွက်ချက်ပါ"
                    : "PRECISION IN EVERY DECISION"}
              </span>
              <span>▰ ▰ ▰</span>
            </div>
          </div>
        </div>
        <div className="keypad">
          {KEYS.map((k) => (
            <div
              className={`key-wrap ${k.id === "ENTER" ? "enter-key" : ""} ${k.id === "0" ? "zero-key" : ""}`}
              key={k.id}
            >
              <span className="gold-label">{k.f || "\u00a0"}</span>
              <button
                aria-label={`Key ${k.id}`}
                title={
                  ["R/S", "SST", "Σ+"].includes(k.id)
                    ? "Unsupported original-device function — press for details"
                    : undefined
                }
                className={`calc-key ${["R/S", "SST", "Σ+"].includes(k.id) ? "unsupported-key" : ""} ${["f", "g"].includes(k.id) ? "shift-" + k.id : ""} ${/^\d$|^\.$/.test(k.id) ? "number-key" : ""} ${["n", "i", "PV", "PMT", "FV"].includes(k.id) ? "finance-key" : ""} ${highlight === k.id ? "key-highlight" : ""}`}
                onClick={() => onPress(k.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onHelp(k.id);
                }}
                onPointerDown={() => {
                  hold.current = setTimeout(() => onHelp(k.id), 650);
                }}
                onPointerUp={() => {
                  if (hold.current) clearTimeout(hold.current);
                }}
                onPointerLeave={() => {
                  if (hold.current) clearTimeout(hold.current);
                }}
              >
                <span>
                  {k.id === "ENTER" ? (
                    <>
                      E<br />N<br />T<br />E<br />R
                    </>
                  ) : (
                    k.id
                  )}
                </span>
                {k.g && <small>{k.g}</small>}
                {highlight === k.id && <span className="press-finger">☝</span>}
              </button>
            </div>
          ))}
        </div>
        <div className="calc-bottom">
          <span>FINCALC ACADEMY</span>
          <span>CLASSIC RPN WORKFLOW</span>
        </div>
      </div>
      {c.error && (
        <div className="error-banner" role="alert">
          {c.error}
        </div>
      )}
      <div className="below-calc">
        <button className="touch-toggle" onClick={() => setTouch(!touch)}>
          {touch ? "Classic layout" : "Larger touch keys"}
        </button>
        <button onClick={() => setShowStack(!showStack)}>
          <span className="stack-icon">≋</span>
          {my ? "Stack ကိုကြည့်မယ်" : "Stack & memory"}
          <ChevronDown size={14} className={showStack ? "rotate" : ""} />
        </button>
        <span>
          <Keyboard size={13} />{" "}
          {my ? "ကီးဘုတ်ဖြင့်လည်း သုံးနိုင်သည်" : "Keyboard enabled"}
        </span>
      </div>
      {showStack && (
        <div className="stack-grid">
          {[3, 2, 1, 0].map((i) => (
            <div key={i}>
              <label>{["X · DISPLAY", "Y", "Z", "T"][i]}</label>
              <strong>{money(c.stack[i].toString(), 4, separator)}</strong>
            </div>
          ))}
          <div>
            <label>LAST X</label>
            <strong>{money(c.lastX.toString(), 4, separator)}</strong>
          </div>
        </div>
      )}
      <div className="local-note">
        <WifiOff size={13} />
        <span>
          {my
            ? "သင့်စက်ထဲတွင်သာ တွက်ချက်သည်။ အင်တာနက်မလိုပါ။"
            : "Calculated on your device. No account. No cloud storage."}
        </span>
        <button
          title="Copy result"
          className="icon-button"
          onClick={() => navigator.clipboard?.writeText(c.x.toString())}
        >
          <Copy size={14} />
        </button>
      </div>
    </section>
  );
}
export function KeyHelp({ keyName, my }: { keyName: string; my: boolean }) {
  const spec = KEYS.find((k) => k.id === keyName),
    help = KEY_HELP[keyName];
  return (
    <>
      <div className="help-key">{keyName}</div>
      <h2>
        {help?.en ??
          (/^\d$/.test(keyName) ? "Digit entry" : "Calculator function")}
      </h2>
      <p>
        {help?.my ??
          (my
            ? "လက်ရှိကိန်းကို ထည့်ရန် သို့မဟုတ် stack ပေါ်ရှိကိန်းများကို ပြောင်းလဲတွက်ချက်ရန် သုံးပါ။ အဆင့်လိုက်သင်ခန်းစာတွင် စမ်းသုံးနိုင်သည်။"
            : "Use this key in RPN calculations. Select a lesson to see a worked sequence.")}
      </p>
      <div className="formula">
        {help?.example ?? `2 → ENTER → 3 → ${keyName}`}
      </div>
      {spec?.f && (
        <p>
          <b className="gold-text">f → {keyName}</b> · {spec.f}
        </p>
      )}
      {spec?.g && (
        <p>
          <b className="blue-text">g → {keyName}</b> · {spec.g}
        </p>
      )}
      <p className="muted">
        Related lessons: Calculator basics · Loan amortization
      </p>
    </>
  );
}
