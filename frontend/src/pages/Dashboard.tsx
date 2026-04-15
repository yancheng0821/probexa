import { useEffect, useState } from "react";
import { Table } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/client";

interface Task {
  id: string;
  keyword: string;
  platform: string;
  status: string;
  total_items: number;
  created_at: string;
}

const platformPill: Record<string, string> = {
  tiktok: "pill-tiktok",
  youtube: "pill-youtube",
  reddit: "pill-reddit",
  amazon: "pill-amazon",
};

const statusPill: Record<string, string> = {
  pending: "pill-pending",
  running: "pill-running",
  completed: "pill-completed",
  failed: "pill-failed",
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks?limit=10").then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalItems = tasks.reduce((sum, t) => sum + t.total_items, 0);
  const runningCount = tasks.filter((t) => t.status === "running").length;

  const stats = [
    { label: "Total Tasks", value: tasks.length, color: "var(--color-primary)", change: `${completedCount} completed` },
    { label: "Items Scraped", value: totalItems.toLocaleString(), color: "var(--color-accent)", change: `${runningCount} running` },
    { label: "Pain Points", value: "—", color: "var(--color-danger)", change: "Run analysis" },
    { label: "Rising Trends", value: "—", color: "var(--color-success)", change: "Run analysis" },
  ];

  const chartData = [
    { day: "Mon", items: 120 },
    { day: "Tue", items: 230 },
    { day: "Wed", items: 180 },
    { day: "Thu", items: 340 },
    { day: "Fri", items: 280 },
    { day: "Sat", items: 150 },
    { day: "Sun", items: totalItems || 200 },
  ];

  const columns = [
    { title: "Keyword", dataIndex: "keyword", key: "keyword", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: "Platform", dataIndex: "platform", key: "platform", render: (v: string) => <span className={`pill ${platformPill[v] || ""}`}>{v}</span> },
    { title: "Status", dataIndex: "status", key: "status", render: (v: string) => <span className={`pill ${statusPill[v] || ""}`}>{v}</span> },
    { title: "Items", dataIndex: "total_items", key: "total_items", render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span> },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-change" style={{ color: "var(--color-success)" }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="content-card">
          <div className="card-title">Scraping Activity (7 days)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
              </defs>
              <Bar dataKey="items" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="content-card">
          <div className="card-title">By Platform</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {[
              { name: "TikTok", color: "#6366f1", pct: 68 },
              { name: "YouTube", color: "#f43f5e", pct: 18 },
              { name: "Reddit", color: "#f97316", pct: 10 },
              { name: "Amazon", color: "#10b981", pct: 4 },
            ].map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: p.color, borderRadius: "50%", display: "inline-block" }} />
                    {p.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p.pct}%</span>
                </div>
                <div style={{ width: "100%", height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                  <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title">Recent Tasks</div>
        <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} pagination={false} size="small" />
      </div>
    </>
  );
}
