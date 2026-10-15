import Decimal from "decimal.js";
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export const D = (v: Decimal.Value) => new Decimal(v);
export type TVM = {
  n: Decimal.Value;
  i: Decimal.Value;
  PV: Decimal.Value;
  PMT: Decimal.Value;
  FV: Decimal.Value;
  begin: boolean;
};
export type Variable = "n" | "i" | "PV" | "PMT" | "FV";
function valid(t: TVM) {
  if (D(t.i).lte(-100))
    throw Error("Periodic rate must be greater than −100%.");
  if (D(t.n).lt(0)) throw Error("Periods cannot be negative.");
}
export function factors(n: Decimal.Value, rate: Decimal.Value, begin = false) {
  const r = D(rate).div(100),
    growth = r.plus(1).pow(n);
  const annuity = r.isZero()
    ? D(n)
    : r.abs().lt("1e-18")
      ? D(n)
          .plus(D(n).mul(D(n).minus(1)).mul(r).div(2))
          .plus(D(n).mul(D(n).minus(1)).mul(D(n).minus(2)).mul(r.pow(2)).div(6))
      : growth.minus(1).div(r);
  return { growth, annuity: annuity.mul(begin ? r.plus(1) : 1) };
}
export function residual(t: TVM) {
  valid(t);
  const { growth, annuity } = factors(t.n, t.i, t.begin);
  return D(t.PV).mul(growth).plus(D(t.PMT).mul(annuity)).plus(t.FV);
}
export function bisect(fn: (x: Decimal) => Decimal, lo: Decimal, hi: Decimal) {
  let fl = fn(lo);
  for (let k = 0; k < 160; k++) {
    const mid = lo.plus(hi).div(2),
      fm = fn(mid);
    if (fm.isZero() || hi.minus(lo).abs().lt("1e-24")) return mid;
    if (fl.isNegative() !== fm.isNegative()) hi = mid;
    else {
      lo = mid;
      fl = fm;
    }
  }
  return lo.plus(hi).div(2);
}
export function solve(t: TVM, v: Variable): Decimal {
  valid({ ...t, [v]: v === "i" ? 0 : t[v] });
  const { growth, annuity } = factors(t.n, t.i, t.begin);
  let answer: Decimal;
  if (v === "PV") answer = D(t.PMT).mul(annuity).plus(t.FV).neg().div(growth);
  else if (v === "FV")
    answer = D(t.PV).mul(growth).plus(D(t.PMT).mul(annuity)).neg();
  else if (v === "PMT") {
    if (annuity.isZero()) throw Error("Enter a positive number of periods.");
    answer = D(t.PV).mul(growth).plus(t.FV).neg().div(annuity);
  } else if (v === "n") {
    const r = D(t.i).div(100),
      p = D(t.PMT).mul(t.begin ? r.plus(1) : 1);
    if (r.isZero()) {
      if (p.isZero()) throw Error("No unique number of periods.");
      answer = D(t.PV).plus(t.FV).neg().div(p);
    } else {
      const a = p.div(r);
      const ratio = a.minus(t.FV).div(D(t.PV).plus(a));
      if (ratio.lte(0)) throw Error("No solution with these cash-flow signs.");
      answer = ratio.ln().div(r.plus(1).ln());
    }
    if (answer.lt(0)) throw Error("No non-negative period solution.");
  } else {
    const cash = [D(t.PV), D(t.PMT), D(t.FV)].filter((x) => !x.isZero());
    if (!cash.some((x) => x.gt(0)) || !cash.some((x) => x.lt(0)))
      throw Error("Use opposite signs for money received and paid.");
    const roots: Decimal[] = [];
    let prev = D("-99.9999"),
      fp = residual({ ...t, i: prev });
    for (let j = 1; j <= 180; j++) {
      const x = D(Math.exp(-13.815510557964274 + (j * 20.72326583694641) / 180))
        .minus(1)
        .mul(100);
      const fx = residual({ ...t, i: x });
      if (fx.isZero()) roots.push(x);
      else if (fp.isNegative() !== fx.isNegative())
        roots.push(bisect((i) => residual({ ...t, i }), prev, x));
      prev = x;
      fp = fx;
    }
    if (roots.length !== 1)
      throw Error(
        roots.length
          ? "Multiple rate solutions; inspect cash flows."
          : "No rate solution found in the supported range.",
      );
    answer = roots[0];
  }
  if (!answer.isFinite()) throw Error("Undefined financial result.");
  return answer;
}
export function compound(
  principal: Decimal.Value,
  annual: Decimal.Value,
  years: Decimal.Value,
  frequency = 12,
) {
  if (
    ![1, 2, 4, 12, 365].includes(frequency) ||
    D(years).lt(0) ||
    D(annual).div(frequency).lte(-100)
  )
    throw Error("Invalid compounding inputs.");
  return D(principal).mul(
    D(annual).div(100).div(frequency).plus(1).pow(D(years).mul(frequency)),
  );
}
export const simpleInterest = (
  p: Decimal.Value,
  rate: Decimal.Value,
  days: Decimal.Value,
  basis = 365,
) => {
  if (![360, 365].includes(basis) || D(days).lt(0))
    throw Error("Use non-negative days and a 360 or 365 basis.");
  return D(p).mul(rate).div(100).mul(days).div(basis);
};
export function discount(
  face: Decimal.Value,
  rate: Decimal.Value,
  days: Decimal.Value,
  basis = 365,
) {
  const amount = simpleInterest(face, rate, days, basis),
    proceeds = D(face).minus(amount);
  if (proceeds.lte(0)) throw Error("Discount must be smaller than face value.");
  return {
    amount,
    proceeds,
    effective: D(days).isZero()
      ? D(0)
      : amount.div(proceeds).mul(basis).div(days).mul(100),
  };
}
export function npv(flows: Decimal.Value[], rate: Decimal.Value) {
  if (D(rate).lte(-100)) throw Error("Discount rate must exceed −100%.");
  return flows.reduce<Decimal>(
    (s, c, j) => s.plus(D(c).div(D(rate).div(100).plus(1).pow(j))),
    D(0),
  );
}
export function irr(flows: Decimal.Value[]) {
  const signs = flows
    .map(D)
    .filter((x) => !x.isZero())
    .map((x) => x.isPositive());
  let changes = 0;
  for (let j = 1; j < signs.length; j++)
    if (signs[j] !== signs[j - 1]) changes++;
  if (changes === 0)
    throw Error("IRR requires positive and negative cash flows.");
  if (changes > 1)
    throw Error(
      "Non-conventional cash flows: multiple or no IRRs may exist. A unique IRR is not reported.",
    );
  let lo = D("-99.9999"),
    hi = D(100);
  while (
    npv(flows, lo).isNegative() === npv(flows, hi).isNegative() &&
    hi.lt("1e8")
  )
    hi = hi.mul(2);
  if (npv(flows, lo).isNegative() === npv(flows, hi).isNegative())
    throw Error("No IRR found in the supported range.");
  return bisect((r) => npv(flows, r), lo, hi);
}
export const ear = (nominal: Decimal.Value, frequency: number) =>
  D(nominal).div(100).div(frequency).plus(1).pow(frequency).minus(1).mul(100);
