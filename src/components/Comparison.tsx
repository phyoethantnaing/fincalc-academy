import { useMemo, useState } from "react";
import { Scale, Info } from "lucide-react";
import { D, amortization, irr } from "../engine/finance";
import { money } from "../utils";
export function Comparison({
  my,
  currency,
}: {
  my: boolean;
  currency: string;
}) {
  const [amount, setAmount] = useState("100000"),
    [months, setMonths] = useState("12"),
    [offers, setOffers] = useState([
      {
        name: "Offer A",
        rate: "12",
        method: "reducing",
        fees: "0",
        begin: false,
      },
      {
        name: "Offer B",
        rate: "12",
        method: "flat",
        fees: "1000",
        begin: false,
      },
      {
        name: "Offer C",
        rate: "14",
        method: "reducing",
        fees: "0",
        begin: false,
      },
    ]);
  const calculated = useMemo(
    () =>
      offers.map((o) => {
        try {
          const a = D(amount),
            m = Number(months),
            r = D(o.rate),
            fees = D(o.fees);
          if (
            !a.isPositive() ||
            !Number.isInteger(m) ||
            m < 1 ||
            m > 1200 ||
            r.lt(0) ||
            fees.lt(0) ||
            fees.gte(a)
          )
            throw Error(
              "Enter valid positive loan values; fees must be less than the loan.",
            );
          let payments: number[], interest: number;
          if (o.method === "reducing") {
            const loan = amortization(a, r, m, o.begin);
            payments = loan.rows.map((x) => x.payment);
            interest = loan.interest;
          } else {
            const total = a.mul(r).mul(m).div(1200).plus(a);
            const p = total.div(m).toDecimalPlaces(2);
            payments = Array.from({ length: m }, (_, i) =>
              i === m - 1 ? total.minus(p.mul(m - 1)).toNumber() : p.toNumber(),
            );
            interest = total.minus(a).toNumber();
          }
          const received = a.minus(fees);
          const flows = o.begin
            ? [
                received.minus(payments[0]),
                ...payments.slice(1).map((p) => D(p).neg()),
              ]
            : [received, ...payments.map((p) => D(p).neg())];
          let annual = "Unavailable";
          try {
            annual =
              money(
                D(1)
                  .plus(irr(flows).div(100))
                  .pow(12)
                  .minus(1)
                  .mul(100)
                  .toString(),
                2,
              ) + "%";
          } catch {
            /* disclose unavailable */
          }
          const total = payments.reduce((s, p) => s.plus(p), D(0)).plus(fees);
          return {
            payment: payments[0],
            interest,
            total: total.toNumber(),
            received: received.toNumber(),
            annual,
            error: "",
          };
        } catch (e) {
          return {
            payment: 0,
            interest: 0,
            total: 0,
            received: 0,
            annual: "—",
            error: (e as Error).message,
          };
        }
      }),
    [offers, amount, months],
  );
  const maxTotal = Math.max(1, ...calculated.map((x) => x.total));
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">LOOK BEYOND THE ADVERTISED RATE</span>
        <h1>
          {my
            ? "ချေးငွေအစီအစဉ်များ နှိုင်းယှဉ်မယ်"
            : "The same rate. A different real cost."}
        </h1>
        <p>
          {my
            ? "Flat rate၊ လက်ကျန်ငွေအပေါ် အတိုးနှင့် ကြိုတင်ကုန်ကျစရိတ်တို့ကို ထည့်တွက်ပြီး နှိုင်းယှဉ်ပါ။"
            : "Compare reducing-balance and flat-rate loans, including upfront fees and payment timing."}
        </p>
      </div>
      <section className="panel compare-inputs">
        <Scale size={24} />
        <label>
          Principal · {currency}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label>
          Term · months
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </label>
        <span className="muted">Same principal and term for every offer</span>
      </section>
      <div className="comparison-cards">
        {offers.map((o, i) => (
          <section key={i} className="panel offer-card">
            <span className="offer-letter">{String.fromCharCode(65 + i)}</span>
            <h2>{o.name}</h2>
            {[
              ["rate", "Annual advertised rate (%)"],
              ["fees", `Upfront fees (${currency})`],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  value={o[key as "rate" | "fees"]}
                  onChange={(e) =>
                    setOffers(
                      offers.map((x, j) =>
                        j === i ? { ...x, [key]: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
            ))}
            <label>
              Interest method
              <select
                value={o.method}
                onChange={(e) =>
                  setOffers(
                    offers.map((x, j) =>
                      j === i ? { ...x, method: e.target.value } : x,
                    ),
                  )
                }
              >
                <option value="reducing">Reducing balance</option>
                <option value="flat">Flat rate on original principal</option>
              </select>
            </label>
            <label>
              Timing
              <select
                value={o.begin ? "begin" : "end"}
                onChange={(e) =>
                  setOffers(
                    offers.map((x, j) =>
                      j === i ? { ...x, begin: e.target.value === "begin" } : x,
                    ),
                  )
                }
              >
                <option value="end">END · month end</option>
                <option value="begin">BEGIN · month start</option>
              </select>
            </label>
            {calculated[i].error ? (
              <div role="alert" className="error-banner">
                {calculated[i].error}
              </div>
            ) : (
              <div className="offer-payment">
                <span>Regular monthly payment</span>
                <strong>{money(calculated[i].payment)}</strong>
                <small>{currency} / month</small>
              </div>
            )}
          </section>
        ))}
      </div>
      <section className="panel comparison-results">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">COMPARE ON YOUR OWN TERMS</span>
            <h3>{my ? "တကယ်ကုန်ကျမည့် ငွေ" : "What you actually pay"}</h3>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Comparison criteria</th>
                {offers.map((o) => (
                  <th key={o.name}>{o.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Actual cash received", "received"],
                ["Total interest", "interest"],
                ["Repayment + upfront fees", "total"],
                ["Effective annual borrowing rate", "annual"],
              ].map(([title, key]) => (
                <tr key={key}>
                  <td>{title}</td>
                  {calculated.map((c, i) => (
                    <td key={i}>
                      {c.error
                        ? "—"
                        : key === "annual"
                          ? c.annual
                          : money(c[key as "received" | "interest" | "total"])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="comparison-bars">
          {calculated.map((c, i) => (
            <div key={i}>
              <span>{offers[i].name}</span>
              <div>
                <i style={{ width: `${(c.total / maxTotal) * 100}%` }} />
              </div>
              <strong>
                {money(c.total)} <small>{currency}</small>
              </strong>
            </div>
          ))}
        </div>
        <p className="convention">
          <Info size={15} />
          Fees paid upfront reduce the cash you receive. Effective annual cost
          is (1 + monthly cash-flow IRR)¹² − 1. Flat interest = original
          principal × annual rate × months / 12. Compare total cost, cash
          received, and timing; no offer is automatically recommended.
        </p>
      </section>
    </>
  );
}
