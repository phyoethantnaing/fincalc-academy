import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from "recharts";
export default function GrowthChart({
  data,
  label,
  investment,
}: {
  data: { period: number; value: number }[];
  label: string;
  investment: boolean;
}) {
  const common = { data, margin: { top: 10, right: 30, left: 10, bottom: 5 } };
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e8ecde" />
      <XAxis
        dataKey="period"
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 10, fill: "#8e9c7b" }}
      />
      <YAxis
        tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : v)}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 10, fill: "#8e9c7b" }}
      />
      <Tooltip
        formatter={(v) =>
          Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })
        }
        labelFormatter={(v) => `Period ${v}`}
      />
    </>
  );
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={245}>
        {investment ? (
          <BarChart {...common}>
            {axes}
            <ReferenceLine y={0} stroke="#b1bb9d" />
            <Bar dataKey="value" name={label} radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.value < 0 ? "#c7aa79" : "#94a77c"} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart {...common}>
            {axes}
            <defs>
              <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#98ab81" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#98ab81" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              name={label}
              stroke="#96a77d"
              strokeWidth={2.5}
              fill="url(#growthArea)"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
