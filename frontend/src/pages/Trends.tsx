import { useEffect, useState } from "react";
import { Empty, Spin } from "antd";
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
}

const momentumClass: Record<string, string> = {
  rising: "momentum-rising",
  stable: "momentum-stable",
  declining: "momentum-declining",
};

const scoreColor = (score: number) => {
  if (score >= 85) return "var(--color-primary)";
  if (score >= 70) return "var(--color-accent)";
  return "var(--color-info)";
};

export default function Trends() {
  const [results, setResults] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/insights/trends").then((res) => {
      setResults(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>;
  if (!results.length) return <Empty description="No trend data yet. Run a scrape task and trigger trends analysis." />;

  const latest = results[0];
  const trends = latest.details.trends || [];

  return (
    <>
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="card-title">Summary</div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{latest.summary}</p>
      </div>

      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="card-title">Engagement Scores</div>
        <TrendChart trends={trends} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {trends.map((t, i) => (
          <div key={i} className="content-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{t.topic}</span>
              <span className={`pill ${momentumClass[t.momentum] || ""}`}>
                {t.momentum === "rising" ? "↑" : t.momentum === "declining" ? "↓" : "—"} {t.momentum}
              </span>
            </div>
            {t.evidence?.map((e, j) => (
              <p key={j} style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{e}</p>
            ))}
            <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(t.engagement_score), marginTop: 8 }}>
              {t.engagement_score}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
