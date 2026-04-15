import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

interface PainPoint {
  issue: string;
  frequency: number;
  severity: number;
}

interface Props {
  painPoints: PainPoint[];
}

export default function PainPointMatrix({ painPoints }: Props) {
  const data = painPoints.map((p) => ({
    x: p.frequency,
    y: p.severity,
    z: p.frequency * p.severity,
    name: p.issue,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Frequency" />
        <YAxis type="number" dataKey="y" name="Severity" domain={[0, 10]} />
        <ZAxis type="number" dataKey="z" range={[100, 1000]} />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ background: "#fff", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}>
                <strong>{d.name}</strong>
                <br />
                Frequency: {d.x} | Severity: {d.y}
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#ff4d4f" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
