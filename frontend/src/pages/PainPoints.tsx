import { useEffect, useState } from "react";
import { Empty, Spin, Table } from "antd";
import PainPointMatrix from "../components/PainPointMatrix";
import api from "../api/client";

interface PainPointResult {
  id: string;
  summary: string;
  details: {
    pain_points?: Array<{
      issue: string;
      frequency: number;
      severity: number;
      sample_quotes?: string[];
    }>;
  };
}

export default function PainPoints() {
  const [results, setResults] = useState<PainPointResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/pain-points").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>;
  if (!results.length) return <Empty description="No pain point data yet." />;

  const latest = results[0];
  const points = latest.details.pain_points || [];

  const severityDots = (n: number) => {
    const filled = Math.round(n / 2.5);
    return "●".repeat(filled) + "○".repeat(4 - filled);
  };

  const columns = [
    { title: "Issue", dataIndex: "issue", key: "issue", render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    {
      title: "Frequency", dataIndex: "frequency", key: "frequency",
      sorter: (a: { frequency: number }, b: { frequency: number }) => a.frequency - b.frequency,
      render: (v: number) => <span style={{ fontWeight: 700, color: v > 30 ? "var(--color-danger)" : v > 15 ? "var(--color-warning)" : "var(--color-text)" }}>{v}</span>,
    },
    {
      title: "Severity", dataIndex: "severity", key: "severity",
      sorter: (a: { severity: number }, b: { severity: number }) => a.severity - b.severity,
      render: (v: number) => <span style={{ color: v >= 7 ? "var(--color-danger)" : "var(--color-warning)", letterSpacing: 2 }}>{severityDots(v)}</span>,
    },
    {
      title: "Sample Quotes", dataIndex: "sample_quotes", key: "sample_quotes",
      render: (quotes: string[]) => (
        <div>{quotes?.slice(0, 1).map((q, i) => (
          <span key={i} style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic" }}>"{q}"</span>
        ))}</div>
      ),
    },
  ];

  return (
    <>
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="card-title">Frequency × Severity Matrix</div>
        <PainPointMatrix painPoints={points} />
      </div>
      <div className="content-card">
        <div className="card-title">Pain Points ({points.length})</div>
        <Table dataSource={points} columns={columns} rowKey="issue" pagination={false} size="small" />
      </div>
    </>
  );
}
