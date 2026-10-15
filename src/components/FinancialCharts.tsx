import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { LoanRow } from "../engine/finance";
export default function FinancialCharts({
  rows,
  kind = "balance",
}: {
  rows: LoanRow[];
  kind?: "balance" | "split";
}) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={245}>
        {kind === "balance" ? (
          <AreaChart data={rows}>
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b58d4c" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#b58d4c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              vertical={false}
              stroke="#e9e8e3"
            />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#8a8e8a" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000000
                  ? `${v / 1000000}m`
                  : v >= 1000
                    ? `${v / 1000}k`
                    : v
              }
              tick={{ fontSize: 11, fill: "#8a8e8a" }}
              width={48}
            />
            <Tooltip
              formatter={(v) =>
                Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })
              }
              labelFormatter={(v) => `Payment ${v}`}
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Remaining balance"
              stroke="#b58d4c"
              strokeWidth={2.5}
              fill="url(#balanceFill)"
            />
          </AreaChart>
        ) : (
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={55} />
            <Tooltip
              formatter={(v) =>
                Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })
              }
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="principal"
              name="Principal"
              stackId="a"
              fill="#b58d4c"
              radius={[0, 0, 3, 3]}
            />
            <Bar
              dataKey="interest"
              name="Interest"
              stackId="a"
              fill="#ded2ba"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
