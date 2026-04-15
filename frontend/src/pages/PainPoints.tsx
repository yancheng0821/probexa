import { useEffect, useState } from "react";
import { Card, Empty, Spin, Table } from "antd";
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

  if (loading) return <Spin />;
  if (!results.length) return <Empty description="No pain point data yet." />;

  const latest = results[0];
  const points = latest.details.pain_points || [];

  const columns = [
    { title: "Issue", dataIndex: "issue", key: "issue" },
    { title: "Frequency", dataIndex: "frequency", key: "frequency", sorter: (a: { frequency: number }, b: { frequency: number }) => a.frequency - b.frequency },
    { title: "Severity", dataIndex: "severity", key: "severity", sorter: (a: { severity: number }, b: { severity: number }) => a.severity - b.severity },
    {
      title: "Sample Quotes",
      dataIndex: "sample_quotes",
      key: "sample_quotes",
      render: (quotes: string[]) => quotes?.map((q, i) => <div key={i} style={{ color: "#888" }}>"{q}"</div>),
    },
  ];

  return (
    <>
      <Card title="Frequency vs Severity Matrix" style={{ marginBottom: 16 }}>
        <PainPointMatrix painPoints={points} />
      </Card>
      <Card title={`Pain Points (${points.length})`}>
        <Table dataSource={points} columns={columns} rowKey="issue" pagination={false} />
      </Card>
    </>
  );
}
