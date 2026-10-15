import { D, solve, npv, irr, type Variable } from "./finance";
import type Decimal from "decimal.js";
export type KeySpec = { id: string; f?: string; g?: string };
export const KEYS: KeySpec[] = [
  { id: "n", f: "AMORT", g: "12×" },
  { id: "i", f: "INT", g: "12÷" },
  { id: "PV", f: "NPV", g: "CF₀" },
  { id: "PMT", f: "RND", g: "CFⱼ" },
  { id: "FV", f: "IRR", g: "Nⱼ" },
  { id: "CHS", g: "DATE" },
  { id: "7", g: "BEG" },
  { id: "8", g: "END" },
  { id: "9", g: "MEM" },
  { id: "÷" },
  { id: "yˣ", f: "PRICE", g: "√x" },
  { id: "1/x", f: "YTM", g: "eˣ" },
  { id: "%T", f: "SL", g: "LN" },
  { id: "Δ%", f: "SOYD", g: "FRAC" },
  { id: "%", f: "DB", g: "INTG" },
  { id: "EEX", g: "ΔDYS" },
  { id: "4", g: "D.MY" },
  { id: "5", g: "M.DY" },
  { id: "6", g: "x̄w" },
  { id: "×" },
  { id: "R/S", f: "P/R", g: "PSE" },
  { id: "SST", f: "Σ CLEAR", g: "BST" },
  { id: "R↓", f: "PRGM CLEAR", g: "GTO" },
  { id: "x↔y", f: "FIN CLEAR", g: "x≤y" },
  { id: "CLx", f: "REG CLEAR", g: "x=0" },
  { id: "ENTER", f: "PREFIX", g: "LSTx" },
  { id: "1", g: "x̂,r" },
  { id: "2", g: "ŷ,r" },
  { id: "3", g: "n!" },
  { id: "−" },
  { id: "ON" },
  { id: "f" },
  { id: "g" },
  { id: "STO" },
  { id: "RCL" },
  { id: "0", g: "x̄" },
  { id: ".", g: "s" },
  { id: "Σ+", g: "Σ−" },
  { id: "+" },
];
export class Calculator {
  stack: Decimal[] = [D(0), D(0), D(0), D(0)];
  lastX = D(0);
  entry = "";
  entering = false;
  lift = true;
  prefix = "";
  financial: Record<Variable, Decimal> = {
    n: D(0),
    i: D(0),
    PV: D(0),
    PMT: D(0),
    FV: D(0),
  };
  begin = false;
  financialReady = false;
  registers: Record<string, Decimal> = {};
  flows: Decimal[] = [];
  repeats: number[] = [];
  error = "";
  on = true;
  decimals = 2;
  dateMode = "MDY";
  dateDisplay = "";
  history: { key: string; value: string }[] = [];
  get x() {
    return this.stack[0];
  }
  set x(v: Decimal) {
    if (!v.isFinite()) throw Error("Undefined result. Check the input values.");
    this.stack[0] = v;
  }
  push() {
    this.stack = [this.x, this.x, this.stack[1], this.stack[2]];
  }
  put(v: Decimal) {
    if (this.lift) this.push();
    this.x = v;
    this.entering = false;
    this.lift = true;
  }
  unary(fn: (x: Decimal) => Decimal) {
    this.lastX = this.x;
    this.x = fn(this.x);
    this.entering = false;
    this.lift = true;
  }
  binary(fn: (y: Decimal, x: Decimal) => Decimal, drop = true) {
    const x = this.x,
      y = this.stack[1],
      v = fn(y, x);
    if (!v.isFinite()) throw Error("Undefined result.");
    this.lastX = x;
    if (drop) this.stack = [v, this.stack[2], this.stack[3], this.stack[3]];
    else this.x = v;
    this.entering = false;
    this.lift = true;
  }
  reset() {
    Object.assign(this, new Calculator());
  }
  press(k: string) {
    this.error = "";
    try {
      this.execute(k);
      this.history = [
        ...this.history,
        { key: k, value: this.x.toString() },
      ].slice(-100);
    } catch (e) {
      this.error = e instanceof Error ? e.message : "Invalid calculation.";
      this.prefix = "";
      this.entering = false;
    }
  }
  execute(k: string) {
    if (k === "ON") {
      this.on = !this.on;
      return;
    }
    if (!this.on) return;
    if (["f", "g", "STO", "RCL"].includes(k)) {
      this.prefix = k;
      return;
    }
    this.dateDisplay = "";
    const financialReady = this.financialReady;
    this.financialReady = false;
    if (this.prefix === "STO" || this.prefix === "RCL") {
      const p = this.prefix;
      this.prefix = "";
      if (!/^\d$/.test(k) && !["n", "i", "PV", "PMT", "FV"].includes(k))
        throw Error("Select storage register 0–9 or a financial register.");
      if (p === "STO") {
        if (k in this.financial) this.financial[k as Variable] = this.x;
        else this.registers[k] = this.x;
        this.entering = false;
      } else
        this.put(
          k in this.financial
            ? this.financial[k as Variable]
            : (this.registers[k] ?? D(0)),
        );
      return;
    }
    if (this.prefix) {
      const p = this.prefix;
      this.prefix = "";
      if (p === "f" && /^\d$/.test(k)) {
        this.decimals = Number(k);
        return;
      }
      const action = KEYS.find((x) => x.id === k)?.[p as "f" | "g"];
      if (!action) throw Error("This shifted function is not supported.");
      if (action === "PREFIX") return;
      if (action === "FIN CLEAR") {
        for (const v of Object.keys(this.financial) as Variable[])
          this.financial[v] = D(0);
        this.flows = [];
        this.repeats = [];
        this.entering = false;
        return;
      }
      if (action === "REG CLEAR") {
        const keep = {
          begin: this.begin,
          decimals: this.decimals,
          dateMode: this.dateMode,
          on: this.on,
        };
        this.reset();
        Object.assign(this, keep);
        return;
      }
      if (action === "BEG" || action === "END") {
        this.begin = action === "BEG";
        this.entering = false;
        return;
      }
      if (action === "12×" || action === "12÷") {
        this.unary((x) => (action === "12×" ? x.mul(12) : x.div(12)));
        this.financial[action === "12×" ? "n" : "i"] = this.x;
        this.lift = false;
        this.financialReady = true;
        return;
      }
      if (action === "CF₀") {
        this.flows = [this.x];
        this.repeats = [1];
        this.financial.n = D(0);
        this.entering = false;
        this.lift = false;
        return;
      }
      if (action === "CFⱼ") {
        if (!this.flows.length) this.flows = [D(0)];
        if (this.flows.length >= 21)
          throw Error("Maximum 20 cash-flow groups.");
        this.flows.push(this.x);
        this.repeats.push(1);
        this.financial.n = D(this.flows.length - 1);
        this.entering = false;
        this.lift = false;
        return;
      }
      if (action === "Nⱼ") {
        if (
          !this.x.isInteger() ||
          this.x.lt(1) ||
          this.x.gt(99) ||
          this.flows.length < 2
        )
          throw Error("Store CFj first; repetitions must be 1–99.");
        this.repeats[this.flows.length - 1] = this.x.toNumber();
        this.entering = false;
        return;
      }
      if (action === "NPV" || action === "IRR") {
        const flows = this.flows.flatMap(
          (v, j) =>
            Array(j === 0 ? 1 : (this.repeats[j] ?? 1)).fill(v) as Decimal[],
        );
        if (!flows.length) throw Error("Enter CF0 and CFj first.");
        const answer =
          action === "NPV" ? npv(flows, this.financial.i) : irr(flows);
        if (action === "IRR") this.financial.i = answer;
        this.put(answer);
        return;
      }
      if (action === "INT") {
        const { n, i, PV } = this.financial;
        this.lastX = this.x;
        this.stack = [
          PV.neg().mul(i).div(100).mul(n).div(360),
          PV.neg(),
          PV.neg().mul(i).div(100).mul(n).div(365),
          this.stack[3],
        ];
        this.entering = false;
        this.lift = true;
        return;
      }
      if (action === "AMORT") {
        const count = this.x.toNumber();
        if (!Number.isInteger(count) || count < 1 || count > 1200)
          throw Error(
            "AMORT requires 1–1200 payments. Reset n to 0 to start a new schedule.",
          );
        let pv = this.financial.PV.toDecimalPlaces(this.decimals),
          interest = D(0),
          capital = D(0);
        const pmt = this.financial.PMT.toDecimalPlaces(this.decimals),
          r = this.financial.i.div(100);
        for (let j = 0; j < count; j++) {
          const part =
            this.begin && this.financial.n.isZero() && j === 0
              ? D(0)
              : pv.mul(r).neg().toDecimalPlaces(this.decimals);
          const principal = pmt.minus(part);
          interest = interest.plus(part);
          capital = capital.plus(principal);
          pv = pv.plus(principal);
        }
        this.financial.PV = pv;
        this.financial.n = this.financial.n.plus(count);
        this.lastX = this.x;
        this.stack = [interest, capital, D(count), this.stack[3]];
        this.entering = false;
        this.lift = true;
        return;
      }
      if (action === "RND") {
        this.unary((x) => x.toDecimalPlaces(this.decimals));
        return;
      }
      if (action === "LSTx") {
        this.put(this.lastX);
        return;
      }
      if (action === "√x") {
        this.unary((x) => x.sqrt());
        return;
      }
      if (action === "eˣ") {
        this.unary((x) => x.exp());
        return;
      }
      if (action === "LN") {
        this.unary((x) => x.ln());
        return;
      }
      if (action === "FRAC") {
        this.unary((x) => x.minus(x.trunc()));
        return;
      }
      if (action === "INTG") {
        this.unary((x) => x.trunc());
        return;
      }
      if (action === "n!") {
        this.unary((x) => {
          if (!x.isInteger() || x.lt(0) || x.gt(170))
            throw Error("Factorial input must be an integer 0–170.");
          let v = D(1);
          for (let j = 2; j <= x.toNumber(); j++) v = v.mul(j);
          return v;
        });
        return;
      }
      if (action === "D.MY" || action === "M.DY") {
        this.dateMode = action === "D.MY" ? "DMY" : "MDY";
        return;
      }
      if (action === "DATE" || action === "ΔDYS") {
        const parse = (v: Decimal) => {
          const s = v.abs().toFixed(6).split("."),
            a = Number(s[0]),
            b = Number(s[1].slice(0, 2)),
            year = Number(s[1].slice(2)),
            month = this.dateMode === "MDY" ? a : b,
            day = this.dateMode === "MDY" ? b : a;
          const date = new Date(Date.UTC(year, month - 1, day));
          if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
          )
            throw Error("Use a valid MM.DDYYYY or DD.MMYYYY date.");
          return date;
        };
        const start = parse(this.stack[1]);
        if (action === "DATE") {
          if (!this.x.isInteger()) throw Error("Days must be an integer.");
          start.setUTCDate(start.getUTCDate() + this.x.toNumber());
          const a =
              this.dateMode === "MDY"
                ? start.getUTCMonth() + 1
                : start.getUTCDate(),
            b =
              this.dateMode === "MDY"
                ? start.getUTCDate()
                : start.getUTCMonth() + 1;
          this.binary(() =>
            D(`${a}.${String(b).padStart(2, "0")}${start.getUTCFullYear()}`),
          );
          this.dateDisplay = `${a}.${String(b).padStart(2, "0")}.${start.getUTCFullYear()}`;
        } else {
          const end = parse(this.x);
          this.binary(() => D((end.getTime() - start.getTime()) / 86400000));
        }
        return;
      }
      throw Error(
        `${action} is not implemented in this educational edition. See compatibility notes.`,
      );
    }
    if (/^\d$/.test(k) || k === ".") {
      if (!this.entering) {
        if (this.lift) this.push();
        this.entry = "";
        this.entering = true;
      }
      if (k === "." && this.entry.includes(".")) return;
      if (this.entry.includes("e") && k === ".") return;
      this.entry += k === "." ? (this.entry ? "" : "0") + "." : k;
      this.x = D(this.entry.endsWith("e") ? this.entry + "0" : this.entry);
      this.lift = true;
      return;
    }
    if (k === "CHS") {
      if (this.entering) {
        if (this.entry.includes("e")) {
          const [m, e] = this.entry.split("e");
          this.entry = m + "e" + (e.startsWith("-") ? e.slice(1) : "-" + e);
        } else
          this.entry = this.entry.startsWith("-")
            ? this.entry.slice(1)
            : "-" + this.entry;
        this.x = D(this.entry.endsWith("-") ? this.entry + "0" : this.entry);
      } else this.x = this.x.neg();
      return;
    }
    if (k === "EEX") {
      if (!this.entering) {
        if (this.lift) this.push();
        this.entry = "1";
        this.entering = true;
      }
      if (!this.entry.includes("e")) this.entry += "e";
      return;
    }
    if (k === "ENTER") {
      this.push();
      this.entering = false;
      this.lift = false;
      return;
    }
    if (k === "CLx") {
      this.x = D(0);
      this.entering = false;
      this.lift = false;
      return;
    }
    if (k === "R↓") {
      this.stack = [this.stack[1], this.stack[2], this.stack[3], this.x];
      this.entering = false;
      this.lift = true;
      return;
    }
    if (k === "x↔y") {
      [this.stack[0], this.stack[1]] = [this.stack[1], this.stack[0]];
      this.entering = false;
      this.lift = true;
      return;
    }
    if (["n", "i", "PV", "PMT", "FV"].includes(k)) {
      const v = k as Variable;
      if (!financialReady) {
        this.financial[v] = this.x;
        this.entering = false;
        this.lift = false;
        this.financialReady = true;
      } else {
        this.x = solve({ ...this.financial, begin: this.begin }, v);
        this.financial[v] = this.x;
        this.lift = true;
      }
      return;
    }
    const operations: Record<string, (y: Decimal, x: Decimal) => Decimal> = {
      "+": (y, x) => y.plus(x),
      "−": (y, x) => y.minus(x),
      "×": (y, x) => y.mul(x),
      "÷": (y, x) => y.div(x),
      yˣ: (y, x) => y.pow(x),
      "%": (y, x) => y.mul(x).div(100),
      "Δ%": (y, x) => x.minus(y).div(y).mul(100),
      "%T": (y, x) => x.div(y).mul(100),
    };
    if (operations[k]) {
      this.binary(operations[k], !["%", "Δ%", "%T"].includes(k));
      return;
    }
    if (k === "1/x") {
      this.unary((x) => D(1).div(x));
      return;
    }
    throw Error(`${k} is not implemented in this educational edition.`);
  }
}
