import { useEffect, useState } from "react";
import { Card, Empty, Spin, Tag } from "antd";
import TrendChart from "../components/TrendChart";
import api from "../api/client";

interface TrendResult {
  id: string;
  summary: string;
  details: {
    trends?: Array<{
      topic: string;
      momentum: string;
      engagement_score: number;
      evidence?: string[];
    }>;
  };
  created_at: string;
}

export default function Trends() {
  const [results, setResults] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/trends").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;
  if (!results.length) return <Empty description="No trend data yet. Run a scrape task and trigger trends analysis." />;

  const latest = results[0];
  const trends = latest.details.trends || [];

  const momentumColor: Record<string, string> = { rising: "green", stable: "blue", declining: "red" };

  return (
    <>
      <Card title="Trend Overview" style={{ marginBottom: 16 }}>
        <p>{latest.summary}</p>
      </Card>
      <Card title="Engagement Scores">
        <TrendChart trends={trends} />
      </Card>
      <Card title="Details" style={{ marginTop: 16 }}>
        {trends.map((t, i) => (
          <Card.Grid key={i} style={{ width: "50%" }}>
            <h4>{t.topic}</h4>
            <Tag color={momentumColor[t.momentum]}>{t.momentum}</Tag>
            <p>Score: {t.engagement_score}</p>
            {t.evidence?.map((e, j) => <p key={j} style={{ color: "#888" }}>{e}</p>)}
          </Card.Grid>
        ))}
      </Card>
    </>
  );
}
