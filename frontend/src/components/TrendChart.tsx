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
    name: t.topic,
    score: t.engagement_score,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="score" fill="#1890ff" />
      </BarChart>
    </ResponsiveContainer>
  );
}
