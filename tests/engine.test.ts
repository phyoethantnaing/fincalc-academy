import { describe, it, expect } from "vitest";
import { Calculator } from "../src/engine/rpn";
import {
  lessons,
  lessonKeys,
  practiceKeys,
  expectedPractice,
} from "../src/lessons/curriculum";
import {
  D,
  solve,
  residual,
  compound,
  simpleInterest,
  discount,
  npv,
  irr,
  amortization,
  ear,
  cagr,
  roi,
} from "../src/engine/finance";
const run = (keys: string[]) => {
  const c = new Calculator();
  keys.forEach((k) => c.press(k));
  return c;
};
const type = (s: string) => s.split("");
describe("four-level RPN", () => {
  it("adds by true stack operations", () =>
    expect(run(["2", "ENTER", "3", "+"]).x.toNumber()).toBe(5));
  it("ENTER lifts once, entry replaces X; drop repeats T", () => {
    const c = run(["1", "ENTER", "2", "ENTER", "3", "ENTER", "4"]);
    expect(c.stack.map((x) => x.toNumber())).toEqual([4, 3, 2, 1]);
    c.press("+");
    expect(c.stack.map((x) => x.toNumber())).toEqual([7, 2, 1, 1]);
  });
  it("repeated ENTER and roll", () => {
    const c = run(["2", "ENTER", "ENTER", "ENTER", "3", "×", "×"]);
    expect(c.x.toNumber()).toBe(12);
    const s = c.stack.map(String);
    for (let j = 0; j < 4; j++) c.press("R↓");
    expect(c.stack.map(String)).toEqual(s);
  });
  it("arithmetic, CHS and last X", () => {
    expect(run(["8", "ENTER", "2", "÷", "CHS"]).x.toNumber()).toBe(-4);
    expect(run(["2", "ENTER", "3", "yˣ", "g", "ENTER"]).x.toNumber()).toBe(3);
  });
  it("STO preserves entry for financial register; RCL lifts", () => {
    const c = run(["4", "2", "STO", "1", "8", "RCL", "1", "+"]);
    expect(c.x.toNumber()).toBe(50);
  });
  it("computed values store in financial keys unless a financial register was just stored", () => {
    const c = run(["2", "ENTER", "3", "+", "PV"]);
    expect(c.financial.PV.toNumber()).toBe(5);
    expect(c.error).toBe("");
  });
  it("official AMORT example: 50,000 at 13.25%, 573.35 payment, first year", () => {
    const c = run([
      "f",
      "x↔y",
      ...type("13.25"),
      "g",
      "i",
      ...type("50000"),
      "PV",
      ...type("573.35"),
      "CHS",
      "PMT",
      "g",
      "8",
      "1",
      "2",
      "f",
      "n",
    ]);
    expect(c.error).toBe("");
    expect(c.x.toNumber()).toBe(-6608.89);
    expect(c.stack[1].toNumber()).toBe(-271.31);
    expect(c.financial.PV.toNumber()).toBe(49728.69);
    expect(c.financial.n.toNumber()).toBe(12);
  });
  it("financial storage disables stack lift", () => {
    const c = run(["1", "2", "n", "6"]);
    expect(c.stack[1].toNumber()).toBe(0);
  });
  it("percent retains base", () => {
    const c = run(["2", "0", "0", "ENTER", "1", "0", "%", "+"]);
    expect(c.x.toNumber()).toBe(220);
  });
  it("prefix functions and clearing", () => {
    expect(run(["9", "g", "yˣ"]).x.toNumber()).toBe(3);
    const c = run(["2", "g", "n"]);
    expect(c.financial.n.toNumber()).toBe(24);
    c.press("f");
    c.press("x↔y");
    expect(c.financial.n.toNumber()).toBe(0);
  });
  it("EEX works with exponent signs", () =>
    expect(run(["2", "EEX", "CHS", "3", "ENTER"]).x.toNumber()).toBe(0.002));
  it("zero division gives a helpful error without invalid stack", () => {
    const c = run(["2", "ENTER", "0", "÷"]);
    expect(c.error).toBeTruthy();
    expect(c.x.isFinite()).toBe(true);
  });
  it("loan tutorial uses actual keys", () => {
    const c = run([
      "f",
      "x↔y",
      "g",
      "8",
      "1",
      "2",
      "n",
      "1",
      "2",
      "g",
      "i",
      ...type("100000"),
      "PV",
      "0",
      "FV",
      "PMT",
    ]);
    expect(c.error).toBe("");
    expect(c.x.toNumber()).toBeCloseTo(-8884.878868, 5);
  });
  it("cash-flow registers NPV and IRR", () => {
    const c = run([
      "1",
      "0",
      "0",
      "CHS",
      "g",
      "PV",
      "1",
      "1",
      "0",
      "g",
      "PMT",
      "f",
      "FV",
    ]);
    expect(c.x.toNumber()).toBeCloseTo(10, 8);
  });
});
describe("independent finance references", () => {
  const t = { n: 12, i: 1, PV: 100000, PMT: 0, FV: 0, begin: false };
  it("PMT ordinary and due", () => {
    expect(solve(t, "PMT").toNumber()).toBeCloseTo(-8884.878867834, 8);
    expect(solve({ ...t, begin: true }, "PMT").toNumber()).toBeCloseTo(
      -8796.909770133,
      8,
    );
  });
  it("FV and PV independent lump sums", () => {
    expect(solve({ ...t, n: 2, i: 10, PV: -100 }, "FV").toNumber()).toBeCloseTo(
      121,
    );
    expect(
      solve({ ...t, n: 2, i: 10, FV: 121, PV: 0 }, "PV").toNumber(),
    ).toBeCloseTo(-100);
  });
  it("n and i inversion", () => {
    expect(
      solve({ ...t, n: 0, i: 10, PV: -100, FV: 121 }, "n").toNumber(),
    ).toBeCloseTo(2);
    expect(
      solve({ ...t, n: 2, i: 0, PV: -100, FV: 121 }, "i").toNumber(),
    ).toBeCloseTo(10, 8);
  });
  it("zero and near-zero", () => {
    expect(solve({ ...t, i: 0 }, "PMT").toNumber()).toBeCloseTo(-100000 / 12);
    expect(solve({ ...t, i: "1e-20" }, "PMT").toNumber()).toBeCloseTo(
      -100000 / 12,
    );
  });
  it("high rates satisfy the equation", () => {
    const v = { ...t, i: 80 };
    const p = solve(v, "PMT");
    expect(
      residual({ ...v, PMT: p })
        .abs()
        .lt("1e-20"),
    ).toBe(true);
  });
  it("invalid rates and signs rejected", () => {
    expect(() => solve({ ...t, i: -100 }, "PMT")).toThrow();
    expect(() => solve({ ...t, PV: 100, FV: 100 }, "i")).toThrow();
  });
  it("compound and simple", () => {
    expect(compound(100, 10, 2, 1).toNumber()).toBe(121);
    expect(simpleInterest(1000, 12, 180, 360).toNumber()).toBe(60);
    expect(simpleInterest(1000, 12, 365, 365).toNumber()).toBe(120);
  });
  it("discount proceeds and cost", () => {
    const d = discount(1000, 10, 365);
    expect(d.proceeds.toNumber()).toBe(900);
    expect(d.effective.toNumber()).toBeCloseTo(11.111111);
  });
  it("NPV and conventional IRR", () => {
    expect(npv([-100, 60, 60], 10).toNumber()).toBeCloseTo(4.13223140496);
    expect(irr([-100, 110]).toNumber()).toBeCloseTo(10);
    expect(() => irr([-100, 230, -132])).toThrow(/multiple/i);
  });
  it("EAR CAGR and ROI", () => {
    expect(ear(12, 12).toNumber()).toBeCloseTo(12.6825030132);
    expect(cagr(100, 121, 2).toNumber()).toBe(10);
    expect(roi(120, 100).toNumber()).toBe(20);
  });
  it.each([false, true])(
    "rounded amortization reconciles in each payment, BEGIN=%s",
    (begin) => {
      const a = amortization(100000, 12, 12, begin);
      let bal = D(100000);
      let sum = D(0);
      for (const row of a.rows) {
        expect(D(row.payment).minus(row.interest).toNumber()).toBe(
          row.principal,
        );
        bal = bal.minus(row.principal);
        expect(bal.toNumber()).toBe(row.balance);
        sum = sum.plus(row.principal);
      }
      expect(bal.toNumber()).toBe(0);
      expect(sum.toNumber()).toBe(100000);
      expect(D(a.total).minus(100000).toNumber()).toBe(a.interest);
    },
  );
  it("official guide simple interest example $450 at 7% for 60 days, 360 basis", () =>
    expect(simpleInterest(450, 7, 60, 360).toNumber()).toBe(5.25));
});

describe("all seven lessons execute their real engine sequences", () => {
  it.each(lessons.map((l) => [l.id, l]))("lesson %s", (id, l) => {
    const c = run(lessonKeys(l as (typeof lessons)[number]));
    expect(c.error).toBe("");
    const expected = [
      23000, -8884.878867834, 254319.55241067, -100000, 146932.80768, 103000,
      97000,
    ];
    expect(c.x.toNumber()).toBeCloseTo(expected[Number(id) - 1], 2);
  });
});

describe("every practice answer is reproduced by its displayed steps", () => {
  for (const lesson of lessons)
    for (let level = 0; level < 3; level++)
      it(`lesson ${lesson.id}, difficulty ${level}`, () => {
        const c = run(practiceKeys(lesson, level));
        expect(c.error).toBe("");
        expect(c.x.toNumber()).toBeCloseTo(expectedPractice(lesson, level), 6);
      });
});
