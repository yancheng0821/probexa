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
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" dataKey="x" name="Frequency" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} label={{ value: "Frequency →", position: "bottom", fontSize: 11, fill: "#888" }} />
        <YAxis type="number" dataKey="y" name="Severity" domain={[0, 10]} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} label={{ value: "Severity →", angle: -90, position: "insideLeft", fontSize: 11, fill: "#888" }} />
        <ZAxis type="number" dataKey="z" range={[80, 600]} />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ background: "#fff", padding: 10, borderRadius: 8, border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>Frequency: {d.x} · Severity: {d.y}</div>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#f43f5e" fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
