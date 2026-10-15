import { useState } from "react";
import { ArrowRight, Calculator, Info } from "lucide-react";
import { z } from "zod";
import {
  D,
  solve,
  compound,
  simpleInterest,
  discount,
  npv,
  irr,
  cagr,
  roi,
  ear,
  amortization,
  type LoanRow,
} from "../engine/finance";
import { money } from "../utils";
export type ToolResult = {
  title: string;
  value: number;
  detail: string;
  metrics: { label: string; value: string }[];
  keys: string[];
  rows?: LoanRow[];
  plot?: { period: number; value: number }[];
  plotLabel?: string;
  cashFlows?: number[];
};
const nums = z.object({
  amount: z.coerce.number().positive().max(1e15),
  rate: z.coerce.number().min(0).max(1000),
  months: z.coerce.number().int().min(1).max(1200),
  future: z.coerce.number().min(0).max(1e15),
});
export function Beginner({
  my,
  currency,
  onResult,
  onKeys,
}: {
  my: boolean;
  currency: string;
  onResult: (r: ToolResult) => void;
  onKeys: (keys: string[]) => void;
}) {
  const [tool, setTool] = useState("loan"),
    [amount, setAmount] = useState("100000"),
    [rate, setRate] = useState("12"),
    [months, setMonths] = useState("12"),
    [future, setFuture] = useState("200000"),
    [begin, setBegin] = useState(false),
    [frequency, setFrequency] = useState(12),
    [basis, setBasis] = useState(360),
    [flows, setFlows] = useState("-100000,60000,60000"),
    [error, setError] = useState(""),
    [result, setResult] = useState<ToolResult | null>(null);
  const tools = [
    ["loan", "ချေးငွေ / အရစ်ကျ", "Loan & installments"],
    ["savings", "ငွေစုတွက်မယ်", "Regular savings"],
    ["compound", "ပေါင်းတိုးအတိုး", "Compound interest"],
    ["simple", "ရိုးရိုးအတိုး", "Simple interest"],
    ["pv", "ယနေ့တန်ဖိုး", "Present value"],
    ["fv", "အနာဂတ်တန်ဖိုး", "Future value"],
    ["investment", "ရင်းနှီးမြှုပ်နှံမှု", "Investment return"],
    ["discount", "အတိုးကြိုဖြတ်", "Bank discount"],
  ];
  function calculate() {
    try {
      const p = nums.parse({ amount, rate, months, future });
      const a = D(amount),
        r = D(rate),
        n = D(months),
        fv = D(future);
      let plot: ToolResult["plot"],
        plotLabel = "",
        cashFlows: number[] | undefined;
      let value = D(0),
        detail = "",
        title = "",
        keys: string[] = [],
        metrics: ToolResult["metrics"] = [],
        rows: LoanRow[] | undefined;
      const clear = ["f", "x↔y", "g", begin ? "7" : "8"];
      const enter = (s: string, k: string) => [...s.split(""), k];
      if (tool === "loan") {
        const loan = amortization(a, r, p.months, begin);
        value = D(loan.payment);
        title = "Monthly payment";
        detail =
          "Reducing balance · nominal annual rate ÷ 12 · final payment adjusted";
        metrics = [
          { label: "Total interest", value: money(loan.interest) },
          { label: "Total repayment", value: money(loan.total) },
        ];
        rows = loan.rows;
        keys = [
          ...clear,
          ...enter(months, "n"),
          ...rate.split(""),
          "g",
          "i",
          ...enter(amount, "PV"),
          "0",
          "FV",
          "PMT",
        ];
      }
      if (tool === "savings") {
        value = solve(
          { n, i: r.div(12), PV: 0, PMT: 0, FV: fv, begin },
          "PMT",
        ).abs();
        title = "Required monthly saving";
        detail =
          "Target-based annuity · zero initial balance · nominal annual rate ÷ 12";
        metrics = [
          { label: "Savings target", value: money(future) },
          { label: "Payment timing", value: begin ? "BEGIN" : "END" },
        ];
        keys = [
          ...clear,
          ...enter(months, "n"),
          ...rate.split(""),
          "g",
          "i",
          "0",
          "PV",
          ...enter(future, "FV"),
          "PMT",
        ];
      }
      if (tool === "compound" || tool === "fv") {
        value = compound(a, r, n.div(12), frequency);
        title = "Future value";
        detail = `${frequency} compounds / year · term in months · daily compounding uses 365`;
        metrics = [
          { label: "Principal", value: money(amount) },
          {
            label: "Accumulated interest",
            value: money(value.minus(a).toString()),
          },
          {
            label: "Effective annual rate",
            value: money(ear(r, frequency).toString(), 4) + "%",
          },
        ];
        keys = [
          ...clear,
          ...enter(n.div(12).mul(frequency).toString(), "n"),
          ...enter(r.div(frequency).toString(), "i"),
          ...amount.split(""),
          "CHS",
          "PV",
          "0",
          "PMT",
          "FV",
        ];
      }
      if (tool === "pv") {
        value = solve(
          { n, i: r.div(12), PV: 0, PMT: 0, FV: fv, begin: false },
          "PV",
        ).abs();
        title = "Present value";
        detail = "Monthly discounting · nominal annual discount rate ÷ 12";
        metrics = [
          { label: "Future amount", value: money(future) },
          { label: "Discount", value: money(fv.minus(value).toString()) },
        ];
        keys = [
          ...clear,
          ...enter(months, "n"),
          ...rate.split(""),
          "g",
          "i",
          "0",
          "PMT",
          ...enter(future, "FV"),
          "PV",
        ];
      }
      if (tool === "simple") {
        value = simpleInterest(a, r, n, basis);
        title = "Simple interest";
        detail = `Time interpreted as days · ${basis}-day year · no compounding`;
        metrics = [
          { label: "Total owed", value: money(a.plus(value).toString()) },
        ];
        keys = [
          ...clear,
          ...enter(months, "n"),
          ...enter(rate, "i"),
          ...amount.split(""),
          "CHS",
          "PV",
          "f",
          "i",
          ...(basis === 365 ? ["R↓", "x↔y"] : []),
        ];
      }
      if (tool === "discount") {
        const d = discount(a, r, n, basis);
        value = d.proceeds;
        title = "Actual proceeds";
        detail = `Annual simple cost is not EAR · ${basis}-day basis · term in days`;
        metrics = [
          { label: "Upfront discount", value: money(d.amount.toString()) },
          {
            label: "Annual simple cost",
            value: money(d.effective.toString(), 4) + "%",
          },
        ];
        keys = [
          ...amount.split(""),
          "ENTER",
          ...rate.split(""),
          "%",
          ...months.split(""),
          "×",
          ...String(basis).split(""),
          "÷",
          "−",
        ];
      }
      if (tool === "investment") {
        const values = flows.split(",").map((s) => D(s.trim()));
        if (
          values.length < 2 ||
          values.length > 100 ||
          values.some((v) => !v.isFinite())
        )
          throw Error("Enter 2–100 finite cash flows, separated by commas.");
        value = npv(values, r);
        title = "Net present value";
        detail =
          "Equal periods · cash flow 0 occurs today · rate is per period";
        let ir = "";
        try {
          ir = money(irr(values).toString(), 4) + "%";
        } catch (e) {
          ir = (e as Error).message;
        }
        metrics = [
          { label: "Periodic IRR", value: ir },
          {
            label: "ROI (terminal gain / initial cost)",
            value: money(roi(fv, a).toString(), 2) + "%",
          },
          {
            label: "CAGR (terminal value)",
            value: money(cagr(a, fv, n.div(12)).toString(), 4) + "%",
          },
        ];
        keys = [
          "f",
          "x↔y",
          ...rate.split(""),
          "i",
          ...values.flatMap((v, j) => [
            ...v.abs().toString().split(""),
            ...(v.isNegative() ? ["CHS"] : []),
            "g",
            j === 0 ? "PV" : "PMT",
          ]),
          "f",
          "PV",
        ];
      }
      if (tool === "savings") {
        plot = Array.from({ length: p.months + 1 }, (_, k) => ({
          period: k,
          value: solve(
            { n: k, i: r.div(12), PV: 0, PMT: value.neg(), FV: 0, begin },
            "FV",
          ).toNumber(),
        }));
        plotLabel = "Savings accumulation";
        cashFlows = [
          0,
          ...Array.from({ length: Math.min(p.months, 12) }, () =>
            value.neg().toNumber(),
          ),
          fv.toNumber(),
        ];
      }
      if (tool === "compound" || tool === "fv") {
        plot = Array.from({ length: p.months + 1 }, (_, k) => ({
          period: k,
          value: compound(a, r, D(k).div(12), frequency).toNumber(),
        }));
        plotLabel = "Compound growth · monthly observation";
        cashFlows = [a.neg().toNumber(), value.toNumber()];
      }
      if (tool === "pv") {
        plot = [
          { period: 0, value: value.toNumber() },
          { period: p.months, value: fv.toNumber() },
        ];
        plotLabel = "Present and future value";
        cashFlows = [value.neg().toNumber(), fv.toNumber()];
      }
      if (tool === "investment") {
        cashFlows = flows.split(",").map((s) => D(s.trim()).toNumber());
        plot = cashFlows.map((v, k) => ({ period: k, value: v }));
        plotLabel = "Investment cash flows · equal periods";
      }
      if (tool === "loan") {
        cashFlows = [
          a.toNumber(),
          ...rows!.slice(0, 12).map((r) => -r.payment),
        ];
      }
      if (tool === "discount") {
        cashFlows = [value.toNumber(), a.neg().toNumber()];
      }
      if (tool === "simple") {
        cashFlows = [a.neg().toNumber(), a.plus(value).toNumber()];
      }
      const res = {
        title,
        value: value.toNumber(),
        detail,
        metrics,
        keys,
        rows,
        plot,
        plotLabel,
        cashFlows,
      };
      setResult(res);
      onResult(res);
      setError("");
    } catch (e) {
      setError(
        e instanceof z.ZodError
          ? "Enter a positive amount, a valid rate, and 1–1200 periods."
          : (e as Error).message,
      );
    }
  }
  return (
    <div className="beginner-form">
      <div className="card-kicker">
        <Calculator size={16} />
        {my ? "လွယ်ကူစွာတွက်ချက်မယ်" : "A simpler way to calculate"}
      </div>
      <h2>
        {my ? "ကိန်းဂဏန်းတွေကို နားလည်မယ်။" : "Make your numbers make sense."}
      </h2>
      <label>
        {my ? "ဘာတွက်ချင်ပါသလဲ။" : "Choose a calculation"}
        <select
          value={tool}
          onChange={(e) => {
            setTool(e.target.value);
            setResult(null);
          }}
        >
          {tools.map(([id, mm, en]) => (
            <option value={id} key={id}>
              {my ? mm : en}
            </option>
          ))}
        </select>
      </label>
      <div className="form-grid">
        <label>
          {tool === "discount"
            ? "Face value"
            : tool === "investment"
              ? "Initial investment"
              : `Amount (${currency})`}
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
          />
        </label>
        <label>
          {tool === "investment"
            ? "Periodic discount rate (%)"
            : "Annual nominal rate (%)"}
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            type="number"
            min="0"
            step=".1"
          />
        </label>
        <label>
          {["simple", "discount"].includes(tool)
            ? "Duration (days)"
            : "Duration (months)"}
          <input
            type="number"
            value={months}
            min="1"
            max="1200"
            onChange={(e) => setMonths(e.target.value)}
          />
        </label>
        {["pv", "savings", "investment"].includes(tool) ? (
          <label>
            {tool === "investment" ? "Terminal value" : "Future target"}
            <input
              type="number"
              value={future}
              onChange={(e) => setFuture(e.target.value)}
            />
          </label>
        ) : ["simple", "discount"].includes(tool) ? (
          <label>
            Day-count basis
            <select
              value={basis}
              onChange={(e) => setBasis(Number(e.target.value))}
            >
              <option value="360">360 days</option>
              <option value="365">365 days</option>
            </select>
          </label>
        ) : ["compound", "fv"].includes(tool) ? (
          <label>
            Compounds per year
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            >
              {[1, 2, 4, 12, 365].map((f) => (
                <option key={f} value={f}>
                  {f === 1
                    ? "Annual"
                    : f === 2
                      ? "Semiannual"
                      : f === 4
                        ? "Quarterly"
                        : f === 12
                          ? "Monthly"
                          : "Daily (365)"}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Payment timing
            <select
              value={begin ? "begin" : "end"}
              onChange={(e) => setBegin(e.target.value === "begin")}
            >
              <option value="end">END · month end</option>
              <option value="begin">BEGIN · month start</option>
            </select>
          </label>
        )}
      </div>
      {tool === "investment" && (
        <label>
          Cash flows (today, period 1, period 2…)
          <input value={flows} onChange={(e) => setFlows(e.target.value)} />
        </label>
      )}
      <button className="primary-button full" onClick={calculate}>
        {my ? "တွက်ချက်မယ်" : "Calculate"}
        <ArrowRight size={17} />
      </button>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="tool-result">
          <span className="eyebrow">
            {result.title} · {currency}
          </span>
          <h2>{money(result.value)}</h2>
          {result.metrics.map((m) => (
            <div className="metric-line" key={m.label}>
              <span>{m.label}</span>
              <strong>{m.value}</strong>
            </div>
          ))}
          <p className="convention">
            <Info size={13} />
            {result.detail}
          </p>
          <button
            className="outline-button full"
            onClick={() => onKeys(result.keys)}
          >
            Show on the RPN calculator <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
