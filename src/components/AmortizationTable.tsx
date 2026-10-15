import { useState } from "react";
import {
  Download,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { D, type LoanRow } from "../engine/finance";
import { download, money } from "../utils";
export function AmortizationTable({
  rows,
  currency,
  my,
}: {
  rows: LoanRow[];
  currency: string;
  my: boolean;
}) {
  const [page, setPage] = useState(0),
    [annual, setAnnual] = useState(false),
    [filter, setFilter] = useState("");
  const data = annual
    ? Object.values(
        rows.reduce<Record<number, LoanRow>>((a, r) => {
          const y = Math.ceil(r.period / 12);
          const prev = a[y] ?? {
            period: y,
            payment: 0,
            principal: 0,
            interest: 0,
            balance: 0,
          };
          a[y] = {
            period: y,
            payment: D(prev.payment).plus(r.payment).toNumber(),
            principal: D(prev.principal).plus(r.principal).toNumber(),
            interest: D(prev.interest).plus(r.interest).toNumber(),
            balance: r.balance,
          };
          return a;
        }, {}),
      )
    : rows;
  const filtered = data.filter((r) => !filter || String(r.period) === filter);
  const maxPage = Math.max(0, Math.ceil(filtered.length / 12) - 1),
    safePage = Math.min(page, maxPage);
  const headers = [
    annual ? "Year" : "Month",
    `Payment (${currency})`,
    "Principal",
    "Interest",
    "Balance",
  ];
  const exportCSV = () =>
    download(
      "fincalc-amortization.csv",
      "\ufeff" +
        [
          headers.join(","),
          ...data.map((r) => Object.values(r).join(",")),
        ].join("\r\n"),
      "text/csv;charset=utf-8",
    );
  const exportExcel = () => {
    const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Repayments"><Table><Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>${data
      .map(
        (r) =>
          `<Row>${Object.values(r)
            .map((v) => `<Cell><Data ss:Type="Number">${v}</Data></Cell>`)
            .join("")}</Row>`,
      )
      .join("")}</Table></Worksheet></Workbook>`;
    download("fincalc-amortization.xml", xml, "application/vnd.ms-excel");
  };
  return (
    <section className="schedule panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">EVERY PAYMENT, EXPLAINED</span>
          <h3>{my ? "ငွေပြန်ဆပ်မည့် အစီအစဉ်" : "Repayment schedule"}</h3>
        </div>
        <div className="export-actions">
          <button title="Export CSV" onClick={exportCSV}>
            <Download size={15} />
            CSV
          </button>
          <button title="Export Excel" onClick={exportExcel}>
            <FileSpreadsheet size={15} />
            Excel
          </button>
          <button title="Print report" onClick={() => window.print()}>
            <Printer size={15} />
          </button>
        </div>
      </div>
      <div className="table-filters">
        <div className="segmented small">
          <button
            className={!annual ? "active" : ""}
            onClick={() => {
              setAnnual(false);
              setPage(0);
            }}
          >
            Monthly
          </button>
          <button
            className={annual ? "active" : ""}
            onClick={() => {
              setAnnual(true);
              setPage(0);
            }}
          >
            Yearly
          </button>
        </div>
        <input
          aria-label="Filter payment"
          type="number"
          min="1"
          placeholder="Find payment…"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
        />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(safePage * 12, safePage * 12 + 12).map((r) => (
              <tr key={r.period} tabIndex={0}>
                <td>
                  <span className="period-chip">
                    {String(r.period).padStart(2, "0")}
                  </span>
                </td>
                <td>{money(r.payment)}</td>
                <td>{money(r.principal)}</td>
                <td>{money(r.interest)}</td>
                <td>{money(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Round half up · 2 decimal places · final payment adjusted</span>
        <div>
          <button
            title="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {safePage + 1} / {maxPage + 1}
          </span>
          <button
            title="Next page"
            disabled={safePage >= maxPage}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
