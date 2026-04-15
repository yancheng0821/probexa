import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Trend {
  topic: string;
  engagement_score: number;
}

interface Props {
  trends: Trend[];
}

export default function TrendChart({ trends }: Props) {
  const data = trends.map((t) => ({
    name: t.topic.length > 15 ? t.topic.substring(0, 15) + "…" : t.topic,
    score: t.engagement_score,
    fullName: t.topic,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
          formatter={(value) => [value, "Score"]}
        />
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>
        <Bar dataKey="score" fill="url(#trendGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