export const roi = (gain: Decimal.Value, cost: Decimal.Value) => {
  if (D(cost).lte(0)) throw Error("Cost must be positive.");
  return D(gain).minus(cost).div(cost).mul(100);
};
export const cagr = (
  start: Decimal.Value,
  end: Decimal.Value,
  years: Decimal.Value,
) => {
  if (D(start).lte(0) || D(end).lte(0) || D(years).lte(0))
    throw Error("CAGR requires positive values and years.");
  return D(end).div(start).pow(D(1).div(years)).minus(1).mul(100);
};
export type LoanRow = {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};
export function amortization(
  principal: Decimal.Value,
  annual: Decimal.Value,
  months: number,
  begin = false,
  places = 2,
) {
  if (
    !Number.isInteger(months) ||
    months < 1 ||
    months > 1200 ||
    D(principal).lte(0) ||
    D(annual).lt(0) ||
    D(annual).gt(1000)
  )
    throw Error(
      "Enter a positive loan, 1–1200 months, and annual rate 0–1000%.",
    );
  const payment = solve(
    { n: months, i: D(annual).div(12), PV: principal, PMT: 0, FV: 0, begin },
    "PMT",
  )
    .neg()
    .toDecimalPlaces(places);
  let balance = D(principal).toDecimalPlaces(places),
    interestTotal = D(0),
    total = D(0);
  const rows: LoanRow[] = [];
  for (let k = 1; k <= months; k++) {
    const interest =
      begin && k === 1
        ? D(0)
        : balance.mul(annual).div(1200).toDecimalPlaces(places);
    const due = balance.plus(interest);
    const paid = k === months ? due : Decimal.min(payment, due);
    const capital = paid.minus(interest);
    balance = balance.minus(capital);
    interestTotal = interestTotal.plus(interest);
    total = total.plus(paid);
    rows.push({
      period: k,
      payment: paid.toNumber(),
      interest: interest.toNumber(),
      principal: capital.toNumber(),
      balance: balance.toNumber(),
    });
  }
  return {
    payment: payment.toNumber(),
    interest: interestTotal.toNumber(),
    total: total.toNumber(),
    rows,
  };
}
